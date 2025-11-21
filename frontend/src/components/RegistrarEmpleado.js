import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrarEmpleado = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [datosEmpleado, setDatosEmpleado] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    puesto: 'Atencion', // Valor por defecto
    id_supervisor: '' // Solo si no es supervisor
  });
  const [supervisores, setSupervisores] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [empleadoRegistrado, setEmpleadoRegistrado] = useState(null);

  useEffect(() => {
    cargarSupervisores();
  }, []);

  const cargarSupervisores = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/empleados`);
      if (response.ok) {
        const empleados = await response.json();
        // Filtrar solo supervisores
        const soloSupervisores = empleados.filter(emp => emp.puesto === 'Supervisor');
        setSupervisores(soloSupervisores);
      }
    } catch (error) {
      console.error('Error al cargar supervisores:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el puesto a Supervisor, limpiar id_supervisor
    if (name === 'puesto' && value === 'Supervisor') {
      setDatosEmpleado({ ...datosEmpleado, puesto: value, id_supervisor: '' });
    } else {
      setDatosEmpleado({ ...datosEmpleado, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      // Preparar datos para enviar
      const datosParaEnviar = {
        nombre: datosEmpleado.nombre,
        apellido: datosEmpleado.apellido,
        dni: datosEmpleado.dni,
        puesto: datosEmpleado.puesto
      };

      // Solo agregar id_supervisor si no es Supervisor
      if (datosEmpleado.puesto !== 'Supervisor' && datosEmpleado.id_supervisor) {
        datosParaEnviar.id_supervisor = parseInt(datosEmpleado.id_supervisor);
      }

      const response = await fetch(`${apiBaseUrl}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaEnviar),
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
        puesto: 'Atencion',
        id_supervisor: ''
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
    navigate('/home');
  };

  const esSupervisor = datosEmpleado.puesto === 'Supervisor';

  return (
    <div className="form-card">
      <h2 className="form-title">Registro de Nuevo Empleado</h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        
        <div className="form-group">
            <label>Nombre:</label>
            <input 
              className="form-input" 
              type="text" 
              name="nombre" 
              onChange={handleChange} 
              required 
              value={datosEmpleado.nombre} 
            />
        </div>
        
        <div className="form-group">
            <label>Apellido:</label>
            <input 
              className="form-input" 
              type="text" 
              name="apellido" 
              onChange={handleChange} 
              required 
              value={datosEmpleado.apellido} 
            />
        </div>
        
        <div className="form-group">
            <label>DNI:</label>
            <input 
              className="form-input" 
              type="text" 
              name="dni" 
              onChange={handleChange} 
              required 
              value={datosEmpleado.dni}
              pattern="\d{7,8}"
              title="Debe contener 7 u 8 dígitos"
            />
            <small>Ingrese 7 u 8 dígitos sin puntos</small>
        </div>

        <div className="form-group">
            <label>Puesto:</label>
            <select 
              className="form-select" 
              name="puesto" 
              onChange={handleChange} 
              required 
              value={datosEmpleado.puesto}
            >
                <option value="Atencion">Atención al Cliente</option>
                <option value="Supervisor">Supervisor</option>
            </select>
        </div>

        {/* Campo de Supervisor - solo visible si NO es Supervisor */}
        {!esSupervisor && (
          <div className="form-group">
            <label>Supervisor Asignado:</label>
            <select 
              className="form-select" 
              name="id_supervisor" 
              onChange={handleChange} 
              required={!esSupervisor}
              value={datosEmpleado.id_supervisor}
            >
              <option value="">Seleccione un supervisor</option>
              {supervisores.map(sup => (
                <option key={sup.id_empleado} value={sup.id_empleado}>
                  {sup.nombre} {sup.apellido}
                </option>
              ))}
            </select>
            {supervisores.length === 0 && (
              <small style={{ color: '#c53030' }}>
                No hay supervisores registrados. Debe registrar un supervisor primero.
              </small>
            )}
          </div>
        )}

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
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{empleadoRegistrado.nombre} {empleadoRegistrado.apellido}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Puesto:</span>
                <span className="detail-value">{empleadoRegistrado.puesto}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '1.5rem' }}>
              ¿Deseas crear un usuario de acceso para este empleado ahora?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={closeModal}
                style={{ marginTop: 0 }}
              >
                Omitir
              </button>
              <button 
                className="modal-close-btn"
                onClick={() => navigate('/registrar-usuario-empleado', { state: { empleado: empleadoRegistrado } })}
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistrarEmpleado;
