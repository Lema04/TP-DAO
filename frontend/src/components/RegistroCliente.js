// --- /frontend/src/components/RegistroCliente.js ---

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistroCliente = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clienteRegistrado, setClienteRegistrado] = useState(null);

  const handleChange = (e) => {
    setDatosCliente({ ...datosCliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      const response = await fetch(`${apiBaseUrl}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCliente),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      // Éxito
      setClienteRegistrado(result);
      setShowModal(true);
      
      setDatosCliente({ nombre: '', apellido: '', dni: '', direccion: '', telefono: '', email: '' });
    
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar cliente:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setClienteRegistrado(null);
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Registro de Nuevo Cliente</h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        
        <div className="form-group">
            <label>Nombre:</label>
            <input className="form-input" type="text" name="nombre" onChange={handleChange} required value={datosCliente.nombre} />
        </div>
        
        <div className="form-group">
            <label>Apellido:</label>
            <input className="form-input" type="text" name="apellido" onChange={handleChange} required value={datosCliente.apellido} />
        </div>
        
        <div className="form-group">
            <label>DNI:</label>
            <input className="form-input" type="text" name="dni" onChange={handleChange} required value={datosCliente.dni} />
        </div>
        
        <div className="form-group">
            <label>Dirección:</label>
            <input className="form-input" type="text" name="direccion" onChange={handleChange} value={datosCliente.direccion} />
        </div>
        
        <div className="form-group">
            <label>Teléfono:</label>
            <input className="form-input" type="text" name="telefono" onChange={handleChange} value={datosCliente.telefono} />
        </div>
        
        <div className="form-group">
            <label>Email:</label>
            <input className="form-input" type="email" name="email" onChange={handleChange} required value={datosCliente.email} />
        </div>

        <button type="submit" className="btn-primary">Registrar Cliente</button>
      </form>
      
      <button className="btn-secondary" onClick={() => navigate('/home')}>
        Volver al Menú
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && clienteRegistrado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">👤</span>
            <h3>¡Cliente Registrado!</h3>
            <p>El cliente ha sido dado de alta correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">ID Cliente:</span>
                <span className="detail-value">#{clienteRegistrado.id_cliente}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{clienteRegistrado.nombre} {clienteRegistrado.apellido}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">DNI:</span>
                <span className="detail-value">{clienteRegistrado.dni}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{clienteRegistrado.email}</span>
              </div>
            </div>

            <button className="modal-close-btn" onClick={closeModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroCliente;