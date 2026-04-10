const fs = require('fs');
const { faker } = require('@faker-js/faker');

const TOTAL_DOCENTES = 5000;
const TOTAL_MATERIAS = 100;
const ASIGNACIONES_POR_DOCENTE = 20;

const sqlFile = fs.createWriteStream('docencia.sql');

sqlFile.write(`-- MariaDB: Docencia
DROP TABLE IF EXISTS asignaciones;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS materias;

CREATE TABLE docentes (
    id INT PRIMARY KEY,
    nombre VARCHAR(255),
    departamento VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE materias (
    id INT PRIMARY KEY,
    nombre VARCHAR(255),
    horas INT,
    nivel VARCHAR(50)
);

CREATE TABLE asignaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    docente_id INT,
    materia_id INT,
    periodo VARCHAR(50)
);

`);

console.log('Generando docentes...');
for (let i = 1; i <= TOTAL_DOCENTES; i++) {
    const nombre = faker.person.fullName().replace(/'/g, "''");
    const depto = faker.commerce.department().replace(/'/g, "''");
    const email = faker.internet.email().replace(/'/g, "''");
    sqlFile.write(`INSERT INTO docentes (id, nombre, departamento, email) VALUES (${i}, '${nombre}', '${depto}', '${email}');\n`);
    if (i % 1000 === 0) console.log(`${i} docentes escritos`);
}

console.log('Generando materias...');
for (let i = 1; i <= TOTAL_MATERIAS; i++) {
    const nombre = faker.lorem.words(2).replace(/'/g, "''");
    const horas = faker.number.int({ min: 30, max: 120 });
    const nivel = faker.helpers.arrayElement(['básico', 'intermedio', 'avanzado']);
    sqlFile.write(`INSERT INTO materias (id, nombre, horas, nivel) VALUES (${i}, '${nombre}', ${horas}, '${nivel}');\n`);
}

console.log('Generando asignaciones...');
let asignacionId = 1;
for (let docenteId = 1; docenteId <= TOTAL_DOCENTES; docenteId++) {
    for (let k = 0; k < ASIGNACIONES_POR_DOCENTE; k++) {
        const materiaId = faker.number.int({ min: 1, max: TOTAL_MATERIAS });
        const periodo = `2025-${faker.helpers.arrayElement(['A', 'B'])}`;
        sqlFile.write(`INSERT INTO asignaciones (id, docente_id, materia_id, periodo) VALUES (${asignacionId++}, ${docenteId}, ${materiaId}, '${periodo}');\n`);
    }
    if (docenteId % 500 === 0) console.log(`${docenteId} docentes con asignaciones`);
}

sqlFile.end(() => {
    console.log('Archivo docencia.sql generado.');
    validarSQL('docencia.sql', 'mariadb');
});

function validarSQL(ruta, motor) {
    const contenido = fs.readFileSync(ruta, 'utf8');
    let valido = true;
    const errores = [];

    if (motor === 'mariadb') {
        if (!contenido.includes('AUTO_INCREMENT')) {
            errores.push('No se encontró AUTO_INCREMENT (esperado en MariaDB)');
            valido = false;
        }
        if (contenido.includes('SERIAL') || contenido.includes('IDENTITY')) {
            errores.push('Contiene palabras clave de PostgreSQL o MSSQL');
            valido = false;
        }
        // Verificar que no usa comillas dobles para strings (MariaDB prefiere comillas simples, pero ambas funcionan)
        if (contenido.match(/VALUES\s*\(.*".*".*\)/)) {
            errores.push('Se detectaron comillas dobles en valores, puede causar problemas en modo estricto');
            valido = false;
        }
    }
    const asignacionesInsert = (contenido.match(/INSERT INTO asignaciones/g) || []).length;
    if (asignacionesInsert < TOTAL_DOCENTES * ASIGNACIONES_POR_DOCENTE) {
        errores.push(`Se esperaban ${TOTAL_DOCENTES * ASIGNACIONES_POR_DOCENTE} asignaciones, se encontraron ${asignacionesInsert}`);
        valido = false;
    }

    if (valido) console.log(`Validación exitosa: ${ruta} es compatible con ${motor.toUpperCase()}`);
    else { console.error(`Validación fallida para ${ruta}:`); errores.forEach(e => console.error(`   - ${e}`)); }
}
