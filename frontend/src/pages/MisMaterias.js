import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function MisMaterias() {
  const [materias, setMaterias] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.misMaterias();
      setMaterias(data);
    } catch {}
  };

  const cancelar = async (id) => {
    if (!window.confirm('¿Cancelar inscripción?')) return;
    await api.cancelarInscripcion(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Mis Materias</h1>
          <p className="page-subtitle">Materias en las que estás inscrito actualmente</p>
        </div>
      </div>

      {materias.length === 0 ? (
        <div className="card"><p style={{color:'var(--text-muted)'}}>No estás inscrito en ninguna materia.</p></div>
      ) : (
        <div className="card-grid">
          {materias.map(m => (
            <div key={m.id} className="card materia-card">
              <h3>{m.nombre}</h3>
              <div className="materia-info">
                <div><strong>Código:</strong> {m.codigo}</div>
                <div><strong>Profesor:</strong> {m.profesor_nombre ? `${m.profesor_nombre} ${m.profesor_apellido}` : 'Sin asignar'}</div>
                <div><strong>Horario:</strong> {m.dia} {m.hora_inicio} - {m.hora_fin}</div>
                <div><strong>Aula:</strong> {m.aula || '-'}</div>
              </div>
              <div className="materia-actions">
                <button className="btn btn-danger btn-sm" onClick={() => cancelar(m.id)}>Cancelar Inscripción</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
