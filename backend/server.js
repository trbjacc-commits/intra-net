require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function start() {
  await initDb();

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/materias', require('./routes/materias'));
  app.use('/api/inscripciones', require('./routes/inscripciones'));
  app.use('/api/notas', require('./routes/notas'));
  app.use('/api/usuarios', require('./routes/usuarios'));

  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

start();
