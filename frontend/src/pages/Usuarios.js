import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'alumno' });
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setUsuarios(await api.getUsuarios());
    } catch {}
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.registro(form);
      setShowModal(false);
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'alumno' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario y todos sus datos?')) return;
    try {
      await api.eliminarUsuario(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p className="page-subtitle">Gestión de cuentas del sistema</p>
        </div>
        <button className="btn btn-primary" style={{width: 'auto', padding: '10px 20px'}} onClick={() => { setShowModal(true); setError(''); }}>+ Nuevo Usuario</button>
      </div>

      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td style={{fontWeight: 500}}>{u.nombre} {u.apellido}</td>
                  <td style={{color: 'var(--text-secondary)'}}>{u.email}</td>
                  <td><span className={`rol-badge rol-${u.rol}`}>{u.rol}</span></td>
                  <td style={{color: 'var(--text-secondary)', fontSize: '0.82rem'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.rol !== 'admin' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nuevo Usuario</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={set('nombre')} required />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input value={form.apellido} onChange={set('apellido')} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={set('rol')}>
                  <option value="alumno">Alumno</option>
                  <option value="profesor">Profesor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{width: 'auto'}}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
