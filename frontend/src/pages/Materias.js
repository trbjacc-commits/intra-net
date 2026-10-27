import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Materias({ user }) {
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', codigo: '', descripcion: '', profesor_id: '', dia: '', hora_inicio: '08:00', hora_fin: '09:30', aula: '', cupo_max: 30 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [misInscritas, setMisInscritas] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.getMaterias();
      setMaterias(data);
      if (user.rol === 'admin') {
        const profs = await api.getProfesores();
        setProfesores(profs);
      }
      if (user.rol === 'alumno') {
        const mis = await api.misMaterias();
        setMisInscritas(mis.map(m => m.id));
      }
    } catch {}
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleDia = (d) => {
    const current = form.dia ? form.dia.split(',') : [];
    const updated = current.includes(d) ? current.filter(x => x !== d) : [...current, d];
    const ordered = dias.filter(dia => updated.includes(dia));
    setForm({ ...form, dia: ordered.join(',') });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.actualizarMateria(editing, { ...form, profesor_id: form.profesor_id || null });
      } else {
        await api.crearMateria({ ...form, profesor_id: form.profesor_id || null });
      }
      setShowModal(false);
      setEditing(null);
      setForm({ nombre: '', codigo: '', descripcion: '', profesor_id: '', dia: '', hora_inicio: '08:00', hora_fin: '09:30', aula: '', cupo_max: 30 });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (m) => {
    setEditing(m.id);
    setForm({ nombre: m.nombre, codigo: m.codigo, descripcion: m.descripcion || '', profesor_id: m.profesor_id || '', dia: m.dia, hora_inicio: m.hora_inicio, hora_fin: m.hora_fin, aula: m.aula || '', cupo_max: m.cupo_max });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta materia?')) return;
    await api.eliminarMateria(id);
    load();
  };

  const handleInscribirse = async (materia_id) => {
    setSuccess(''); setError('');
    try {
      await api.inscribirse(materia_id);
      setSuccess('Inscripción exitosa');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const cupoPercent = (m) => Math.round((m.inscritos / m.cupo_max) * 100);
  const cupoColor = (m) => cupoPercent(m) >= 90 ? 'var(--danger)' : cupoPercent(m) >= 60 ? 'var(--gold)' : 'var(--teal)';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{user.rol === 'alumno' ? 'Inscripción' : 'Gestión de Materias'}</h1>
          <p className="page-subtitle">{user.rol === 'alumno' ? 'Materias disponibles para inscribirse' : 'Administra las materias del sistema'}</p>
        </div>
        {user.rol === 'admin' && (
          <button className="btn btn-primary" style={{width: 'auto', padding: '10px 20px'}} onClick={() => { setShowModal(true); setEditing(null); setError(''); }}>
            + Nueva Materia
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="card-grid">
        {materias.map(m => (
          <div key={m.id} className="card materia-card">
            <h3>{m.nombre}</h3>
            <div className="materia-info">
              <div><strong>Código:</strong> {m.codigo}</div>
              <div><strong>Profesor:</strong> {m.profesor_nombre ? `${m.profesor_nombre} ${m.profesor_apellido}` : 'Sin asignar'}</div>
              <div><strong>Horario:</strong> {m.dia.includes(',') ? m.dia.split(',').map(d => d.slice(0,3)).join(', ') : m.dia} {m.hora_inicio} - {m.hora_fin}</div>
              <div><strong>Aula:</strong> {m.aula || '-'}</div>
              <div><strong>Cupo:</strong> {m.inscritos}/{m.cupo_max}</div>
              {m.descripcion && <div style={{marginTop: 6, color: 'var(--text-muted)', fontSize: '0.82rem'}}>{m.descripcion}</div>}
            </div>
            <div className="cupo-bar">
              <div className="cupo-bar-fill" style={{width: `${cupoPercent(m)}%`, background: cupoColor(m)}} />
            </div>
            <div className="materia-actions">
              {user.rol === 'alumno' && !misInscritas.includes(m.id) && (
                <button className="btn btn-success btn-sm" onClick={() => handleInscribirse(m.id)}>Inscribirme</button>
              )}
              {user.rol === 'alumno' && misInscritas.includes(m.id) && (
                <span className="inscrito-badge">✓ Ya inscrito</span>
              )}
              {user.rol === 'admin' && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(m)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Eliminar</button>
                </>
              )}
            </div>
          </div>
        ))}
        {materias.length === 0 && <div className="card"><p style={{color:'var(--text-muted)'}}>No hay materias registradas.</p></div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Editar Materia' : 'Nueva Materia'}</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={set('nombre')} required />
              </div>
              <div className="form-group">
                <label>Código</label>
                <input value={form.codigo} onChange={set('codigo')} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={form.descripcion} onChange={set('descripcion')} rows={2} />
              </div>
              <div className="form-group">
                <label>Profesor</label>
                <select value={form.profesor_id} onChange={set('profesor_id')}>
                  <option value="">Sin asignar</option>
                  {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Días</label>
                <div style={{display:'flex', flexWrap:'wrap', gap: 8}}>
                  {dias.map(d => (
                    <label key={d} style={{display:'flex', alignItems:'center', gap: 4, cursor:'pointer', padding:'6px 12px', borderRadius: 8, background: form.dia && form.dia.split(',').includes(d) ? 'var(--primary)' : 'var(--bg-card)', border: '1px solid var(--border)', fontSize:'0.85rem', color: form.dia && form.dia.split(',').includes(d) ? '#fff' : 'var(--text-muted)'}}>
                      <input type="checkbox" checked={form.dia ? form.dia.split(',').includes(d) : false} onChange={() => toggleDia(d)} style={{display:'none'}} />
                      {d.slice(0,3)}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{display:'flex', gap: 12}}>
                <div className="form-group" style={{flex:1}}>
                  <label>Hora inicio</label>
                  <input type="time" value={form.hora_inicio} onChange={set('hora_inicio')} required />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label>Hora fin</label>
                  <input type="time" value={form.hora_fin} onChange={set('hora_fin')} required />
                </div>
              </div>
              <div style={{display:'flex', gap: 12}}>
                <div className="form-group" style={{flex:1}}>
                  <label>Aula</label>
                  <input value={form.aula} onChange={set('aula')} />
                </div>
                <div className="form-group" style={{flex:1}}>
                  <label>Cupo máximo</label>
                  <input type="number" value={form.cupo_max} onChange={set('cupo_max')} min={1} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{width: 'auto'}}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
