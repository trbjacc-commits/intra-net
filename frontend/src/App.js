import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import MisMaterias from './pages/MisMaterias';
import Horario from './pages/Horario';
import MisNotas from './pages/MisNotas';
import GestionNotas from './pages/GestionNotas';
import Usuarios from './pages/Usuarios';
import './App.css';

function NavLink({ to, icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <li>
      <Link to={to} className={isActive ? 'active' : ''}>
        <span className="nav-icon">{icon}</span>
        {children}
      </Link>
    </li>
  );
}

function Sidebar({ user, onLogout }) {
  const initials = `${(user.nombre || '')[0] || ''}${(user.apellido || '')[0] || ''}`.toUpperCase();

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">IA</div>
        <div>
          <h2>Intranet</h2>
          <small>Académica</small>
        </div>
      </div>

      <div className="sidebar-section-label">Académico</div>

      <ul className="nav-links">
        <NavLink to="/" icon="⌂">Inicio</NavLink>
        {user.rol === 'alumno' && (
          <>
            <NavLink to="/materias" icon="◉">Inscripción</NavLink>
            <NavLink to="/mis-materias" icon="▤">Mis Materias</NavLink>
            <NavLink to="/horario" icon="▦">Horarios</NavLink>
            <NavLink to="/mis-notas" icon="▥">Boletín de notas</NavLink>
          </>
        )}
        {user.rol === 'profesor' && (
          <>
            <NavLink to="/materias" icon="◉">Materias</NavLink>
            <NavLink to="/notas" icon="▥">Gestión de Notas</NavLink>
          </>
        )}
        {user.rol === 'admin' && (
          <>
            <NavLink to="/materias" icon="◉">Materias</NavLink>
            <NavLink to="/usuarios" icon="◎">Usuarios</NavLink>
            <NavLink to="/notas" icon="▥">Gestión de Notas</NavLink>
          </>
        )}
      </ul>

      <button className="btn-logout" onClick={onLogout}>
        ◇ Cerrar Sesión
      </button>

      <div className="sidebar-profile">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <div className="profile-name">{user.nombre} {user.apellido}</div>
          <div className="profile-email">{user.email}</div>
        </div>
        <span className="profile-badge">{user.rol}</span>
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) setUser(JSON.parse(saved));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <Login onLogin={login} />;

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar user={user} onLogout={logout} />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/materias" element={<Materias user={user} />} />
            {user.rol === 'alumno' && <Route path="/mis-materias" element={<MisMaterias />} />}
            {user.rol === 'alumno' && <Route path="/horario" element={<Horario />} />}
            {user.rol === 'alumno' && <Route path="/mis-notas" element={<MisNotas />} />}
            {(user.rol === 'profesor' || user.rol === 'admin') && <Route path="/notas" element={<GestionNotas user={user} />} />}
            {user.rol === 'admin' && <Route path="/usuarios" element={<Usuarios />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
