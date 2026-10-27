import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }) {
  const [isRegistro, setIsRegistro] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'alumno' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isRegistro) {
        await api.registro(form);
        setSuccess('Cuenta creada. Ahora inicia sesión.');
        setIsRegistro(false);
      } else {
        const data = await api.login(form.email, form.password);
        onLogin(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="login-page">
      <div className="login-aside">
        <div className="login-aside-content">
          <div className="login-aside-logo">IA</div>
          <h1>Intranet Académica</h1>
          <p>Gestiona tus materias, horarios y notas desde un solo lugar. Acceso exclusivo para estudiantes y docentes.</p>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <h1>{isRegistro ? 'Crear cuenta' : 'Bienvenido'}</h1>
          <p className="subtitle">{isRegistro ? 'Completa tus datos para registrarte' : 'Inicia sesión para continuar'}</p>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form onSubmit={handleSubmit}>
            {isRegistro && (
              <>
                <div className="form-group">
                  <label>Nombre</label>
                  <input value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" required />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input value={form.apellido} onChange={set('apellido')} placeholder="Tu apellido" required />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select value={form.rol} onChange={set('rol')}>
                    <option value="alumno">Alumno</option>
                    <option value="profesor">Profesor</option>
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Tu contraseña" required />
            </div>
            <button type="submit" className="btn btn-primary">
              {isRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="toggle-link">
            <button onClick={() => { setIsRegistro(!isRegistro); setError(''); setSuccess(''); }}>
              {isRegistro ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
