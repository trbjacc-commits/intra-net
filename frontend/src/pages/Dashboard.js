import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (user.rol === 'alumno') {
        const materias = await api.misMaterias();
        const notas = await api.misNotas();
        const promedio = notas.length > 0 ? (notas.reduce((s, n) => s + n.nota, 0) / notas.length).toFixed(1) : '-';
        setStats({ materias: materias.length, notas: notas.length, promedio });
      } else if (user.rol === 'profesor' || user.rol === 'admin') {
        const materias = await api.getMaterias();
        const misMaterias = user.rol === 'profesor'
          ? materias.filter(m => m.profesor_id === user.id)
          : materias;
        setStats({ materias: misMaterias.length, totalMaterias: materias.length });
      }
      if (user.rol === 'admin') {
        const usuarios = await api.getUsuarios();
        setStats(prev => ({
          ...prev,
          alumnos: usuarios.filter(u => u.rol === 'alumno').length,
          profesores: usuarios.filter(u => u.rol === 'profesor').length,
        }));
      }
    } catch {}
  };

  const quickLinks = {
    alumno: [
      { icon: '◉', label: 'Inscripción', path: '/materias' },
      { icon: '▤', label: 'Mis Materias', path: '/mis-materias' },
      { icon: '▦', label: 'Horarios', path: '/horario' },
      { icon: '▥', label: 'Boletín de notas', path: '/mis-notas' },
    ],
    profesor: [
      { icon: '◉', label: 'Materias', path: '/materias' },
      { icon: '▥', label: 'Gestión de Notas', path: '/notas' },
    ],
    admin: [
      { icon: '◉', label: 'Materias', path: '/materias' },
      { icon: '◎', label: 'Usuarios', path: '/usuarios' },
      { icon: '▥', label: 'Gestión de Notas', path: '/notas' },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Bienvenido, {user.nombre}</h1>
          <p className="page-subtitle">Panel principal de tu intranet académica</p>
        </div>
      </div>

      <div className="stat-cards">
        {user.rol === 'alumno' && (
          <>
            <div className="stat-card">
              <div className="stat-icon">◉</div>
              <div className="stat-value">{stats.materias || 0}</div>
              <div className="stat-label">Materias inscritas</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">▥</div>
              <div className="stat-value">{stats.notas || 0}</div>
              <div className="stat-label">Notas registradas</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">★</div>
              <div className="stat-value">{stats.promedio || '-'}</div>
              <div className="stat-label">Promedio general</div>
            </div>
          </>
        )}
        {user.rol === 'profesor' && (
          <div className="stat-card">
            <div className="stat-icon">◉</div>
            <div className="stat-value">{stats.materias || 0}</div>
            <div className="stat-label">Mis materias</div>
          </div>
        )}
        {user.rol === 'admin' && (
          <>
            <div className="stat-card">
              <div className="stat-icon">◉</div>
              <div className="stat-value">{stats.totalMaterias || 0}</div>
              <div className="stat-label">Materias</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">◎</div>
              <div className="stat-value">{stats.alumnos || 0}</div>
              <div className="stat-label">Alumnos</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">◎</div>
              <div className="stat-value">{stats.profesores || 0}</div>
              <div className="stat-label">Profesores</div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>Accesos rápidos</h3>
        <div className="quick-access">
          {(quickLinks[user.rol] || []).map((item, i) => (
            <a key={i} href={item.path} className="quick-access-item" onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
              window.location.pathname = item.path;
            }}>
              <span className="quick-access-icon">{item.icon}</span>
              <span className="quick-access-label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
