import React, { useState, useEffect } from 'react';

const RegistroMantenimiento = ({ apiBaseUrl, onBack, onSuccess, mantenimientoToEdit }) => {
  const [datos, setDatos] = useState({
    patente: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo_servicio: '',
    costo: 0.0
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [allMantenimientos, setAllMantenimientos] = useState([]); // Nuevo estado para validar solapamiento
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mantenimientoProcesado, setMantenimientoProcesado] = useState(null);

  const hoy = new Date().toISOString().split('T')[0];

  // Helper para asegurar formato YYYY-MM-DD sin problemas de zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Si viene de la API con hora (ej: "2025-11-20T03:00:00.000Z"), tomamos solo la parte de la fecha.
    return dateString.split('T')[0];
  };

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
    fetchDatos('mantenimientos', setAllMantenimientos); // Cargamos todos los mantenimientos

    // Si es edición, rellenar formulario
    if (mantenimientoToEdit) {
        setDatos({
            patente: mantenimientoToEdit.vehiculo?.patente || mantenimientoToEdit.patente,
            // FIX: Usamos formatDate para evitar problemas de timezone al cargar
            fecha_inicio: formatDate(mantenimientoToEdit.fecha_inicio),
            fecha_fin: formatDate(mantenimientoToEdit.fecha_fin),
            tipo_servicio: mantenimientoToEdit.tipo_servicio,
            costo: mantenimientoToEdit.costo
        });
    }
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

    // 1. Validación básica de fechas
    if (newInicio > newFin) {
        setMensaje("La fecha de inicio no puede ser posterior a la de fin.");
        setEsError(true);
        return;
    }
    
    // 2. FIX CRÍTICO: Comprobar solapamiento
    const solapamiento = allMantenimientos.find(m => {
        // Excluir el registro actual si estamos en modo edición
        if (m.id_mantenimiento === currentId) return false;
        
        // Debe ser el mismo vehículo
        if (m.vehiculo?.patente !== newPatente && m.patente !== newPatente) return false;
        
        // Aseguramos formato YYYY-MM-DD para la comparación (aunque ya debería venir así)
        const existeInicio = formatDate(m.fecha_inicio); 
        const existeFin = formatDate(m.fecha_fin); 

        // Lógica de solapamiento: (InicioNuevo <= FinExistente) && (FinNuevo >= InicioExistente)
        return (newInicio <= existeFin && newFin >= existeInicio);
    });

    if (solapamiento) {
        setMensaje(`Error: El vehículo ${newPatente} ya tiene un mantenimiento programado que se superpone con las fechas seleccionadas (del ${formatDate(solapamiento.fecha_inicio)} al ${formatDate(solapamiento.fecha_fin)}).`);
        setEsError(true);
        return;
    }

    const method = mantenimientoToEdit ? 'PUT' : 'POST';
    const url = mantenimientoToEdit 
        ? `${apiBaseUrl}/mantenimientos/${mantenimientoToEdit.id_mantenimiento}`
        : `${apiBaseUrl}/mantenimientos`;

    try {
      // Nota: Los datos ya contienen las fechas como strings 'YYYY-MM-DD', lo cual previene el problema de zona horaria en el envío.
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
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
                disabled={!!mantenimientoToEdit}
            >
                <option value="">Seleccione Vehículo</option>
                {vehiculos
                    .filter(v => v.estado !== 'Alquilado')
                    .map(v => (
                    <option key={v.patente} value={v.patente}>
                        {v.marca} {v.modelo} ({v.patente})
                        {/* Mostrar "Estado: Mantenimiento" solo si el estado es Mantenimiento */}
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

        <div className="form-group-client">
            <label className="form-label-client"><strong>Fecha Inicio</strong></label>
            <input 
                className="form-input-client"
                type="date" 
                name="fecha_inicio" 
                onChange={handleChange} 
                required 
                value={datos.fecha_inicio}
            />
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
                min="0"
                step="0.01"
            />
        </div>

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