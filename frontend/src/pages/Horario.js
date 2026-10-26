import React, { useState, useEffect } from 'react';
import { api } from '../api';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORAS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

const COLORS = [
  'linear-gradient(135deg, #9b2d6e, #c43a8a)',
  'linear-gradient(135deg, #1b6b5a, #2ec4b6)',
  'linear-gradient(135deg, #2a4494, #4361ee)',
  'linear-gradient(135deg, #8b5e1b, #f0b429)',
  'linear-gradient(135deg, #6b1b8b, #a855f7)',
  'linear-gradient(135deg, #1b7a8b, #06b6d4)',
  'linear-gradient(135deg, #8b441b, #ea580c)',
  'linear-gradient(135deg, #1b8b3a, #22c55e)',
];

export default function Horario() {
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    api.misMaterias().then(setMaterias).catch(() => {});
  }, []);

  const colorMap = {};
  materias.forEach((m, i) => {
    if (!colorMap[m.id]) colorMap[m.id] = COLORS[i % COLORS.length];
  });

  const getMateria = (dia, hora) => {
    return materias.find(m => m.dia === dia && m.hora_inicio <= hora && m.hora_fin > hora);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Horarios</h1>
          <p className="page-subtitle">Horario semanal de tus materias inscritas</p>
        </div>
        {materias.length > 0 && (
          <button className="btn btn-outline-burgundy" onClick={handlePrint}>
            ⎙ Imprimir
          </button>
        )}
      </div>

      {materias.length === 0 ? (
        <div className="card"><p style={{color:'var(--text-muted)'}}>Inscríbete en materias para ver tu horario.</p></div>
      ) : (
        <div className="card" style={{padding: 0, overflow: 'hidden'}}>
          <div className="horario-grid">
            <div className="horario-header">Hora</div>
            {DIAS.map(d => <div key={d} className="horario-header">{d}</div>)}

            {HORAS.map(hora => (
              <React.Fragment key={hora}>
                <div className="horario-hora">{hora}</div>
                {DIAS.map(dia => {
                  const m = getMateria(dia, hora);
                  return (
                    <div key={`${dia}-${hora}`} className="horario-cell">
                      {m && m.hora_inicio === hora && (
                        <div className="horario-materia" style={{background: colorMap[m.id]}}>
                          <strong>{m.nombre}</strong><br/>
                          <span style={{opacity:0.85, fontSize:'0.68rem'}}>
                            {m.aula || ''}{m.aula && m.profesor_nombre ? ' · ' : ''}{m.profesor_nombre ? `${m.profesor_nombre} ${m.profesor_apellido || ''}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
