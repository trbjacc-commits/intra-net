const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/intranet_academica';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false });

async function restore() {
  const archivo = process.argv[2];
  if (!archivo) {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (fs.existsSync(backupDir)) {
      const archivos = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
      if (archivos.length > 0) {
        console.log('Backups disponibles:');
        archivos.forEach(f => console.log(`  - ${f}`));
        console.log(`\nUso: npm run restore -- backups/${archivos[0]}`);
        process.exit(0);
      }
    }
    console.error('Uso: npm run restore -- <archivo-backup.json>');
    process.exit(1);
  }

  const filePath = path.resolve(archivo);
  if (!fs.existsSync(filePath)) {
    console.error(`Archivo no encontrado: ${filePath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Restaurando backup del ${data.fecha}...`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM notas');
    await client.query('DELETE FROM inscripciones');
    await client.query('DELETE FROM materias');
    await client.query('DELETE FROM usuarios');

    for (const u of data.tablas.usuarios) {
      await client.query(
        'INSERT INTO usuarios (id, nombre, apellido, email, password, rol, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [u.id, u.nombre, u.apellido, u.email, u.password, u.rol, u.created_at]
      );
    }

    for (const m of data.tablas.materias) {
      await client.query(
        'INSERT INTO materias (id, nombre, codigo, descripcion, profesor_id, dia, hora_inicio, hora_fin, aula, cupo_max) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [m.id, m.nombre, m.codigo, m.descripcion, m.profesor_id, m.dia, m.hora_inicio, m.hora_fin, m.aula, m.cupo_max]
      );
    }

    for (const i of data.tablas.inscripciones) {
      await client.query(
        'INSERT INTO inscripciones (id, alumno_id, materia_id, fecha) VALUES ($1,$2,$3,$4)',
        [i.id, i.alumno_id, i.materia_id, i.fecha]
      );
    }

    for (const n of data.tablas.notas) {
      await client.query(
        'INSERT INTO notas (id, alumno_id, materia_id, nota, descripcion, fecha) VALUES ($1,$2,$3,$4,$5,$6)',
        [n.id, n.alumno_id, n.materia_id, n.nota, n.descripcion, n.fecha]
      );
    }

    const maxId = Math.max(...data.tablas.usuarios.map(u => u.id), 0);
    await client.query(`SELECT setval('usuarios_id_seq', $1)`, [maxId]);
    const maxMat = Math.max(...data.tablas.materias.map(m => m.id), 0);
    if (maxMat > 0) await client.query(`SELECT setval('materias_id_seq', $1)`, [maxMat]);
    const maxInsc = Math.max(...data.tablas.inscripciones.map(i => i.id), 0);
    if (maxInsc > 0) await client.query(`SELECT setval('inscripciones_id_seq', $1)`, [maxInsc]);
    const maxNota = Math.max(...data.tablas.notas.map(n => n.id), 0);
    if (maxNota > 0) await client.query(`SELECT setval('notas_id_seq', $1)`, [maxNota]);

    await client.query('COMMIT');

    console.log('Restauración completada:');
    console.log(`  - ${data.tablas.usuarios.length} usuarios`);
    console.log(`  - ${data.tablas.materias.length} materias`);
    console.log(`  - ${data.tablas.inscripciones.length} inscripciones`);
    console.log(`  - ${data.tablas.notas.length} notas`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

restore().catch(err => { console.error('Error en restauración:', err.message); process.exit(1); });
