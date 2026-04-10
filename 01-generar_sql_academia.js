const fs = require('fs');
const { faker } = require('@faker-js/faker');

const TOTAL_ESTUDIANTES = 100000;
const TOTAL_CURSOS = 500;
const INSCRIPCIONES_POR_ESTUDIANTE = 2;

const sqlFile = fs.createWriteStream('academia.sql');

sqlFile.write(`-- PostgreSQL: Academia
DROP TABLE IF EXISTS inscripciones;
DROP TABLE IF EXISTS estudiantes;
DROP TABLE IF EXISTS cursos;

CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    email TEXT UNIQUE,
    edad INT,
    fecha_registro DATE
);

CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    titulo TEXT,
    creditos INT,
    profesor TEXT
);

CREATE TABLE inscripciones (
    id SERIAL PRIMARY KEY,
    estudiante_id INT REFERENCES estudiantes(id),
    curso_id INT REFERENCES cursos(id),
    fecha DATE,
    estado TEXT
);

`);

console.log('Generando estudiantes...');
for (let i = 1; i <= TOTAL_ESTUDIANTES; i++) {
    const nombre = faker.person.fullName().replace(/'/g, "''");
    const email = faker.internet.email().replace(/'/g, "''");
    const edad = faker.number.int({ min: 18, max: 60 });
    const fecha = faker.date.past(2).toISOString().slice(0,10);
    sqlFile.write(`INSERT INTO estudiantes (nombre, email, edad, fecha_registro) VALUES ('${nombre}', '${email}', ${edad}, '${fecha}');\n`);
    if (i % 10000 === 0) console.log(`${i} estudiantes escritos`);
}

sqlFile.write(`\n-- Cursos\n`);
for (let i = 1; i <= TOTAL_CURSOS; i++) {
    const titulo = faker.lorem.words(2).replace(/'/g, "''");
    const creditos = faker.number.int({ min: 3, max: 8 });
    const profesor = faker.person.fullName().replace(/'/g, "''");
    sqlFile.write(`INSERT INTO cursos (titulo, creditos, profesor) VALUES ('${titulo}', ${creditos}, '${profesor}');\n`);
}

sqlFile.write(`\n-- Inscripciones\n`);
for (let estId = 1; estId <= TOTAL_ESTUDIANTES; estId++) {
    for (let k = 0; k < INSCRIPCIONES_POR_ESTUDIANTE; k++) {
        const cursoId = faker.number.int({ min: 1, max: TOTAL_CURSOS });
        const fecha = faker.date.recent({ days: 30 }).toISOString().slice(0,10);
        const estado = faker.helpers.arrayElement(['activa', 'cancelada', 'finalizada']);
        sqlFile.write(`INSERT INTO inscripciones (estudiante_id, curso_id, fecha, estado) VALUES (${estId}, ${cursoId}, '${fecha}', '${estado}');\n`);
    }
    if (estId % 5000 === 0) console.log(`${estId} estudiantes con inscripciones`);
}

sqlFile.end(() => {
    console.log('Archivo academia.sql generado.');
    validarSQL('academia.sql', 'postgresql');
});

function validarSQL(ruta, motor) {
    const contenido = fs.readFileSync(ruta, 'utf8');
    let valido = true;
    const errores = [];

    if (motor === 'postgresql') {
        if (!contenido.includes('SERIAL') && !contenido.includes('SERIAL PRIMARY KEY')) {
            errores.push('No se encontró SERIAL (clave primaria autoincremental de PostgreSQL)');
            valido = false;
        }
        if (contenido.includes('AUTO_INCREMENT') || contenido.includes('IDENTITY')) {
            errores.push('Contiene palabras clave de otros motores (AUTO_INCREMENT o IDENTITY)');
            valido = false;
        }
        if (contenido.includes('TOP ') || contenido.includes('GO')) {
            errores.push('Contiene sintaxis de MSSQL no compatible con PostgreSQL');
            valido = false;
        }
    }

    // Verificar que hay al menos 100k inserts de estudiantes
    const estudiantesInsert = (contenido.match(/INSERT INTO estudiantes/g) || []).length;
    if (estudiantesInsert < TOTAL_ESTUDIANTES) {
        errores.push(`Se esperaban ${TOTAL_ESTUDIANTES} inserts de estudiantes, se encontraron ${estudiantesInsert}`);
        valido = false;
    }

    if (valido) {
        console.log(`Validación exitosa: ${ruta} es compatible con ${motor.toUpperCase()}`);
    } else {
        console.error(`Validación fallida para ${ruta}:`);
        errores.forEach(e => console.error(`   - ${e}`));
    }
}
