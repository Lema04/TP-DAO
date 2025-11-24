import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RegistroUsuarioEmpleado = ({ apiBaseUrl }) => { // Recibe apiBaseUrl por props si está disponible, sino usa default
  const navigate = useNavigate();
  const location = useLocation();
  const empleado = location.state?.empleado; 

  const API_URL = apiBaseUrl || 'http://127.0.0.1:5000'; // Fallback por si no se pasa prop

  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contraseña: '',
    confirmar_contraseña: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!empleado) {
      navigate('/empleado'); // Volver a gestión si no hay datos
    }
  }, [empleado, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    if (formData.contraseña !== formData.confirmar_contraseña) {
      setMensaje('Las contraseñas no coinciden.');
      setEsError(true);
      return;
    }

    try {
      let rol = 'atencion';
      const puesto = empleado.puesto.toLowerCase();
      if (puesto.includes('supervisor') || puesto.includes('gerente')) {
        rol = 'supervisor';
      }

      const resUsuario = await fetch(`${API_URL}/usuarios`, {
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
        throw new Error(dataUsuario.error || 'Error al crear el usuario.');
      }

      setShowModal(true);

    } catch (error) {
      setMensaje(error.message);
      setEsError(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/empleado'); // Volver al listado de empleados
  };

  const handleOmitir = () => {
    navigate('/empleado');
  };

  if (!empleado) return null;

  return (
    <div className="client-manager-container" style={{maxWidth: '600px', margin: '40px auto'}}>
      <h1 className="main-title">Crear Usuario para Empleado</h1>
      <hr className="header-separator" />
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e9ecef',
        fontSize: '0.95rem'
      }}>
        <p style={{margin: '5px 0'}}><strong>Empleado:</strong> {empleado.nombre} {empleado.apellido}</p>
        <p style={{margin: '5px 0'}}><strong>DNI:</strong> {empleado.dni}</p>
        <p style={{margin: '5px 0'}}><strong>Puesto:</strong> {empleado.puesto}</p>
      </div>

      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner-shadow" style={{marginTop: '0'}}>
        
        <div className="form-group-client">
          <label className="form-label-client">Nombre de Usuario</label>
          <input
            className="form-input-client"
            type="text"
            name="nombre_usuario"
            onChange={handleChange}
            required
            value={formData.nombre_usuario}
            placeholder="Ej: jperez"
          />
        </div>

        <div className="form-group-client">
          <label className="form-label-client">Contraseña</label>
          <input
            className="form-input-client"
            type="password"
            name="contraseña"
            onChange={handleChange}
            required
            value={formData.contraseña}
            minLength="4"
          />
        </div>

        <div className="form-group-client">
          <label className="form-label-client">Confirmar Contraseña</label>
          <input
            className="form-input-client"
            type="password"
            name="confirmar_contraseña"
            onChange={handleChange}
            required
            value={formData.confirmar_contraseña}
            minLength="4"
          />
        </div>

        <div className="form-actions-client-full-width" style={{marginTop: '20px'}}>
          <button type="submit" className="btn-submit-client-full-width">
            Crear Usuario
          </button>
        </div>
      </form>

      <button 
        onClick={handleOmitir}
        className="btn-back-link"
        style={{display: 'block', margin: '20px auto', textAlign: 'center'}}
      >
        Omitir (Volver al listado)
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🎉</span>
            <h3>¡Usuario Creado!</h3>
            <p>El usuario <strong>{formData.nombre_usuario}</strong> ha sido vinculado exitosamente.</p>
            <button className="modal-close-btn" onClick={closeModal}>
              Volver a Empleados
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroUsuarioEmpleado;