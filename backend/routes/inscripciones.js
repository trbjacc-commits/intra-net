const express = require('express');
const { getAll, getOne, runQuery, runExec } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/mis-materias', authMiddleware, requireRole('alumno'), async (req, res) => {
  try {
    const materias = await getAll(`
      SELECT m.*, u.nombre AS profesor_nombre, u.apellido AS profesor_apellido, i.fecha AS fecha_inscripcion
      FROM inscripciones i
      JOIN materias m ON i.materia_id = m.id
      LEFT JOIN usuarios u ON m.profesor_id = u.id
      WHERE i.alumno_id = $1
      ORDER BY m.dia, m.hora_inicio
    `, [req.user.id]);
    res.json(materias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});

router.post('/', authMiddleware, requireRole('alumno'), async (req, res) => {
  const { materia_id } = req.body;
  try {
    const materia = await getOne('SELECT * FROM materias WHERE id = $1', [materia_id]);
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });

    const inscritos = await getOne('SELECT COUNT(*) AS total FROM inscripciones WHERE materia_id = $1', [materia_id]);
    if (Number(inscritos.total) >= materia.cupo_max) {
      return res.status(400).json({ error: 'Materia sin cupo disponible' });
    }

    const diasNueva = materia.dia.split(',');
    const misMateriasActuales = await getAll(`
      SELECT m.nombre, m.dia, m.hora_inicio, m.hora_fin FROM inscripciones i
      JOIN materias m ON i.materia_id = m.id
      WHERE i.alumno_id = $1
    `, [req.user.id]);

    for (const mat of misMateriasActuales) {
      const diasExistente = mat.dia.split(',');
      const diasComunes = diasNueva.filter(d => diasExistente.includes(d));
      if (diasComunes.length > 0 && mat.hora_inicio < materia.hora_fin && mat.hora_fin > materia.hora_inicio) {
        return res.status(400).json({ error: `Conflicto de horario con "${mat.nombre}" (${diasComunes.join(', ')})` });
      }
    }

    await runQuery('INSERT INTO inscripciones (alumno_id, materia_id) VALUES ($1, $2)', [req.user.id, materia_id]);
    res.json({ message: 'Inscripción exitosa' });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Ya estás inscrito en esta materia' });
    }
    res.status(500).json({ error: 'Error al inscribirse' });
  }
});

router.delete('/:materia_id', authMiddleware, requireRole('alumno'), async (req, res) => {
  try {
    await runExec('DELETE FROM inscripciones WHERE alumno_id = $1 AND materia_id = $2', [req.user.id, req.params.materia_id]);
    res.json({ message: 'Inscripción cancelada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar inscripción' });
  }
});

router.get('/alumnos/:materia_id', authMiddleware, requireRole('profesor', 'admin'), async (req, res) => {
  try {
    const alumnos = await getAll(`
      SELECT u.id, u.nombre, u.apellido, u.email, i.fecha AS fecha_inscripcion
      FROM inscripciones i
      JOIN usuarios u ON i.alumno_id = u.id
      WHERE i.materia_id = $1
      ORDER BY u.apellido, u.nombre
    `, [req.params.materia_id]);
    res.json(alumnos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});

module.exports = router;
