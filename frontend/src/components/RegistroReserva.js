import React, { useState, useEffect } from 'react';

const RegistroReserva = ({ apiBaseUrl, onBack, onSuccess, reservaToEdit }) => {
  
  const [datos, setDatos] = useState(() => {
    const baseData = reservaToEdit ? {
        id_reserva: reservaToEdit.id_reserva,
        id_cliente: reservaToEdit.cliente?.id_cliente || reservaToEdit.id_cliente || '',
        patente: reservaToEdit.vehiculo?.patente || reservaToEdit.patente || '',
        fecha_inicio_deseada: reservaToEdit.fecha_inicio_deseada || '',
        fecha_fin_deseada: reservaToEdit.fecha_fin_deseada || ''
    } : {
        id_cliente: '',
        patente: '',
        fecha_inicio_deseada: '',
        fecha_fin_deseada: ''
    };
    return baseData;
  });

  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reservaProcesada, setReservaProcesada] = useState(null);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(false);

  // --- LÓGICA DE FECHAS ---
  const hoy = new Date();
  
  // Fecha Mínima: Mañana (D+1)
  const tomorrow = new Date();
  tomorrow.setDate(hoy.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Fecha Máxima de Reserva (Lead Time): Hoy + 7 días
  const maxLeadTime = new Date();
  maxLeadTime.setDate(hoy.getDate() + 7);
  const maxLeadTimeStr = maxLeadTime.toISOString().split('T')[0];

  // Cargar Clientes al inicio
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/clientes`);
        if (response.ok) {
            setClientes(await response.json());
        }
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };
    fetchClientes();
  }, [apiBaseUrl]);

  // --- EFECTO: Buscar Vehículos Disponibles cuando cambian las fechas ---
  useEffect(() => {
    const { fecha_inicio_deseada, fecha_fin_deseada } = datos;

    // Solo buscar si ambas fechas están completas
    if (fecha_inicio_deseada && fecha_fin_deseada) {
        
        // Validar orden de fechas antes de llamar a la API
        if (fecha_inicio_deseada >= fecha_fin_deseada) {
            setVehiculosDisponibles([]);
            return;
        }

        const buscarDisponibles = async () => {
            setCargandoVehiculos(true);
            try {
                const response = await fetch(`${apiBaseUrl}/vehiculos/disponibles?fecha_inicio=${fecha_inicio_deseada}&fecha_fin=${fecha_fin_deseada}`);
                if (response.ok) {
                    const data = await response.json();
                    setVehiculosDisponibles(data);
                } else {
                    setVehiculosDisponibles([]);
                }
            } catch (error) {
                console.error("Error buscando vehículos:", error);
                setVehiculosDisponibles([]);
            } finally {
                setCargandoVehiculos(false);
            }
        };
        buscarDisponibles();
    } else {
        setVehiculosDisponibles([]);
    }
  }, [datos.fecha_inicio_deseada, datos.fecha_fin_deseada, apiBaseUrl]);


  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
    // Si cambia las fechas, limpiar la selección de vehículo si ya no es válido (opcional, pero recomendado)
    if (e.target.name === 'fecha_inicio_deseada' || e.target.name === 'fecha_fin_deseada') {
        setDatos(prev => ({ ...prev, [e.target.name]: e.target.value, patente: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    const inicioStr = datos.fecha_inicio_deseada;
    const finStr = datos.fecha_fin_deseada;
    
    // 1. Validación: Fecha Inicio > Mañana
    if (inicioStr < tomorrowStr) {
        setMensaje('Error: La reserva debe ser para un día posterior al actual.');
        setEsError(true);
        return;
    }

    // 2. Validación: Fecha Inicio <= Hoy + 7 días (Lead Time)
    if (inicioStr > maxLeadTimeStr) {
        setMensaje('Error: No se puede reservar con más de 7 días de anticipación.');
        setEsError(true);
        return;
    }

    // 3. Validación: Fin > Inicio
    if (inicioStr >= finStr) {
        setMensaje('Error: La fecha de fin debe ser posterior a la fecha de inicio.');
        setEsError(true);
        return;
    }
    
    try {
        const isEdit = reservaToEdit && reservaToEdit.id_reserva;
        const url = isEdit 
          ? `${apiBaseUrl}/reservas/${reservaToEdit.id_reserva}` 
          : `${apiBaseUrl}/reservas`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || `Error ${response.status}`);
        }
        
        // Éxito
        setReservaProcesada({
            id: result.id_reserva || reservaToEdit.id_reserva,
            ...datos,
            cliente: clientes.find(c => c.id_cliente == datos.id_cliente),
            vehiculo: vehiculosDisponibles.find(v => v.patente === datos.patente) || { patente: datos.patente } // Fallback si no está en la lista actual
        });
        setShowModal(true);

        if (!isEdit) {
            setDatos({
                id_cliente: '', patente: '',
                fecha_inicio_deseada: '', fecha_fin_deseada: ''
            });
            setVehiculosDisponibles([]);
        }

    } catch (error) {
        setMensaje(`Error: ${error.message}`);
        setEsError(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setReservaProcesada(null);
    onSuccess(); 
  };

  const isEditMode = reservaToEdit && reservaToEdit.id_reserva;

  return (
    <div className="form-card">
      <h2 className="form-title">
        {isEditMode ? `Editar Reserva #${reservaToEdit.id_reserva}` : "Registro de Nueva Reserva"}
      </h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        
        {/* PASO 1: FECHAS (Primero) */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha Inicio Deseada:</label>
                <input 
                className="form-input"
                type="date" 
                name="fecha_inicio_deseada" 
                onChange={handleChange} 
                required 
                value={datos.fecha_inicio_deseada}
                min={tomorrowStr} 
                max={maxLeadTimeStr} // Restricción visual del input
                title="Máximo 7 días de anticipación"
                />
                <small style={{fontSize: '0.75rem', color: '#666'}}>Máx. 7 días de anticipación</small>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha Fin Deseada:</label>
                <input 
                className="form-input"
                type="date" 
                name="fecha_fin_deseada" 
                onChange={handleChange} 
                required 
                value={datos.fecha_fin_deseada}
                min={datos.fecha_inicio_deseada || tomorrowStr} 
                max="2099-12-31"
                />
            </div>
        </div>

        {/* PASO 2: CLIENTE */}
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
        
        {/* PASO 3: VEHÍCULO (Filtrado) */}
        <div className="form-group">
            <label>Vehículo Disponible:</label>
            <select 
                className="form-select" 
                name="patente" 
                onChange={handleChange} 
                value={datos.patente}
                required
                disabled={!datos.fecha_inicio_deseada || !datos.fecha_fin_deseada || cargandoVehiculos}
            >
            <option value="">
                {cargandoVehiculos 
                    ? "Buscando disponibilidad..." 
                    : (!datos.fecha_inicio_deseada || !datos.fecha_fin_deseada)
                        ? "Seleccione fechas primero"
                        : vehiculosDisponibles.length === 0 
                            ? "No hay vehículos disponibles para estas fechas" 
                            : "Seleccione Vehículo"}
            </option>
            
            {vehiculosDisponibles.map(v => (
                <option key={v.patente} value={v.patente}>
                    {v.marca} {v.modelo} ({v.patente}) - ${v.precio_diario}/día
                </option>
            ))}
            </select>
        </div>

        <button type="submit" className="btn-primary" disabled={cargandoVehiculos || vehiculosDisponibles.length === 0}>
          {isEditMode ? 'Actualizar Reserva' : 'Registrar Reserva'}
        </button>
      </form>

      <button className="btn-secondary" onClick={onBack}>
        Volver
      </button>

      {showModal && reservaProcesada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">📅</span>
            <h3>{isEditMode ? '¡Reserva Actualizada!' : '¡Reserva Creada!'}</h3>
            <div className="modal-details" style={{textAlign: 'left', margin: '1rem 0'}}>
                <p><strong>Cliente:</strong> {reservaProcesada.cliente?.nombre} {reservaProcesada.cliente?.apellido}</p>
                <p><strong>Vehículo:</strong> {reservaProcesada.vehiculo?.patente}</p>
                <p><strong>Fechas:</strong> {reservaProcesada.fecha_inicio_deseada} al {reservaProcesada.fecha_fin_deseada}</p>
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