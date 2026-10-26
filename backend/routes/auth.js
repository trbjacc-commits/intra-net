const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getOne, runQuery } = require('../database');
const { SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getOne('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol },
      SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol } });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/registro', async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = await getOne(
      'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nombre, apellido, email, hash, rol || 'alumno']
    );
    res.json({ id: result.id, message: 'Usuario creado' });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate')) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
