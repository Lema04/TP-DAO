import React, { useState, useEffect } from 'react';

const RegistroReserva = ({ apiBaseUrl, onBack, onSuccess, reservaToEdit }) => {
  
  const [datos, setDatos] = useState(() => {
    // Si estamos editando, usamos los datos de la reserva, si no, valores por defecto
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

  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reservaProcesada, setReservaProcesada] = useState(null);

  // --- LÓGICA DE FECHAS DE VALIDACIÓN ---
  const hoy = new Date();
  
  // Fecha Mínima (Mañana - D+1)
  const tomorrow = new Date();
  tomorrow.setDate(hoy.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0]; // String: 2025-11-25
  
  // Límite Máximo (Hoy + 30 días)
  const maxDateObj = new Date();
  maxDateObj.setDate(hoy.getDate() + 30); 
  const maxDateStr = maxDateObj.toISOString().split('T')[0];
  // ------------------------------------

  // Cargar datos auxiliares (Clientes y Vehículos)
  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Error cargando ${endpoint}`);
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

    // Obtenemos las fechas como strings para la validación simple
    const inicioStr = datos.fecha_inicio_deseada;
    const finStr = datos.fecha_fin_deseada;
    
    // --- FIX CRÍTICO: Validación D+1 mediante comparación de strings (seguro y simple) ---
    if (inicioStr < tomorrowStr) {
        setMensaje('Error: La reserva debe ser para un día posterior al actual.');
        setEsError(true);
        return;
    }
    // --- FIN FIX ---

    // Usamos objetos Date para la validación de orden cronológico (Fin > Inicio)
    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);

    if (inicio >= fin) {
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
        
        // Éxito: Mostrar modal
        setReservaProcesada({
            id: result.id_reserva || reservaToEdit.id_reserva,
            ...datos,
            cliente: clientes.find(c => c.id_cliente == datos.id_cliente),
            vehiculo: vehiculos.find(v => v.patente === datos.patente)
        });
        setShowModal(true);

        // Limpieza de formulario en creación
        if (!isEdit) {
            setDatos({
                id_cliente: '', patente: '',
                fecha_inicio_deseada: '', fecha_fin_deseada: ''
            });
        }

    } catch (error) {
        setMensaje(`Error: ${error.message}`);
        setEsError(true);
        console.error('Error al procesar reserva:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setReservaProcesada(null);
    onSuccess(); // Recarga la lista en GestionReservas
  };

  const isEditMode = reservaToEdit && reservaToEdit.id_reserva;

  return (
    <div className="form-card">
      <h2 className="form-title">
        {isEditMode ? `Editar Reserva #${reservaToEdit.id_reserva}` : "Registro de Nueva Reserva"}
      </h2>
      
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
            <select 
                className="form-select" 
                name="patente" 
                onChange={handleChange} 
                value={datos.patente}
                disabled={isEditMode}
            >
            <option value="">Seleccione Vehículo</option>
            {/* FILTRO: Excluye Alquilado/Mantenimiento y permite Reservado */}
            {vehiculos
                .filter(v => 
                    v.estado !== 'Alquilado' && v.estado !== 'Mantenimiento'
                )
                .map(v => (
                <option key={v.patente} value={v.patente}>
                    {v.marca} {v.modelo} ({v.patente}) - Estado: {v.estado}
                </option>
                ))}
            </select>
            <small style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'block'}}>
                Solo se listan autos Disponibles o Reservados.
            </small>
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
            min={tomorrowStr} // Mínimo Mañana (D+1)
            max={maxDateStr} // Máximo 30 días
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
            min={datos.fecha_inicio_deseada || tomorrowStr} 
            max={maxDateStr}
            />
        </div>

        <button type="submit" className="btn-primary">
          {isEditMode ? 'Actualizar Reserva' : 'Registrar Reserva'}
        </button>
      </form>

      <button className="btn-secondary" onClick={onBack}>
        Volver
      </button>

      {/* MODAL DE ÉXITO (Se asume que funciona) */}
      {showModal && reservaProcesada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">📅</span>
            <h3>{isEditMode ? '¡Reserva Actualizada!' : '¡Reserva Creada!'}</h3>
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