import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function MisNotas() {
  const [notas, setNotas] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.misNotas().then(setNotas).catch(() => {});
  }, []);

  const grouped = notas.reduce((acc, n) => {
    const key = n.materia_nombre;
    if (!acc[key]) acc[key] = { materia: n.materia_nombre, codigo: n.materia_codigo, notas: [] };
    acc[key].notas.push(n);
    return acc;
  }, {});

  const entries = Object.values(grouped);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Boletín de notas</h1>
          <p className="page-subtitle">Notas por materia y etapa de evaluación de tu gestión actual</p>
        </div>
      </div>

      <div className="info-msg">
        ⚠ Recuerda, este boletín es informacional y no tiene validez como documento oficial.
      </div>

      {notas.length === 0 ? (
        <div className="card"><p style={{color:'var(--text-muted)'}}>Aún no tienes notas registradas.</p></div>
      ) : (
        <div className="card" style={{padding: 0, overflow: 'hidden'}}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{width: 40}}>#</th>
                  <th>Código</th>
                  <th>Materia</th>
                  <th>Evaluación</th>
                  <th>Nota</th>
                  <th>Fecha</th>
                  <th style={{width: 60, textAlign: 'center'}}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((g, idx) => (
                  <React.Fragment key={g.codigo}>
                    {g.notas.map((n, ni) => (
                      <tr key={n.id}>
                        {ni === 0 && <td rowSpan={g.notas.length} style={{fontWeight: 600, color: 'var(--text-muted)'}}>{String(idx + 1).padStart(2, '0')}</td>}
                        {ni === 0 && <td rowSpan={g.notas.length} style={{fontWeight: 600}}>{g.codigo}</td>}
                        {ni === 0 && <td rowSpan={g.notas.length}>{g.materia}</td>}
                        <td>{n.descripcion}</td>
                        <td className={n.nota >= 51 ? 'nota-aprobada' : 'nota-reprobada'}>{n.nota}</td>
                        <td style={{color: 'var(--text-secondary)', fontSize: '0.82rem'}}>{new Date(n.fecha).toLocaleDateString()}</td>
                        {ni === 0 && (
                          <td rowSpan={g.notas.length} style={{textAlign: 'center'}}>
                            <button
                              className="btn-detail"
                              onClick={() => setExpanded(expanded === g.codigo ? null : g.codigo)}
                              title="Ver detalle"
                            >
                              {expanded === g.codigo ? '▾' : '◉'}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {expanded === g.codigo && (
                      <tr className="nota-promedio">
                        <td colSpan={3}></td>
                        <td style={{fontWeight: 700}}>Promedio</td>
                        <td style={{fontWeight: 800, color: 'var(--burgundy-light)', fontSize: '1rem'}}>
                          {(g.notas.reduce((s, n) => s + n.nota, 0) / g.notas.length).toFixed(1)}
                        </td>
                        <td colSpan={2} style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>
                          {g.notas.length} evaluación(es)
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
