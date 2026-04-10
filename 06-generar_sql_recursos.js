const fs = require('fs');
const { faker } = require('@faker-js/faker');

const TOTAL_RECURSOS = 100000;
const TOTAL_CATEGORIAS = 50;
const RELACIONES_POR_RECURSO = 2;

const sqlFile = fs.createWriteStream('recursos.sql');

sqlFile.write(`-- MariaDB: Recursos
DROP TABLE IF EXISTS recurso_categoria;
DROP TABLE IF EXISTS recursos;
DROP TABLE IF EXISTS categorias;

CREATE TABLE recursos (
    id INT PRIMARY KEY,
    titulo VARCHAR(255),
    autor VARCHAR(255)
);

CREATE TABLE categorias (
    id INT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion VARCHAR(255)
);

CREATE TABLE recurso_categoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recurso_id INT,
    categoria_id INT
);

`);

console.log('Generando categorías...');
for (let i = 1; i <= TOTAL_CATEGORIAS; i++) {
    const nombre = faker.commerce.department().replace(/'/g, "''");
    const desc = faker.lorem.sentence().replace(/'/g, "''");
    sqlFile.write(`INSERT INTO categorias (id, nombre, descripcion) VALUES (${i}, '${nombre}', '${desc}');\n`);
}

console.log('Generando recursos...');
for (let i = 1; i <= TOTAL_RECURSOS; i++) {
    const titulo = faker.lorem.words(3).replace(/'/g, "''");
    const autor = faker.person.fullName().replace(/'/g, "''");
    sqlFile.write(`INSERT INTO recursos (id, titulo, autor) VALUES (${i}, '${titulo}', '${autor}');\n`);
    if (i % 10000 === 0) console.log(`${i} recursos escritos`);
}

console.log('Generando relaciones...');
let relId = 1;
for (let recId = 1; recId <= TOTAL_RECURSOS; recId++) {
    for (let r = 0; r < RELACIONES_POR_RECURSO; r++) {
        const catId = faker.number.int({ min: 1, max: TOTAL_CATEGORIAS });
        sqlFile.write(`INSERT INTO recurso_categoria (id, recurso_id, categoria_id) VALUES (${relId++}, ${recId}, ${catId});\n`);
    }
    if (recId % 10000 === 0) console.log(`${recId} recursos relacionados`);
}

sqlFile.end(() => {
    console.log('Archivo recursos.sql generado.');
    validarSQL('recursos.sql', 'mariadb');
});

function validarSQL(ruta, motor) {
    const contenido = fs.readFileSync(ruta, 'utf8');
    let valido = true;
    const errores = [];

    if (motor === 'mariadb') {
        if (!contenido.includes('AUTO_INCREMENT')) errores.push('No se encontró AUTO_INCREMENT');
        if (contenido.includes('SERIAL') || contenido.includes('IDENTITY')) errores.push('Palabras clave de otros motores');
    }
    const recursosInsert = (contenido.match(/INSERT INTO recursos/g) || []).length;
    if (recursosInsert < TOTAL_RECURSOS) errores.push(`Faltan recursos: esperados ${TOTAL_RECURSOS}, obtenidos ${recursosInsert}`);

    if (errores.length === 0) console.log(`Validación exitosa: ${ruta} compatible con MariaDB`);
    else { console.error(`Falló: ${errores.join(', ')}`); }
}
