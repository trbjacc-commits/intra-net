const API = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  registro: (data) => request('/auth/registro', { method: 'POST', body: JSON.stringify(data) }),

  getMaterias: () => request('/materias'),
  getMateria: (id) => request(`/materias/${id}`),
  crearMateria: (data) => request('/materias', { method: 'POST', body: JSON.stringify(data) }),
  actualizarMateria: (id, data) => request(`/materias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminarMateria: (id) => request(`/materias/${id}`, { method: 'DELETE' }),

  misMaterias: () => request('/inscripciones/mis-materias'),
  inscribirse: (materia_id) => request('/inscripciones', { method: 'POST', body: JSON.stringify({ materia_id }) }),
  cancelarInscripcion: (materia_id) => request(`/inscripciones/${materia_id}`, { method: 'DELETE' }),
  alumnosDeMateria: (materia_id) => request(`/inscripciones/alumnos/${materia_id}`),

  notasDeMateria: (materia_id) => request(`/notas/materia/${materia_id}`),
  misNotas: () => request('/notas/mis-notas'),
  registrarNota: (data) => request('/notas', { method: 'POST', body: JSON.stringify(data) }),
  actualizarNota: (id, data) => request(`/notas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminarNota: (id) => request(`/notas/${id}`, { method: 'DELETE' }),

  getUsuarios: () => request('/usuarios'),
  getProfesores: () => request('/usuarios/profesores'),
  actualizarUsuario: (id, data) => request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminarUsuario: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
};
