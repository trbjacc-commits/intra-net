const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connStr = process.env.DATABASE_URL || 'postgresql://localhost:5432/intranet_academica';
const isRemote = connStr.includes('railway') || connStr.includes('render') || connStr.includes('neon');
const pool = new Pool({
  connectionString: connStr,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT NOT NULL CHECK(rol IN ('admin', 'profesor', 'alumno')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS materias (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        codigo TEXT UNIQUE NOT NULL,
        descripcion TEXT,
        profesor_id INTEGER REFERENCES usuarios(id),
        dia TEXT NOT NULL,
        hora_inicio TEXT NOT NULL,
        hora_fin TEXT NOT NULL,
        aula TEXT,
        cupo_max INTEGER DEFAULT 30
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inscripciones (
        id SERIAL PRIMARY KEY,
        alumno_id INTEGER NOT NULL REFERENCES usuarios(id),
        materia_id INTEGER NOT NULL REFERENCES materias(id),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(alumno_id, materia_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notas (
        id SERIAL PRIMARY KEY,
        alumno_id INTEGER NOT NULL REFERENCES usuarios(id),
        materia_id INTEGER NOT NULL REFERENCES materias(id),
        nota REAL NOT NULL CHECK(nota >= 0 AND nota <= 100),
        descripcion TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(alumno_id, materia_id, descripcion)
      )
    `);

    const adminCheck = await client.query("SELECT id FROM usuarios WHERE rol = 'admin'");
    if (adminCheck.rows.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await client.query(
        'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES ($1, $2, $3, $4, $5)',
        ['Admin', 'Sistema', 'admin@intranet.edu', hash, 'admin']
      );
    }

    console.log('Base de datos inicializada');
  } finally {
    client.release();
  }
}

async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result;
}

async function getOne(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function getAll(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function runQuery(sql, params = []) {
  const result = await pool.query(sql + ' RETURNING id', params);
  return { lastInsertRowid: result.rows[0]?.id };
}

async function runExec(sql, params = []) {
  await pool.query(sql, params);
}

module.exports = { initDb, query, getOne, getAll, runQuery, runExec, pool };
