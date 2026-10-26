const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/intranet_academica';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false });

async function backup() {
  const client = await pool.connect();
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const archivo = path.join(backupDir, `backup-${fecha}.json`);

  try {
    const usuarios = (await client.query('SELECT * FROM usuarios ORDER BY id')).rows;
    const materias = (await client.query('SELECT * FROM materias ORDER BY id')).rows;
    const inscripciones = (await client.query('SELECT * FROM inscripciones ORDER BY id')).rows;
    const notas = (await client.query('SELECT * FROM notas ORDER BY id')).rows;

    const data = {
      fecha: new Date().toISOString(),
      version: '1.0',
      tablas: { usuarios, materias, inscripciones, notas }
    };

    fs.writeFileSync(archivo, JSON.stringify(data, null, 2));
    console.log(`Backup guardado en: ${archivo}`);
    console.log(`  - ${usuarios.length} usuarios`);
    console.log(`  - ${materias.length} materias`);
    console.log(`  - ${inscripciones.length} inscripciones`);
    console.log(`  - ${notas.length} notas`);
  } finally {
    client.release();
    await pool.end();
  }
}

backup().catch(err => { console.error('Error en backup:', err.message); process.exit(1); });
