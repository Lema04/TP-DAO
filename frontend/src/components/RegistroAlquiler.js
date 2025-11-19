// --- /frontend/src/components/RegistroAlquiler.js ---

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistroAlquiler = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [datos, setDatos] = useState({
    id_cliente: '',
    patente: '',
    id_empleado: '',
    fecha_inicio: '',
    fecha_fin: '',
    costo_total: 0.0,
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alquilerRegistrado, setAlquilerRegistrado] = useState(null);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json(); 
        if (!response.ok) {
          throw new Error(data.error || `Error cargando ${endpoint}`);
        }
        setter(data);
      } catch (error) {
        console.error(`Error cargando ${endpoint}:`, error);
        setMensaje(`Error cargando ${endpoint}: ${error.message}`);
        setEsError(true);
      }
    };

    fetchData('vehiculos', setVehiculos);
    fetchData('clientes', setClientes);
    fetchData('empleados', setEmpleados);
  }, [apiBaseUrl]);


  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      const response = await fetch(`${apiBaseUrl}/alquileres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }
      
      // Éxito: Mostrar modal
      setAlquilerRegistrado({
          id: result.id_alquiler,
          ...datos,
          // Enriquecemos datos para el modal si es posible
          cliente: clientes.find(c => c.id_cliente == datos.id_cliente),
          vehiculo: vehiculos.find(v => v.patente === datos.patente)
      });
      setShowModal(true);

      setDatos({
        id_cliente: '', patente: '', id_empleado: '',
        fecha_inicio: '', fecha_fin: '', costo_total: 0.0
      });

    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar alquiler:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setAlquilerRegistrado(null);
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Registro de Nuevo Alquiler</h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        
        <div className="form-group">
            <label>Cliente:</label>
            <select className="form-select" name="id_cliente" onChange={handleChange} required value={datos.id_cliente}>
            <option value="">Seleccione Cliente</option>
            {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} {c.apellido} (DNI: {c.dni})
                </option>
            ))}
            </select>
        </div>
        
        <div className="form-group">
            <label>Empleado:</label>
            <select className="form-select" name="id_empleado" onChange={handleChange} required value={datos.id_empleado}>
            <option value="">Seleccione Empleado</option>
            {empleados.map(e => (
                <option key={e.id_empleado} value={e.id_empleado}>
                {e.nombre} {e.apellido} (Rol: {e.puesto})
                </option>
            ))}
            </select>
        </div>

        <div className="form-group">
            <label>Vehículo (Patente):</label>
            <select className="form-select" name="patente" onChange={handleChange} required value={datos.patente}>
            <option value="">Seleccione Vehículo Disponible</option>
            {vehiculos
                .filter(v => v.estado.toLowerCase() === 'disponible')
                .map(v => (
                <option key={v.patente} value={v.patente}>
                    {v.marca} {v.modelo} ({v.patente})
                </option>
                ))}
            </select>
        </div>

        <div className="form-group">
            <label>Fecha Inicio:</label>
            <input 
            className="form-input"
            type="date" 
            name="fecha_inicio" 
            onChange={handleChange} 
            required 
            value={datos.fecha_inicio}
            min={hoy} 
            />
        </div>

        <div className="form-group">
            <label>Fecha Fin:</label>
            <input 
            className="form-input"
            type="date" 
            name="fecha_fin" 
            onChange={handleChange} 
            required 
            value={datos.fecha_fin}
            min={datos.fecha_inicio || hoy} 
            />
        </div>
        
        <div className="form-group">
            <label>Costo Total:</label>
            <input className="form-input" type="number" name="costo_total" onChange={handleChange} required value={datos.costo_total} min="0" step="0.01" />
        </div>

        <button type="submit" className="btn-primary">Registrar Alquiler</button>
      </form>

      <button className="btn-secondary" onClick={() => navigate('/home')}>
        Volver al Menú
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && alquilerRegistrado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">✅</span>
            <h3>¡Alquiler Registrado!</h3>
            <p>El alquiler se ha procesado correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">ID Alquiler:</span>
                <span className="detail-value">#{alquilerRegistrado.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cliente:</span>
                <span className="detail-value">
                    {alquilerRegistrado.cliente ? `${alquilerRegistrado.cliente.nombre} ${alquilerRegistrado.cliente.apellido}` : alquilerRegistrado.id_cliente}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Vehículo:</span>
                <span className="detail-value">
                    {alquilerRegistrado.vehiculo ? `${alquilerRegistrado.vehiculo.marca} ${alquilerRegistrado.vehiculo.modelo}` : alquilerRegistrado.patente}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Desde:</span>
                <span className="detail-value">{alquilerRegistrado.fecha_inicio}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Hasta:</span>
                <span className="detail-value">{alquilerRegistrado.fecha_fin}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total:</span>
                <span className="detail-value">${alquilerRegistrado.costo_total}</span>
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

export default RegistroAlquiler;