const express = require('express');
const { getAll, getOne, runQuery, runExec } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/materia/:materia_id', authMiddleware, requireRole('profesor', 'admin'), async (req, res) => {
  try {
    const notas = await getAll(`
      SELECT n.*, u.nombre AS alumno_nombre, u.apellido AS alumno_apellido
      FROM notas n
      JOIN usuarios u ON n.alumno_id = u.id
      WHERE n.materia_id = $1
      ORDER BY u.apellido, u.nombre, n.descripcion
    `, [req.params.materia_id]);
    res.json(notas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notas' });
  }
});

router.get('/mis-notas', authMiddleware, requireRole('alumno'), async (req, res) => {
  try {
    const notas = await getAll(`
      SELECT n.*, m.nombre AS materia_nombre, m.codigo AS materia_codigo
      FROM notas n
      JOIN materias m ON n.materia_id = m.id
      WHERE n.alumno_id = $1
      ORDER BY m.nombre, n.descripcion
    `, [req.user.id]);
    res.json(notas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notas' });
  }
});

router.post('/', authMiddleware, requireRole('profesor', 'admin'), async (req, res) => {
  const { alumno_id, materia_id, nota, descripcion } = req.body;
  if (nota === undefined || !alumno_id || !materia_id) {
    return res.status(400).json({ error: 'alumno_id, materia_id y nota son requeridos' });
  }
  if (nota < 0 || nota > 100) {
    return res.status(400).json({ error: 'La nota debe estar entre 0 y 100' });
  }
  try {
    const inscrito = await getOne(
      'SELECT id FROM inscripciones WHERE alumno_id = $1 AND materia_id = $2',
      [alumno_id, materia_id]
    );
    if (!inscrito) {
      return res.status(400).json({ error: 'El alumno no está inscrito en esta materia' });
    }

    const result = await runQuery(
      'INSERT INTO notas (alumno_id, materia_id, nota, descripcion) VALUES ($1, $2, $3, $4)',
      [alumno_id, materia_id, nota, descripcion || 'Nota general']
    );
    res.json({ id: result.lastInsertRowid, message: 'Nota registrada' });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Ya existe una nota con esa descripción para este alumno' });
    }
    res.status(500).json({ error: 'Error al registrar nota' });
  }
});

router.put('/:id', authMiddleware, requireRole('profesor', 'admin'), async (req, res) => {
  const { nota, descripcion } = req.body;
  if (nota < 0 || nota > 100) {
    return res.status(400).json({ error: 'La nota debe estar entre 0 y 100' });
  }
  try {
    await runExec('UPDATE notas SET nota = $1, descripcion = $2 WHERE id = $3', [nota, descripcion, req.params.id]);
    res.json({ message: 'Nota actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar nota' });
  }
});

router.delete('/:id', authMiddleware, requireRole('profesor', 'admin'), async (req, res) => {
  try {
    await runExec('DELETE FROM notas WHERE id = $1', [req.params.id]);
    res.json({ message: 'Nota eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar nota' });
  }
});

module.exports = router;
