// --- /frontend/src/components/RegistroUsuario.js ---

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:5000'; 

const RegistroUsuario = () => {
  const navigate = useNavigate();
  const [datosRegistro, setDatosRegistro] = useState({
    nombre_usuario: '',
    contraseña: '',
    rol: 'cliente' 
  });
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setDatosRegistro({ ...datosRegistro, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro),
      });

      const result = await response.json();

      if (result.status === 200) {
        // Éxito
        setShowModal(true);
        setDatosRegistro({ nombre_usuario: '', contraseña: '', rol: 'cliente' });
      } else {
        setMensaje(`Error: ${result.mensaje}`);
        setEsError(true);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor.');
      setEsError(true);
      console.error('Error al registrar usuario:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/login'); // Redirigir al login al cerrar el modal
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Registrar Nuevo Usuario</h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        <div className="form-group">
            <label>Nombre de Usuario:</label>
            <input className="form-input" type="text" name="nombre_usuario" onChange={handleChange} required value={datosRegistro.nombre_usuario} />
        </div>

        <div className="form-group">
            <label>Contraseña:</label>
            <input className="form-input" type="password" name="contraseña" onChange={handleChange} required value={datosRegistro.contraseña} />
        </div>
        
        <button type="submit" className="btn-primary">Crear Cuenta</button>
      </form>

      <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
        Volver al Login
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🎉</span>
            <h3>¡Cuenta Creada!</h3>
            <p>Tu usuario ha sido registrado exitosamente.</p>
            
            <div className="modal-details">
                <p>Ahora puedes iniciar sesión con tus credenciales.</p>
            </div>

            <button className="modal-close-btn" onClick={closeModal}>
              Ir al Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroUsuario;