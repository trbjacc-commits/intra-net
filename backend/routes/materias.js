const express = require('express');
const { getAll, getOne, runQuery, runExec } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const materias = await getAll(`
      SELECT m.*, u.nombre AS profesor_nombre, u.apellido AS profesor_apellido,
        (SELECT COUNT(*) FROM inscripciones WHERE materia_id = m.id) AS inscritos
      FROM materias m
      LEFT JOIN usuarios u ON m.profesor_id = u.id
      ORDER BY m.dia, m.hora_inicio
    `);
    res.json(materias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const materia = await getOne(`
      SELECT m.*, u.nombre AS profesor_nombre, u.apellido AS profesor_apellido,
        (SELECT COUNT(*) FROM inscripciones WHERE materia_id = m.id) AS inscritos
      FROM materias m
      LEFT JOIN usuarios u ON m.profesor_id = u.id
      WHERE m.id = $1
    `, [req.params.id]);
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json(materia);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener materia' });
  }
});

router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const { nombre, codigo, descripcion, profesor_id, dia, hora_inicio, hora_fin, aula, cupo_max } = req.body;
  if (!nombre || !codigo || !dia || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Campos obligatorios: nombre, codigo, dia, hora_inicio, hora_fin' });
  }
  try {
    const result = await runQuery(
      'INSERT INTO materias (nombre, codigo, descripcion, profesor_id, dia, hora_inicio, hora_fin, aula, cupo_max) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [nombre, codigo, descripcion || null, profesor_id || null, dia, hora_inicio, hora_fin, aula || null, cupo_max || 30]
    );
    res.json({ id: result.lastInsertRowid, message: 'Materia creada' });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      return res.status(400).json({ error: 'El código de materia ya existe' });
    }
    res.status(500).json({ error: 'Error al crear materia' });
  }
});

router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nombre, codigo, descripcion, profesor_id, dia, hora_inicio, hora_fin, aula, cupo_max } = req.body;
    await runExec(
      'UPDATE materias SET nombre=$1, codigo=$2, descripcion=$3, profesor_id=$4, dia=$5, hora_inicio=$6, hora_fin=$7, aula=$8, cupo_max=$9 WHERE id=$10',
      [nombre, codigo, descripcion || null, profesor_id || null, dia, hora_inicio, hora_fin, aula || null, cupo_max, req.params.id]
    );
    res.json({ message: 'Materia actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar materia' });
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await runExec('DELETE FROM inscripciones WHERE materia_id = $1', [req.params.id]);
    await runExec('DELETE FROM notas WHERE materia_id = $1', [req.params.id]);
    await runExec('DELETE FROM materias WHERE id = $1', [req.params.id]);
    res.json({ message: 'Materia eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar materia' });
  }
});

module.exports = router;
