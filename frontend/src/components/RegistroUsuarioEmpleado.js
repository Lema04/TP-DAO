import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:5000';

const RegistroUsuarioEmpleado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const empleado = location.state?.empleado; // Recibimos el empleado desde el state

  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contraseña: '',
    confirmar_contraseña: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Si no hay empleado, redirigir
    if (!empleado) {
      navigate('/registrar-empleado');
    }
  }, [empleado, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    // Validar que las contraseñas coincidan
    if (formData.contraseña !== formData.confirmar_contraseña) {
      setMensaje('Las contraseñas no coinciden.');
      setEsError(true);
      return;
    }

    try {
      // Determinar el rol basado en el puesto del empleado
      let rol = 'atencion'; // Por defecto
      if (empleado.puesto === 'Supervisor' || empleado.puesto === 'Gerente') {
        rol = 'supervisor';
      }

      // Crear el usuario vinculado al empleado
      const resUsuario = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: formData.nombre_usuario,
          contraseña: formData.contraseña,
          rol: rol,
          id_empleado: empleado.id_empleado
        }),
      });

      const dataUsuario = await resUsuario.json();

      if (!resUsuario.ok) {
        throw new Error(dataUsuario.error || 'Error al crear el usuario. Es posible que el nombre de usuario ya esté en uso.');
      }

      // Éxito
      setShowModal(true);

    } catch (error) {
      setMensaje(error.message);
      setEsError(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/home');
  };

  const handleOmitir = () => {
    navigate('/home');
  };

  if (!empleado) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="form-card" style={{ maxWidth: '500px' }}>
      <h2 className="form-title">Crear Usuario para Empleado</h2>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
        Crea las credenciales de acceso para <strong>{empleado.nombre} {empleado.apellido}</strong>
      </p>

      <div style={{
        backgroundColor: '#f7fafc',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: '#718096' }}>Empleado:</span>
          <span style={{ color: '#2d3748' }}>{empleado.nombre} {empleado.apellido}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: '#718096' }}>DNI:</span>
          <span style={{ color: '#2d3748' }}>{empleado.dni}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: '600', color: '#718096' }}>Puesto:</span>
          <span style={{ color: '#2d3748' }}>{empleado.puesto}</span>
        </div>
      </div>

      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">

        <div className="form-group">
          <label>Nombre de Usuario:</label>
          <input
            className="form-input"
            type="text"
            name="nombre_usuario"
            onChange={handleChange}
            required
            value={formData.nombre_usuario}
            placeholder="Ej: jperez"
          />
          <small>Este será el nombre de usuario para iniciar sesión</small>
        </div>

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            className="form-input"
            type="password"
            name="contraseña"
            onChange={handleChange}
            required
            value={formData.contraseña}
            minLength="4"
          />
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña:</label>
          <input
            className="form-input"
            type="password"
            name="confirmar_contraseña"
            onChange={handleChange}
            required
            value={formData.confirmar_contraseña}
            minLength="4"
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
          Crear Usuario
        </button>
      </form>

      <button type="button" className="btn-secondary" onClick={handleOmitir}>
        Omitir (crear usuario después)
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🎉</span>
            <h3>¡Usuario Creado!</h3>
            <p>El usuario <strong>{formData.nombre_usuario}</strong> ha sido vinculado exitosamente al empleado.</p>
            <p>Ya puede iniciar sesión en el sistema.</p>
            <button className="modal-close-btn" onClick={closeModal}>
              Volver al Menú
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroUsuarioEmpleado;
