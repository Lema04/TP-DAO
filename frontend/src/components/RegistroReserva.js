import React, { useState, useEffect } from 'react';

const RegistroReserva = ({ apiBaseUrl, onBack, onSuccess, reservaToEdit }) => {
  const [datos, setDatos] = useState({
    id_cliente: '',
    patente: '', // Puede estar vacío si no se asigna vehículo aún
    fecha_inicio_deseada: '',
    fecha_fin_deseada: ''
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reservaProcesada, setReservaProcesada] = useState(null);

  const hoy = new Date().toISOString().split('T')[0];

  // Cargar datos auxiliares (Clientes y Vehículos)
  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Error cargando ${endpoint}`);
        setter(data);
      } catch (error) {
        console.error(error);
        setMensaje(`Error cargando datos: ${error.message}`);
        setEsError(true);
      }
    };

    fetchData('vehiculos', setVehiculos);
    fetchData('clientes', setClientes);

    // Si es edición, rellenar formulario
    if (reservaToEdit) {
        setDatos({
            id_cliente: reservaToEdit.cliente.id_cliente,
            patente: reservaToEdit.vehiculo ? reservaToEdit.vehiculo.patente : '',
            fecha_inicio_deseada: reservaToEdit.fecha_inicio_deseada,
            fecha_fin_deseada: reservaToEdit.fecha_fin_deseada
        });
    }
  }, [apiBaseUrl, reservaToEdit]);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    // Validar fechas
    if (datos.fecha_inicio_deseada > datos.fecha_fin_deseada) {
        setMensaje("La fecha de inicio no puede ser posterior a la de fin.");
        setEsError(true);
        return;
    }

    const method = reservaToEdit ? 'PUT' : 'POST';
    const url = reservaToEdit 
        ? `${apiBaseUrl}/reservas/${reservaToEdit.id_reserva}`
        : `${apiBaseUrl}/reservas`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      // Preparar datos para el modal de éxito
      setReservaProcesada({
          id: result.id_reserva || reservaToEdit?.id_reserva,
          ...datos,
          cliente: clientes.find(c => c.id_cliente == datos.id_cliente),
          vehiculo: vehiculos.find(v => v.patente === datos.patente)
      });
      
      setShowModal(true);

    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setReservaProcesada(null);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="form-container-inner-shadow">
      <div className="form-header-row">
        <h3 className="form-subtitle-black">
            {reservaToEdit ? `Modificar Reserva #${reservaToEdit.id_reserva}` : 'Nueva Reserva'}
        </h3>
        <button type="button" className="btn-back-link" onClick={onBack}>
            Volver al Listado
        </button>
      </div>
      
      <hr className="form-separator" />

      {mensaje && !showModal && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-fields-grid">
        
        <div className="form-group-client">
            <label className="form-label-client"><strong>Cliente</strong></label>
            <select 
                className="form-input-client" 
                name="id_cliente" 
                onChange={handleChange} 
                required 
                value={datos.id_cliente}
                disabled={!!reservaToEdit} // No solemos cambiar el cliente de una reserva ya hecha
            >
                <option value="">Seleccione Cliente</option>
                {clientes.map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} {c.apellido} (DNI: {c.dni})
                    </option>
                ))}
            </select>
        </div>

        <div className="form-group-client">
            <label className="form-label-client"><strong>Vehículo (Opcional)</strong></label>
            <select className="form-input-client" name="patente" onChange={handleChange} value={datos.patente}>
                <option value="">-- Sin Vehículo Asignado --</option>
                {vehiculos.map(v => (
                    <option key={v.patente} value={v.patente}>
                        {v.marca} {v.modelo} ({v.patente}) {v.estado !== 'Disponible' ? ` - ${v.estado}` : ''}
                    </option>
                ))}
            </select>
            <small style={{fontSize:'0.8rem', color: '#666'}}>Puede reservar sin asignar vehículo aún.</small>
        </div>

        <div className="form-group-client">
            <label className="form-label-client"><strong>Fecha Inicio Deseada</strong></label>
            <input 
                className="form-input-client"
                type="date" 
                name="fecha_inicio_deseada" 
                onChange={handleChange} 
                required 
                value={datos.fecha_inicio_deseada}
                min={!reservaToEdit ? hoy : undefined} 
            />
        </div>

        <div className="form-group-client">
            <label className="form-label-client"><strong>Fecha Fin Deseada</strong></label>
            <input 
                className="form-input-client"
                type="date" 
                name="fecha_fin_deseada" 
                onChange={handleChange} 
                required 
                value={datos.fecha_fin_deseada}
                min={datos.fecha_inicio_deseada || hoy} 
            />
        </div>

        <div className="form-actions-client-full-width">
            <button type="submit" className="btn-submit-client-full-width">
                {reservaToEdit ? 'Guardar Cambios' : 'Registrar Reserva'}
            </button>
        </div>
      </form>

      {/* MODAL DE ÉXITO */}
      {showModal && reservaProcesada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">📅</span>
            <h3>{reservaToEdit ? '¡Reserva Actualizada!' : '¡Reserva Creada!'}</h3>
            <p>La operación se ha completado correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row"><span className="detail-label">Cliente:</span> <span>{reservaProcesada.cliente?.nombre} {reservaProcesada.cliente?.apellido}</span></div>
              <div className="detail-row">
                  <span className="detail-label">Vehículo:</span> 
                  <span>{reservaProcesada.vehiculo ? `${reservaProcesada.vehiculo.marca} ${reservaProcesada.vehiculo.modelo}` : 'Pendiente de asignación'}</span>
              </div>
              <div className="detail-row"><span className="detail-label">Desde:</span> <span>{reservaProcesada.fecha_inicio_deseada}</span></div>
              <div className="detail-row"><span className="detail-label">Hasta:</span> <span>{reservaProcesada.fecha_fin_deseada}</span></div>
            </div>

            <button className="modal-close-btn" onClick={handleCloseModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroReserva;