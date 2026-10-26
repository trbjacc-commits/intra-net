const express = require('express');
const bcrypt = require('bcryptjs');
const { getAll, runExec } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const usuarios = await getAll(
      'SELECT id, nombre, apellido, email, rol, created_at FROM usuarios ORDER BY rol, apellido'
    );
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

router.get('/profesores', authMiddleware, async (req, res) => {
  try {
    const profesores = await getAll(
      "SELECT id, nombre, apellido, email FROM usuarios WHERE rol = 'profesor' ORDER BY apellido"
    );
    res.json(profesores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
});

router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { nombre, apellido, email, rol, password } = req.body;
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      await runExec('UPDATE usuarios SET nombre=$1, apellido=$2, email=$3, rol=$4, password=$5 WHERE id=$6',
        [nombre, apellido, email, rol, hash, req.params.id]);
    } else {
      await runExec('UPDATE usuarios SET nombre=$1, apellido=$2, email=$3, rol=$4 WHERE id=$5',
        [nombre, apellido, email, rol, req.params.id]);
    }
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }
  try {
    const id = req.params.id;
    await runExec('DELETE FROM notas WHERE alumno_id = $1', [id]);
    await runExec('DELETE FROM inscripciones WHERE alumno_id = $1', [id]);
    await runExec('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
