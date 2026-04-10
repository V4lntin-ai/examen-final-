const fs = require('fs');
const { faker } = require('@faker-js/faker');

const TOTAL_PROYECTOS = 10000;
const TAREAS_POR_PROYECTO = 10;

const sqlFile = fs.createWriteStream('proyectos.sql');

sqlFile.write(`-- PostgreSQL: Proyectos
DROP TABLE IF EXISTS registros_tareas;
DROP TABLE IF EXISTS tareas;
DROP TABLE IF EXISTS proyectos;

CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    estado TEXT,
    fecha_inicio DATE
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    proyecto_id INT REFERENCES proyectos(id),
    titulo TEXT,
    prioridad TEXT
);

CREATE TABLE registros_tareas (
    id SERIAL PRIMARY KEY,
    tarea_id INT REFERENCES tareas(id),
    estado TEXT,
    fecha DATE
);

`);

console.log('Generando proyectos...');
for (let i = 1; i <= TOTAL_PROYECTOS; i++) {
    const nombre = faker.company.catchPhrase().replace(/'/g, "''");
    const estado = faker.helpers.arrayElement(['activo', 'pausado', 'finalizado']);
    const fecha_inicio = faker.date.past(1).toISOString().slice(0,10);
    sqlFile.write(`INSERT INTO proyectos (nombre, estado, fecha_inicio) VALUES ('${nombre}', '${estado}', '${fecha_inicio}');\n`);
    if (i % 1000 === 0) console.log(`${i} proyectos escritos`);
}

console.log('Generando tareas...');
for (let proyId = 1; proyId <= TOTAL_PROYECTOS; proyId++) {
    for (let j = 0; j < TAREAS_POR_PROYECTO; j++) {
        const titulo = faker.lorem.sentence().replace(/'/g, "''");
        const prioridad = faker.helpers.arrayElement(['alta', 'media', 'baja']);
        sqlFile.write(`INSERT INTO tareas (proyecto_id, titulo, prioridad) VALUES (${proyId}, '${titulo}', '${prioridad}');\n`);
    }
    if (proyId % 1000 === 0) console.log(`${proyId} proyectos con tareas`);
}

// Opcional: registros
const totalTareas = TOTAL_PROYECTOS * TAREAS_POR_PROYECTO;
console.log('Generando registros de tareas...');
for (let tid = 1; tid <= totalTareas; tid++) {
    for (let r = 0; r < 2; r++) {
        const estado = faker.helpers.arrayElement(['pendiente', 'en progreso', 'completado']);
        const fecha = faker.date.recent({ days: 30 }).toISOString().slice(0,10);
        sqlFile.write(`INSERT INTO registros_tareas (tarea_id, estado, fecha) VALUES (${tid}, '${estado}', '${fecha}');\n`);
    }
    if (tid % 10000 === 0) console.log(`${tid} tareas con registros`);
}

sqlFile.end(() => {
    console.log('Archivo proyectos.sql generado.');
    validarSQL('proyectos.sql', 'postgresql');
});

function validarSQL(ruta, motor) {
    const contenido = fs.readFileSync(ruta, 'utf8');
    let valido = true;
    const errores = [];

    if (motor === 'postgresql') {
        if (!contenido.includes('SERIAL')) errores.push('No se encontró SERIAL');
        if (contenido.includes('AUTO_INCREMENT') || contenido.includes('IDENTITY')) errores.push('Palabras clave de otros motores');
    }
    const tareasInsert = (contenido.match(/INSERT INTO tareas/g) || []).length;
    if (tareasInsert < TOTAL_PROYECTOS * TAREAS_POR_PROYECTO) errores.push(`Faltan tareas: esperadas ${TOTAL_PROYECTOS * TAREAS_POR_PROYECTO}, obtenidas ${tareasInsert}`);

    if (errores.length === 0) console.log(`Validación exitosa: ${ruta} compatible con PostgreSQL`);
    else { console.error(`Falló: ${errores.join(', ')}`); }
}
