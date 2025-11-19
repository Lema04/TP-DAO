import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CrearReserva = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [datos, setDatos] = useState({
    id_cliente: '',
    patente: '',
    fecha_inicio_deseada: '',
    fecha_fin_deseada: ''
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reservaCreada, setReservaCreada] = useState(null);

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
  }, [apiBaseUrl]);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      const response = await fetch(`${apiBaseUrl}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }
      
      // Éxito: Mostrar modal
      setReservaCreada({
        id: result.id_reserva,
        ...datos,
        cliente: clientes.find(c => c.id_cliente == datos.id_cliente),
        vehiculo: vehiculos.find(v => v.patente === datos.patente)
      });
      setShowModal(true);

      setDatos({
        id_cliente: '', patente: '',
        fecha_inicio_deseada: '', fecha_fin_deseada: ''
      });

    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al crear reserva:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setReservaCreada(null);
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Crear Nueva Reserva</h2>
      
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
          <label>Vehículo (Patente):</label>
          <select className="form-select" name="patente" onChange={handleChange} required value={datos.patente}>
            <option value="">Seleccione Vehículo Disponible</option>
            {vehiculos
              .filter(v => v.estado === 'Disponible')
              .map(v => (
                <option key={v.patente} value={v.patente}>
                  {v.marca} {v.modelo} ({v.patente}) - ${v.precio_diario}/día
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha Inicio Deseada:</label>
          <input 
            className="form-input"
            type="date" 
            name="fecha_inicio_deseada" 
            onChange={handleChange} 
            required 
            value={datos.fecha_inicio_deseada}
            min={hoy} 
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin Deseada:</label>
          <input 
            className="form-input"
            type="date" 
            name="fecha_fin_deseada" 
            onChange={handleChange} 
            required 
            value={datos.fecha_fin_deseada}
            min={datos.fecha_inicio_deseada || hoy} 
          />
        </div>

        <button type="submit" className="btn-primary">Crear Reserva</button>
      </form>

      <button className="btn-secondary" onClick={() => navigate('/home')}>
        Volver al Menú
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && reservaCreada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">✅</span>
            <h3>¡Reserva Creada!</h3>
            <p>La reserva se ha registrado correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">ID Reserva:</span>
                <span className="detail-value">#{reservaCreada.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cliente:</span>
                <span className="detail-value">
                  {reservaCreada.cliente ? `${reservaCreada.cliente.nombre} ${reservaCreada.cliente.apellido}` : reservaCreada.id_cliente}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Vehículo:</span>
                <span className="detail-value">
                  {reservaCreada.vehiculo ? `${reservaCreada.vehiculo.marca} ${reservaCreada.vehiculo.modelo}` : reservaCreada.patente}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Desde:</span>
                <span className="detail-value">{reservaCreada.fecha_inicio_deseada}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Hasta:</span>
                <span className="detail-value">{reservaCreada.fecha_fin_deseada}</span>
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

export default CrearReserva;
