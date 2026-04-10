const fs = require('fs');
const { faker } = require('@faker-js/faker');

const TOTAL_DISPOSITIVOS = 20000;
const LOGS_POR_DISPOSITIVO = 5;

const sqlFile = fs.createWriteStream('dispositivos.sql');

sqlFile.write(`-- MSSQL: Dispositivos
IF OBJECT_ID('metricas', 'U') IS NOT NULL DROP TABLE metricas;
IF OBJECT_ID('logs', 'U') IS NOT NULL DROP TABLE logs;
IF OBJECT_ID('dispositivos', 'U') IS NOT NULL DROP TABLE dispositivos;

CREATE TABLE dispositivos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100),
    ubicacion NVARCHAR(100),
    estado NVARCHAR(20)
);

CREATE TABLE logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    dispositivo_id INT,
    mensaje NVARCHAR(255),
    fecha DATETIME
);

CREATE TABLE metricas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    dispositivo_id INT,
    valor FLOAT,
    unidad NVARCHAR(20)
);

`);

console.log('Generando dispositivos...');
for (let i = 1; i <= TOTAL_DISPOSITIVOS; i++) {
    const nombre = faker.commerce.productName().replace(/'/g, "''");
    const ubicacion = faker.location.city().replace(/'/g, "''");
    const estado = faker.helpers.arrayElement(['activo', 'inactivo', 'mantenimiento']);
    sqlFile.write(`INSERT INTO dispositivos (nombre, ubicacion, estado) VALUES ('${nombre}', '${ubicacion}', '${estado}');\n`);
    if (i % 5000 === 0) console.log(`${i} dispositivos escritos`);
}

console.log('Generando logs...');
for (let dispId = 1; dispId <= TOTAL_DISPOSITIVOS; dispId++) {
    for (let k = 0; k < LOGS_POR_DISPOSITIVO; k++) {
        const mensaje = faker.lorem.sentence().replace(/'/g, "''");
        const fecha = faker.date.recent({ days: 7 }).toISOString().slice(0,19).replace('T', ' ');
        sqlFile.write(`INSERT INTO logs (dispositivo_id, mensaje, fecha) VALUES (${dispId}, '${mensaje}', '${fecha}');\n`);
    }
    if (dispId % 2000 === 0) console.log(`${dispId} dispositivos con logs`);
}

// Métricas opcionales
for (let dispId = 1; dispId <= TOTAL_DISPOSITIVOS; dispId++) {
    for (let m = 0; m < 2; m++) {
        const valor = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        const unidad = faker.helpers.arrayElement(['°C', '%', 'kPa', 'V']);
        sqlFile.write(`INSERT INTO metricas (dispositivo_id, valor, unidad) VALUES (${dispId}, ${valor}, '${unidad}');\n`);
    }
}

sqlFile.end(() => {
    console.log('Archivo dispositivos.sql generado.');
    validarSQL('dispositivos.sql', 'mssql');
});

function validarSQL(ruta, motor) {
    const contenido = fs.readFileSync(ruta, 'utf8');
    let valido = true;
    const errores = [];

    if (motor === 'mssql') {
        if (!contenido.includes('IDENTITY')) {
            errores.push('No se encontró IDENTITY (auto incremental de MSSQL)');
            valido = false;
        }
        if (contenido.includes('SERIAL') || contenido.includes('AUTO_INCREMENT')) {
            errores.push('Contiene palabras clave de PostgreSQL o MariaDB');
            valido = false;
        }
        // Verificar que las fechas usan formato DATETIME válido (YYYY-MM-DD HH:MM:SS)
        if (contenido.match(/'\d{4}-\d{2}-\d{2}T/)) {
            errores.push('Se detectó formato ISO con T (usar espacio en lugar de T para MSSQL)');
            valido = false;
        }
    }
    const logsInsert = (contenido.match(/INSERT INTO logs/g) || []).length;
    if (logsInsert < TOTAL_DISPOSITIVOS * LOGS_POR_DISPOSITIVO) {
        errores.push(`Faltan logs: esperados ${TOTAL_DISPOSITIVOS * LOGS_POR_DISPOSITIVO}, obtenidos ${logsInsert}`);
        valido = false;
    }

    if (valido) console.log(`Validación exitosa: ${ruta} compatible con MSSQL`);
    else { console.error(`Falló: ${errores.join(', ')}`); }
}
