const fs = require('fs');
const { faker } = require('@faker-js/faker');

const TOTAL_ESTUDIANTES = 100000;
const TOTAL_EVALUACIONES = 100;
const CALIFICACIONES_POR_ESTUDIANTE = 3;

const sqlFile = fs.createWriteStream('evaluaciones.sql');

sqlFile.write(`-- PostgreSQL: Evaluaciones
DROP TABLE IF EXISTS calificaciones;
DROP TABLE IF EXISTS estudiantes;
DROP TABLE IF EXISTS evaluaciones;

CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    grupo TEXT
);

CREATE TABLE evaluaciones (
    id SERIAL PRIMARY KEY,
    titulo TEXT,
    fecha DATE
);

CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    estudiante_id INT REFERENCES estudiantes(id),
    evaluacion_id INT REFERENCES evaluaciones(id),
    calificacion INT
);

`);

console.log('Generando estudiantes...');
for (let i = 1; i <= TOTAL_ESTUDIANTES; i++) {
    const nombre = faker.person.fullName().replace(/'/g, "''");
    const grupo = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
    sqlFile.write(`INSERT INTO estudiantes (nombre, grupo) VALUES ('${nombre}', '${grupo}');\n`);
    if (i % 10000 === 0) console.log(`${i} estudiantes escritos`);
}

console.log('Generando evaluaciones...');
for (let i = 1; i <= TOTAL_EVALUACIONES; i++) {
    const titulo = `Examen ${faker.lorem.word()}`.replace(/'/g, "''");
    const fecha = faker.date.between({ from: '2025-01-01', to: '2025-12-31' }).toISOString().slice(0,10);
    sqlFile.write(`INSERT INTO evaluaciones (titulo, fecha) VALUES ('${titulo}', '${fecha}');\n`);
}

console.log('Generando calificaciones...');
let califCount = 0;
for (let estId = 1; estId <= TOTAL_ESTUDIANTES; estId++) {
    const evaluacionesUsadas = new Set();
    while (evaluacionesUsadas.size < CALIFICACIONES_POR_ESTUDIANTE) {
        const evId = faker.number.int({ min: 1, max: TOTAL_EVALUACIONES });
        if (!evaluacionesUsadas.has(evId)) {
            evaluacionesUsadas.add(evId);
            const calif = faker.number.int({ min: 0, max: 100 });
            sqlFile.write(`INSERT INTO calificaciones (estudiante_id, evaluacion_id, calificacion) VALUES (${estId}, ${evId}, ${calif});\n`);
            califCount++;
            if (califCount % 50000 === 0) console.log(`${califCount} calificaciones escritas`);
        }
    }
}

sqlFile.end(() => {
    console.log('Archivo evaluaciones.sql generado.');
    validarSQL('evaluaciones.sql', 'postgresql');
});

function validarSQL(ruta, motor) {
    const contenido = fs.readFileSync(ruta, 'utf8');
    let valido = true;
    const errores = [];

    if (motor === 'postgresql') {
        if (!contenido.includes('SERIAL')) errores.push('No se encontró SERIAL');
        if (contenido.includes('AUTO_INCREMENT') || contenido.includes('IDENTITY')) errores.push('Palabras clave de otros motores');
    }
    const califInsert = (contenido.match(/INSERT INTO calificaciones/g) || []).length;
    if (califInsert < TOTAL_ESTUDIANTES * CALIFICACIONES_POR_ESTUDIANTE) {
        errores.push(`Faltan calificaciones: esperadas ${TOTAL_ESTUDIANTES * CALIFICACIONES_POR_ESTUDIANTE}, obtenidas ${califInsert}`);
        valido = false;
    }

    if (valido) console.log(`Validación exitosa: ${ruta} compatible con PostgreSQL`);
    else { console.error(`Falló: ${errores.join(', ')}`); }
}
