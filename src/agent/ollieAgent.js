const { OpenAI } = require('openai');
const tools = require('./tools'); 

// Configuración del cliente OpenAI para Ollama
const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1', // URL por defecto de Ollama
    apiKey: 'ollama', // Requerido, pero puede ser cualquier valor para Ollama local
});

// Definición de las herramientas que el LLM puede usar
const toolDefinitions = [
    {
        type: 'function',
        function: {
            name: 'displayProducts',
            description: 'Muestra la lista de todos los productos disponibles en el inventario, incluyendo ID, nombre, categoría, precio, cantidad disponible y descripción. Usa esta herramienta cuando el usuario pregunte por productos, stock, el catálogo o quiera ver qué se vende.',
            parameters: {
                type: 'object',
                properties: {}, // No requiere parámetros
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getProductDetails',
            description: 'Obtiene detalles específicos de un producto por su ID. Usa esta herramienta cuando el usuario pregunte sobre un producto específico, su precio, stock o descripción, y proporcione el ID del producto.',
            parameters: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: 'El ID numérico único del producto.',
                    },
                },
                required: ['id'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'addToCart',
            description: 'Añade una cantidad específica de un producto al carrito de compras del usuario. Usa esta herramienta cuando el usuario exprese la intención de comprar un producto o añadirlo a su carrito. Requiere el ID del producto y la cantidad.',
            parameters: {
                type: 'object',
                properties: {
                    productId: {
                        type: 'number',
                        description: 'El ID numérico del producto a añadir al carrito.',
                    },
                    quantity: {
                        type: 'number',
                        description: 'La cantidad del producto a añadir. Por defecto es 1 si no se especifica.',
                        default: 1,
                    },
                },
                required: ['productId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'updateCartItem',
            description: 'Modifica la cantidad de un producto existente en el carrito del usuario, o lo elimina del carrito si la cantidad es 0. Usa esta herramienta cuando el usuario quiera cambiar la cantidad de un ítem en su carrito o removerlo.',
            parameters: {
                type: 'object',
                properties: {
                    productId: {
                        type: 'number',
                        description: 'El ID numérico del producto a actualizar/eliminar en el carrito.',
                    },
                    quantity: {
                        type: 'number',
                        description: 'La nueva cantidad del producto en el carrito. Si es 0, el producto se elimina.',
                    },
                },
                required: ['productId', 'quantity'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'viewCart',
            description: 'Muestra el contenido actual del carrito de compras del usuario, incluyendo los productos, cantidades y el total. Usa esta herramienta cuando el usuario pregunte "¿qué hay en mi carrito?", "ver mi carrito" o similares.',
            parameters: {
                type: 'object',
                properties: {}, // No requiere parámetros
            },
        },
    },
];

// Historial de la conversación para mantener el contexto
const conversationHistory = [
    {
        role: 'system',
        content: `Eres OLLIE, un agente de ventas amable y útil. Tu propósito es ayudar a los clientes con preguntas sobre productos y la gestión de su carrito de compras.
        Tienes acceso a herramientas para mostrar productos, ver detalles de productos, añadir al carrito, actualizar/eliminar ítems del carrito y ver el carrito.
        Siempre intenta ser conversacional y directo. Si una herramienta es llamada y el usuario pregunta sobre algo relacionado, usa el resultado de la herramienta para formar tu respuesta.
        Si necesitas el ID de un producto para una operación (ej. añadir al carrito, ver detalles), y el usuario no lo proporciona, pídeselo de forma educada.
        Los IDs de los productos son números.
        Si la operación de carrito se completa, siempre confirma al usuario el estado actual del carrito o el impacto de su acción.
        Cuando el usuario pida ver el carrito, usa la herramienta "viewCart".
        Cuando el usuario pida ver productos o el catálogo, usa la herramienta "displayProducts".
        Cuando el usuario pida detalles de un producto, usa la herramienta "getProductDetails" y asegúrate de tener el ID.
        Cuando el usuario quiera añadir al carrito, usa la herramienta "addToCart" y asegúrate de tener el ID y la cantidad (si la cantidad no se especifica, asume 1).
        Cuando el usuario quiera actualizar o eliminar del carrito, usa la herramienta "updateCartItem" y asegúrate de tener el ID y la nueva cantidad (0 para eliminar).`,
    },
];

async function chatWithAI(userMessage) {
    conversationHistory.push({ role: 'user', content: userMessage });

    try {
        const response = await openai.chat.completions.create({
            model: 'llama3.2:3b', // Asegúrate de que este modelo esté disponible en tu Ollama
            messages: conversationHistory,
            tools: toolDefinitions,
            tool_choice: 'auto', // Permite que el modelo decida si usar una herramienta o no
        });

        const responseMessage = response.choices[0].message;
        conversationHistory.push(responseMessage); // Añade la respuesta del LLM al historial

        // Verifica si el LLM decidió llamar a una herramienta
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            const toolCalls = responseMessage.tool_calls;
            console.log("OLLIE (ejecutando herramienta): Iniciando llamadas a herramientas desde la respuesta del LLM...");

            let primaryToolOutputContent = ""; // Variable para almacenar la salida principal de la herramienta

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                console.log(`OLLIE (ejecutando herramienta): Llamando a ${functionName} con argumentos: ${JSON.stringify(functionArgs)}`);

                if (typeof tools[functionName] === 'function') {
                    const toolOutput = await tools[functionName](...Object.values(functionArgs));
                    console.log(`OLLIE (salida de herramienta): ${toolOutput}`);

                    // Añade la salida de la herramienta al historial para que el LLM la use
                    conversationHistory.push({
                        tool_call_id: toolCall.id,
                        role: 'tool',
                        name: functionName,
                        content: toolOutput,
                    });

                    // Si es una herramienta de visualización, guarda su salida para la respuesta final al cliente
                    if (['displayProducts', 'getProductDetails', 'viewCart'].includes(functionName)) {
                        primaryToolOutputContent = toolOutput; // Guarda la salida de la herramienta
                    }

                } else {
                    const errorMessage = `Error: La herramienta '${functionName}' no está definida.`;
                    console.error(errorMessage);
                    conversationHistory.push({
                        tool_call_id: toolCall.id,
                        role: 'tool',
                        name: functionName,
                        content: errorMessage,
                    });
                    primaryToolOutputContent = errorMessage; // También guarda el error para mostrar al cliente
                }
            }

            // Después de ejecutar la herramienta(s), haz otra llamada al LLM para obtener la respuesta conversacional
            const finalResponse = await openai.chat.completions.create({ 
                model: 'llama3.2:3b',
                messages: conversationHistory,
            });

            const finalResponseMessage = finalResponse.choices[0].message;
            conversationHistory.push(finalResponseMessage); // Añade la respuesta final al historial

            // Combina la salida de la herramienta con la respuesta conversacional del LLM
            let combinedResponse = "";
            if (primaryToolOutputContent) {
                combinedResponse += primaryToolOutputContent + "\n\n"; // Añade la salida de la herramienta
            }
            combinedResponse += finalResponseMessage.content; // Añade la respuesta conversacional del LLM

            return combinedResponse; // Retorna la respuesta combinada al cliente

        } else {
            // Si no hay llamadas a herramientas, es una respuesta de texto directa
            return responseMessage.content;
        }

    } catch (error) {
        console.error('Error al comunicarse con Ollama:', error.message);
        throw new Error('Ocurrió un error inesperado durante la interacción del chat.');
    }
}

module.exports = { chatWithAI };