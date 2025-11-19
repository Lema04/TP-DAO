import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GestionReservas = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [datosConversion, setDatosConversion] = useState({
    id_empleado: '',
    costo_total: ''
  });
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    cargarReservas();
    cargarEmpleados();
  }, []);

  const cargarReservas = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/reservas`);
      if (!response.ok) throw new Error('Error al cargar reservas');
      const data = await response.json();
      setReservas(data);
    } catch (error) {
      console.error('Error:', error);
      setMensaje(`Error al cargar reservas: ${error.message}`);
      setEsError(true);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/empleados`);
      if (!response.ok) throw new Error('Error al cargar empleados');
      const data = await response.json();
      setEmpleados(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const abrirModalConversion = (reserva) => {
    if (reserva.estado !== 'Pendiente') {
      setMensaje(`Esta reserva ya está ${reserva.estado.toLowerCase()}.`);
      setEsError(true);
      return;
    }
    setReservaSeleccionada(reserva);
    setShowModal(true);
    setDatosConversion({ id_empleado: '', costo_total: '' });
  };

  const convertirAAlquiler = async () => {
    if (!datosConversion.id_empleado || !datosConversion.costo_total) {
      setMensaje('Debe completar todos los campos.');
      setEsError(true);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/reservas/${reservaSeleccionada.id_reserva}/iniciar_alquiler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosConversion)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      setMensaje(`¡Alquiler creado exitosamente! ID: ${result.id_alquiler}`);
      setEsError(false);
      setShowModal(false);
      setReservaSeleccionada(null);
      cargarReservas(); // Recargar lista
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
    }
  };

  const getEstadoClase = (estado) => {
    const clases = {
      'Pendiente': 'estado-pendiente',
      'Convertida': 'estado-convertida',
      'Cancelada': 'estado-cancelada'
    };
    return clases[estado] || '';
  };

  return (
    <div className="form-card wide">
      <h2 className="form-title">Gestión de Reservas</h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      {reservas.length === 0 ? (
        <p style={{textAlign: 'center', color: '#666'}}>No hay reservas registradas.</p>
      ) : (
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1rem'}}>
          <thead>
            <tr style={{backgroundColor: '#f5f5f5', borderBottom: '2px solid #cc0000'}}>
              <th style={{padding: '0.75rem', textAlign: 'left'}}>ID</th>
              <th style={{padding: '0.75rem', textAlign: 'left'}}>Cliente</th>
              <th style={{padding: '0.75rem', textAlign: 'left'}}>Vehículo</th>
              <th style={{padding: '0.75rem', textAlign: 'left'}}>Fecha Inicio</th>
              <th style={{padding: '0.75rem', textAlign: 'left'}}>Fecha Fin</th>
              <th style={{padding: '0.75rem', textAlign: 'left'}}>Estado</th>
              <th style={{padding: '0.75rem', textAlign: 'center'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id_reserva} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: '0.75rem'}}>#{reserva.id_reserva}</td>
                <td style={{padding: '0.75rem'}}>
                  {reserva.cliente ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}` : reserva.id_cliente}
                </td>
                <td style={{padding: '0.75rem'}}>
                  {reserva.vehiculo ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo} (${reserva.patente})` : reserva.patente || 'Sin asignar'}
                </td>
                <td style={{padding: '0.75rem'}}>{reserva.fecha_inicio_deseada || 'N/A'}</td>
                <td style={{padding: '0.75rem'}}>{reserva.fecha_fin_deseada || 'N/A'}</td>
                <td style={{padding: '0.75rem'}}>
                  <span className={getEstadoClase(reserva.estado)} style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {reserva.estado}
                  </span>
                </td>
                <td style={{padding: '0.75rem', textAlign: 'center'}}>
                  {reserva.estado === 'Pendiente' && (
                    <button
                      onClick={() => abrirModalConversion(reserva)}
                      className="btn-primary"
                      style={{fontSize: '0.85rem', padding: '0.4rem 0.8rem'}}
                    >
                      Convertir a Alquiler
                    </button>
                  )}
                  {reserva.estado === 'Convertida' && (
                    <span style={{color: '#28a745', fontSize: '0.85rem'}}>✓ Convertida</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="btn-secondary" onClick={() => navigate('/home')} style={{marginTop: '1.5rem'}}>
        Volver al Menú
      </button>

      {/* MODAL DE CONVERSIÓN */}
      {showModal && reservaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🚗</span>
            <h3>Convertir Reserva a Alquiler</h3>
            <p>Reserva #{reservaSeleccionada.id_reserva}</p>
            
            <div className="modal-details" style={{textAlign: 'left'}}>
              <div className="detail-row">
                <span className="detail-label">Cliente:</span>
                <span className="detail-value">
                  {reservaSeleccionada.cliente ? `${reservaSeleccionada.cliente.nombre} ${reservaSeleccionada.cliente.apellido}` : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Vehículo:</span>
                <span className="detail-value">
                  {reservaSeleccionada.vehiculo ? `${reservaSeleccionada.vehiculo.marca} ${reservaSeleccionada.vehiculo.modelo}` : 'Sin asignar'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Período:</span>
                <span className="detail-value">
                  {reservaSeleccionada.fecha_inicio_deseada} a {reservaSeleccionada.fecha_fin_deseada}
                </span>
              </div>
            </div>

            <div className="form-group" style={{marginTop: '1rem'}}>
              <label>Empleado que procesa:</label>
              <select
                className="form-select"
                value={datosConversion.id_empleado}
                onChange={(e) => setDatosConversion({...datosConversion, id_empleado: e.target.value})}
              >
                <option value="">Seleccione Empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre} {emp.apellido} ({emp.puesto})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Costo Total:</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={datosConversion.costo_total}
                onChange={(e) => setDatosConversion({...datosConversion, costo_total: e.target.value})}
                placeholder="Ingrese el costo total"
              />
            </div>

            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button className="btn-primary" onClick={convertirAAlquiler}>
                Confirmar Conversión
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowModal(false);
                  setReservaSeleccionada(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .estado-pendiente {
          background-color: #fff3cd;
          color: #856404;
        }
        .estado-convertida {
          background-color: #d4edda;
          color: #155724;
        }
        .estado-cancelada {
          background-color: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
};

export default GestionReservas;
