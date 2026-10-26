import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function GestionNotas({ user }) {
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [form, setForm] = useState({ alumno_id: '', nota: '', descripcion: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getMaterias().then(data => {
      const filtered = user.rol === 'profesor'
        ? data.filter(m => m.profesor_id === user.id)
        : data;
      setMaterias(filtered);
    }).catch(() => {});
  }, [user]);

  const selectMateria = async (id) => {
    setSelectedMateria(id);
    setError(''); setSuccess('');
    try {
      const [als, ns] = await Promise.all([
        api.alumnosDeMateria(id),
        api.notasDeMateria(id),
      ]);
      setAlumnos(als);
      setNotas(ns);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.registrarNota({
        alumno_id: Number(form.alumno_id),
        materia_id: selectedMateria,
        nota: Number(form.nota),
        descripcion: form.descripcion,
      });
      setSuccess('Nota registrada');
      setForm({ alumno_id: '', nota: '', descripcion: '' });
      const ns = await api.notasDeMateria(selectedMateria);
      setNotas(ns);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    await api.eliminarNota(id);
    const ns = await api.notasDeMateria(selectedMateria);
    setNotas(ns);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Gestión de Notas</h1>
          <p className="page-subtitle">Registra y administra las notas de tus alumnos</p>
        </div>
      </div>

      <div className="card">
        <div className="form-group">
          <label>Seleccionar materia</label>
          <select value={selectedMateria || ''} onChange={e => selectMateria(Number(e.target.value))}>
            <option value="">-- Elegir materia --</option>
            {materias.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.codigo})</option>)}
          </select>
        </div>
      </div>

      {selectedMateria && (
        <>
          <div className="card">
            <h3>Registrar Nota</h3>
            {error && <div className="error-msg" style={{marginTop: 12}}>{error}</div>}
            {success && <div className="success-msg" style={{marginTop: 12}}>{success}</div>}
            {alumnos.length === 0 ? (
              <p style={{color:'var(--text-muted)', marginTop: 12}}>No hay alumnos inscritos en esta materia.</p>
            ) : (
              <form onSubmit={handleSubmit} className="inline-form" style={{marginTop: 14}}>
                <div className="form-group">
                  <label>Alumno</label>
                  <select value={form.alumno_id} onChange={e => setForm({...form, alumno_id: e.target.value})} required>
                    <option value="">-- Elegir --</option>
                    {alumnos.map(a => <option key={a.id} value={a.id}>{a.apellido} {a.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Nota (0-100)</label>
                  <input type="number" min={0} max={100} value={form.nota} onChange={e => setForm({...form, nota: e.target.value})} required style={{width: 100}} />
                </div>
                <div className="form-group">
                  <label>Evaluación</label>
                  <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Ej: Parcial 1" style={{width: 160}} />
                </div>
                <button type="submit" className="btn btn-success btn-sm">Registrar</button>
              </form>
            )}
          </div>

          {notas.length > 0 && (
            <div className="card" style={{padding: 0, overflow: 'hidden'}}>
              <div style={{padding: '18px 22px 0'}}>
                <h3>Notas Registradas</h3>
              </div>
              <div className="table-container" style={{marginTop: 12}}>
                <table>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Evaluación</th>
                      <th>Nota</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notas.map(n => (
                      <tr key={n.id}>
                        <td>{n.alumno_apellido} {n.alumno_nombre}</td>
                        <td>{n.descripcion}</td>
                        <td className={n.nota >= 51 ? 'nota-aprobada' : 'nota-reprobada'}>{n.nota}</td>
                        <td style={{color: 'var(--text-secondary)', fontSize: '0.82rem'}}>{new Date(n.fecha).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
