import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrarEmpleado = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [datosEmpleado, setDatosEmpleado] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    puesto: 'Atencion' // Valor por defecto
  });
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [empleadoRegistrado, setEmpleadoRegistrado] = useState(null);

  const handleChange = (e) => {
    setDatosEmpleado({ ...datosEmpleado, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      const response = await fetch(`${apiBaseUrl}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEmpleado),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      // Éxito
      setEmpleadoRegistrado(result);
      setShowModal(true);
      
      setDatosEmpleado({ 
        nombre: '', 
        apellido: '', 
        dni: '', 
        telefono: '', 
        email: '', 
        puesto: 'Atencion' 
      });
    
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar empleado:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEmpleadoRegistrado(null);
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Registro de Nuevo Empleado</h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        
        <div className="form-group">
            <label>Nombre:</label>
            <input className="form-input" type="text" name="nombre" onChange={handleChange} required value={datosEmpleado.nombre} />
        </div>
        
        <div className="form-group">
            <label>Apellido:</label>
            <input className="form-input" type="text" name="apellido" onChange={handleChange} required value={datosEmpleado.apellido} />
        </div>
        
        <div className="form-group">
            <label>DNI:</label>
            <input className="form-input" type="text" name="dni" onChange={handleChange} required value={datosEmpleado.dni} />
        </div>
        
        <div className="form-group">
            <label>Teléfono:</label>
            <input className="form-input" type="text" name="telefono" onChange={handleChange} value={datosEmpleado.telefono} />
        </div>
        
        <div className="form-group">
            <label>Email:</label>
            <input className="form-input" type="email" name="email" onChange={handleChange} required value={datosEmpleado.email} />
        </div>

        <div className="form-group">
            <label>Puesto:</label>
            <select className="form-select" name="puesto" onChange={handleChange} required value={datosEmpleado.puesto}>
                <option value="Atencion">Atención al Cliente</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Mecanico">Mecánico</option>
                <option value="Gerente">Gerente</option>
            </select>
        </div>

        <button type="submit" className="btn-primary">Registrar Empleado</button>
      </form>
      
      <button className="btn-secondary" onClick={() => navigate('/home')}>
        Volver al Menú
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && empleadoRegistrado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">👔</span>
            <h3>¡Empleado Registrado!</h3>
            <p>El empleado ha sido dado de alta correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">ID Empleado:</span>
                <span className="detail-value">#{empleadoRegistrado.id_empleado}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{empleadoRegistrado.nombre} {empleadoRegistrado.apellido}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Puesto:</span>
                <span className="detail-value">{empleadoRegistrado.puesto}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{empleadoRegistrado.email}</span>
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

export default RegistrarEmpleado;
