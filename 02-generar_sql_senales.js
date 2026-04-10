const fs = require('fs');
const { faker } = require('@faker-js/faker');

const TOTAL_SENALES = 100;
const MUESTRAS_POR_SENAL = 1000;

const sqlFile = fs.createWriteStream('senales.sql');

sqlFile.write(`-- PostgreSQL: Señales
DROP TABLE IF EXISTS resultados_laplace;
DROP TABLE IF EXISTS muestras;
DROP TABLE IF EXISTS senales;

CREATE TABLE senales (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    amplitud FLOAT,
    decaimiento FLOAT,
    tipo TEXT
);

CREATE TABLE muestras (
    id SERIAL PRIMARY KEY,
    senal_id INT REFERENCES senales(id),
    n INT,
    valor FLOAT,
    timestamp INT
);

CREATE TABLE resultados_laplace (
    id SERIAL PRIMARY KEY,
    senal_id INT REFERENCES senales(id),
    valor_z FLOAT,
    resultado FLOAT,
    fecha_calculo DATE
);

`);

console.log('Generando señales...');
for (let i = 1; i <= TOTAL_SENALES; i++) {
    const nombre = faker.lorem.word().replace(/'/g, "''");
    const amplitud = faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 });
    const decaimiento = faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 });
    const tipo = faker.helpers.arrayElement(['discreta', 'continua']);
    sqlFile.write(`INSERT INTO senales (nombre, amplitud, decaimiento, tipo) VALUES ('${nombre}', ${amplitud}, ${decaimiento}, '${tipo}');\n`);
}

console.log('Generando muestras...');
let count = 0;
for (let senalId = 1; senalId <= TOTAL_SENALES; senalId++) {
    for (let n = 0; n < MUESTRAS_POR_SENAL; n++) {
        const valor = Math.exp(-0.5 * n) * (1 + Math.random() * 0.1);
        const timestamp = n;
        sqlFile.write(`INSERT INTO muestras (senal_id, n, valor, timestamp) VALUES (${senalId}, ${n}, ${valor.toFixed(6)}, ${timestamp});\n`);
        count++;
        if (count % 20000 === 0) console.log(`${count} muestras escritas`);
    }
}

sqlFile.end(() => {
    console.log('Archivo senales.sql generado.');
    validarSQL('senales.sql', 'postgresql');
});

function validarSQL(ruta, motor) {
    const contenido = fs.readFileSync(ruta, 'utf8');
    let valido = true;
    const errores = [];

    if (motor === 'postgresql') {
        if (!contenido.includes('SERIAL')) {
            errores.push('No se encontró SERIAL');
            valido = false;
        }
        if (contenido.includes('AUTO_INCREMENT') || contenido.includes('IDENTITY')) {
            errores.push('Contiene palabras clave de otros motores');
            valido = false;
        }
    }
    const muestrasInsert = (contenido.match(/INSERT INTO muestras/g) || []).length;
    if (muestrasInsert < TOTAL_SENALES * MUESTRAS_POR_SENAL) {
        errores.push(`Se esperaban ${TOTAL_SENALES * MUESTRAS_POR_SENAL} muestras, se encontraron ${muestrasInsert}`);
        valido = false;
    }

    if (valido) console.log(`Validación exitosa: ${ruta} es compatible con ${motor.toUpperCase()}`);
    else { console.error(`Validación fallida para ${ruta}:`); errores.forEach(e => console.error(`   - ${e}`)); }
}
