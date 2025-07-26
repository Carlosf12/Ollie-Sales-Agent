const ExcelJS = require('exceljs');
const path = require('path');

let loadedProducts = [];

async function loadProductsFromExcel() {
    const filePath = path.join(__dirname, '..', '..', 'data', 'products.xlsx');
    const workbook = new ExcelJS.Workbook();

    try {
        console.log(`Intentando cargar productos desde: ${filePath}`);
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            console.warn('Advertencia: No se encontró la primera hoja en products.xlsx. Asegúrate de que no esté vacía.');
            loadedProducts = [];
            return [];
        }

        const products = [];
        let isFirstRow = true;
        const headerMap = {};

        // Calcula el número total de filas de datos (excluyendo el encabezado)
        const totalRowsInFile = worksheet.actualRowCount > 0 ? worksheet.actualRowCount - 1 : 0;
        // Calcula el 10% de las filas de datos. Asegura que sea al menos 1 si hay filas.
        const limitRowsToLoad = totalRowsInFile > 0 ? Math.max(1, Math.ceil(totalRowsInFile * 0.10)) : 0;
        
        let loadedCount = 0; // Contador de productos que realmente hemos cargado

        worksheet.eachRow((row, rowNumber) => {
            if (isFirstRow) {
                row.eachCell((cell, colNumber) => {
                    const header = cell.value ? String(cell.value).toLowerCase().replace(/ /g, '') : '';
                    if (header === 'id') headerMap[colNumber] = 'id';
                    else if (header === 'name') headerMap[colNumber] = 'name';
                    else if (header === 'size') headerMap[colNumber] = 'size';
                    else if (header === 'category') headerMap[colNumber] = 'category';
                    else if (header === 'price') headerMap[colNumber] = 'price';
                    else if (header === 'stock') headerMap[colNumber] = 'stock';
                    else if (header === 'description') headerMap[colNumber] = 'description';
                });
                isFirstRow = false;
                return;
            }

            // Detener la carga si ya hemos alcanzado el límite
            if (loadedCount >= limitRowsToLoad) {
                return false; // Retorna false para detener eachRow
            }

            const product = {};
            let hasValidData = false;

            row.eachCell((cell, colNumber) => {
                const key = headerMap[colNumber];
                if (key) {
                    let value = cell.value;
                    if (key === 'id' || key === 'price' || key === 'quantity') {
                        value = parseFloat(value);
                        if (isNaN(value)) value = 0;
                    }
                    product[key] = value;
                    if (value !== null && value !== undefined && String(value).trim() !== '') {
                        hasValidData = true;
                    }
                }
            });

            if (product.id !== undefined && product.id !== null && hasValidData) {
                products.push(product);
                loadedCount++; // Incrementa el contador de productos cargados
            }
        });

        loadedProducts = products;
        console.log(`✅ Productos cargados desde ${filePath}: ${loadedProducts.length}.`);
        return loadedProducts;

    } catch (error) {
        console.error(`❌ Error al cargar productos desde ${filePath}:`, error.message);
        console.error('Asegúrate de que el archivo products.xlsx exista en la carpeta /data y tenga el formato correcto (ej. encabezados en la primera fila).');
        loadedProducts = [];
        return [];
    }
}

async function getProducts() {
    if (loadedProducts.length === 0) {
        await loadProductsFromExcel();
    }
    return loadedProducts;
}

module.exports = {
    loadProductsFromExcel,
    getProducts
};