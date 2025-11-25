import React, { useState, useEffect } from 'react';

const RegistroMantenimiento = ({ apiBaseUrl, onBack, onSuccess, mantenimientoToEdit }) => {
  const hoy = new Date().toISOString().split('T')[0]; //
    
  // Helper para asegurar formato YYYY-MM-DD sin problemas de zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Si viene de la API con hora (ej: "2025-11-20T03:00:00.000Z"), tomamos solo la parte de la fecha.
    return dateString.split('T')[0];
  };

  // Estado inicial
  const [datos, setDatos] = useState(() => {
    const baseData = mantenimientoToEdit ? {
        patente: mantenimientoToEdit.vehiculo?.patente || mantenimientoToEdit.patente,
        // FIX: Usamos formatDate para evitar problemas de timezone al cargar
        fecha_inicio: formatDate(mantenimientoToEdit.fecha_inicio),
        fecha_fin: formatDate(mantenimientoToEdit.fecha_fin),
        tipo_servicio: mantenimientoToEdit.tipo_servicio,
        costo: mantenimientoToEdit.costo,
        estado: mantenimientoToEdit.estado // Necesario para edición
    } : {
        patente: '',
        fecha_inicio: hoy, // <-- Establecer fecha inicio a HOY por defecto
        fecha_fin: '',
        tipo_servicio: '',
        costo: 0.0,
        estado: 'En curso' // Valor por defecto si es nuevo
    };
    return baseData;
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [allMantenimientos, setAllMantenimientos] = useState([]); 
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mantenimientoProcesado, setMantenimientoProcesado] = useState(null);

  // Cargar datos (Vehículos y Mantenimientos)
  useEffect(() => {
    const fetchDatos = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Error cargando ${endpoint}`);
        setter(data);
      } catch (error) {
        setMensaje(`Error cargando ${endpoint}: ${error.message}`);
        setEsError(true);
      }
    };

    fetchDatos('vehiculos', setVehiculos);
    fetchDatos('mantenimientos', setAllMantenimientos); 
    
  }, [apiBaseUrl, mantenimientoToEdit]);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    const newInicio = datos.fecha_inicio;
    const newFin = datos.fecha_fin;
    const newPatente = datos.patente;
    const currentId = mantenimientoToEdit ? mantenimientoToEdit.id_mantenimiento : null;
    const isEditMode = !!mantenimientoToEdit;

    // 1. Validación básica de fechas
    if (newInicio > newFin) {
        setMensaje("La fecha de inicio no puede ser posterior a la de fin.");
        setEsError(true);
        return;
    }
    
    // 2. NUEVA REGLA: Forzar fecha de inicio sea HOY para nuevos registros (seguridad adicional)
    if (!isEditMode && newInicio !== hoy) {
        setMensaje("La fecha de inicio para un nuevo mantenimiento debe ser la fecha actual.");
        setEsError(true);
        return;
    }
    
    // 3. Validación de solapamiento simplificada para edición (el backend debería ser el principal validador)
    if (isEditMode) {
      const solapamiento = allMantenimientos.find(m => {
          if (m.id_mantenimiento === currentId) return false;
          if (m.vehiculo?.patente !== newPatente && m.patente !== newPatente) return false;
          const existeInicio = formatDate(m.fecha_inicio); 
          const existeFin = formatDate(m.fecha_fin); 
          return (newInicio <= existeFin && newFin >= existeInicio);
      });

      if (solapamiento) {
          setMensaje(`Error: El vehículo ${newPatente} ya tiene un mantenimiento programado que se superpone con las fechas seleccionadas (del ${formatDate(solapamiento.fecha_inicio)} al ${formatDate(solapamiento.fecha_fin)}).`);
          setEsError(true);
          return;
      }
    }


    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode
        ? `${apiBaseUrl}/mantenimientos/${mantenimientoToEdit.id_mantenimiento}`
        : `${apiBaseUrl}/mantenimientos`;

    try {
      // Filtrar datos a enviar según modo (para que el PUT no toque patente/fecha_inicio)
      const datosParaEnviar = isEditMode ? {
          fecha_fin: datos.fecha_fin,
          tipo_servicio: datos.tipo_servicio,
          costo: parseFloat(datos.costo),
          estado: datos.estado 
      } : {
          patente: datos.patente,
          fecha_inicio: datos.fecha_inicio,
          fecha_fin: datos.fecha_fin,
          tipo_servicio: datos.tipo_servicio,
          costo: parseFloat(datos.costo)
      };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaEnviar),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      // Preparar datos para el modal
      setMantenimientoProcesado({
          id: result.id_mantenimiento || mantenimientoToEdit?.id_mantenimiento,
          ...datos,
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
    setMantenimientoProcesado(null);
    if (onSuccess) onSuccess();
  };
  
  const isEditMode = !!mantenimientoToEdit;

  return (
    <div className="form-container-inner-shadow">
      <div className="form-header-row">
        <h3 className="form-subtitle-black">
            {mantenimientoToEdit ? `Modificar Mantenimiento #${mantenimientoToEdit.id_mantenimiento}` : 'Registrar Mantenimiento'}
        </h3>
        <button type="button" className="btn-back-link" onClick={onBack}>
            Volver al Listado
        </button>
      </div>
      
      <hr className="form-separator" />

      {mensaje && !showModal && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-fields-grid">
        
        <div className="form-group-client">
            <label className="form-label-client"><strong>Vehículo</strong></label>
            <select 
                className="form-input-client" 
                name="patente" 
                onChange={handleChange} 
                required 
                value={datos.patente}
                disabled={isEditMode} // La patente no se cambia
            >
                <option value="">Seleccione Vehículo</option>
                {vehiculos
                    .filter(v => v.estado !== 'Alquilado' || (isEditMode && v.patente === datos.patente))
                    .map(v => (
                    <option key={v.patente} value={v.patente}>
                        {v.marca} {v.modelo} ({v.patente})
                        {v.estado === 'Mantenimiento' ? ` - Estado: ${v.estado}` : ''}
                    </option>
                ))}
            </select>
        </div>

        <div className="form-group-client">
            <label className="form-label-client"><strong>Tipo de Servicio</strong></label>
            <input 
                className="form-input-client"
                type="text" 
                name="tipo_servicio" 
                onChange={handleChange} 
                required 
                value={datos.tipo_servicio}
                placeholder="Ej: Cambio de aceite, Revisión general..."
            />
        </div>

        {/* INPUT DE FECHA DE INICIO MODIFICADO */}
        <div className="form-group-client">
            <label className="form-label-client"><strong>Fecha Inicio</strong></label>
            <input 
                className="form-input-client disabled-input"
                type="date" 
                name="fecha_inicio" 
                onChange={handleChange} 
                required 
                value={datos.fecha_inicio}
                readOnly={true} // <-- Siempre de solo lectura
                disabled={true} // <-- Deshabilitar
            />
            <small style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'block'}}>
                La fecha de inicio se establece al día de hoy.
            </small>
        </div>

        <div className="form-group-client">
            <label className="form-label-client"><strong>Fecha Fin</strong></label>
            <input 
                className="form-input-client"
                type="date" 
                name="fecha_fin" 
                onChange={handleChange} 
                required 
                value={datos.fecha_fin}
                min={datos.fecha_inicio}
            />
        </div>

        <div className="form-group-client">
            <label className="form-label-client"><strong>Costo ($)</strong></label>
            <input 
                className="form-input-client"
                type="number" 
                name="costo" 
                onChange={handleChange} 
                required 
                value={datos.costo}
                min="0.1"
                step="0.01"
            />
        </div>
        
        {isEditMode && (
          <div className="form-group-client">
            <label className="form-label-client"><strong>Estado</strong></label>
            <select
              className="form-input-client"
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              required
            >
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        )}

        <div className="form-actions-client-full-width">
            <button type="submit" className="btn-submit-client-full-width">
                {mantenimientoToEdit ? 'Guardar Cambios' : 'Registrar Mantenimiento'}
            </button>
        </div>
      </form>

      {/* MODAL DE ÉXITO (Se asume que funciona) */}
      {showModal && mantenimientoProcesado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🔧</span>
            <h3>{mantenimientoToEdit ? '¡Modificación Exitosa!' : '¡Mantenimiento Registrado!'}</h3>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroMantenimiento;