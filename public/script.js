document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Conecta al servidor Socket.IO
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    // Función para añadir mensajes al chat
    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll al último mensaje
    }

    // Manejador para el botón de enviar mensaje
    sendMessageBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage('user', message); // Muestra el mensaje del usuario
            socket.emit('chat message', message); // Envía el mensaje al servidor
            messageInput.value = ''; // Limpia el input
        }
    });

    // Manejador para la tecla Enter en el input
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageBtn.click(); // Simula un click en el botón Enviar
        }
    });

    // Escuchar mensajes del servidor (respuestas de OLLIE)
    socket.on('chat message', (msg) => {
        addMessage('ollie', msg); // Muestra la respuesta de OLLIE
    });

    // Mensaje de bienvenida inicial (opcional)
    addMessage('ollie', '¡Hola! Soy OLLIE, tu agente de ventas. ¿En qué puedo ayudarte hoy?');
});