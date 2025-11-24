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
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mantenimientoProcesado, setMantenimientoProcesado] = useState(null);

  const hoy = new Date().toISOString().split('T')[0];

  // Cargar vehículos
  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/vehiculos`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error cargando vehículos");
        setVehiculos(data);
      } catch (error) {
        setMensaje(`Error cargando vehículos: ${error.message}`);
        setEsError(true);
      }
    };

    fetchVehiculos();

    // Si es edición, rellenar formulario
    if (mantenimientoToEdit) {
        setDatos({
            patente: mantenimientoToEdit.vehiculo.patente,
            // Cortamos la fecha para quedarnos con YYYY-MM-DD
            fecha_inicio: mantenimientoToEdit.fecha_inicio ? mantenimientoToEdit.fecha_inicio.split('T')[0] : '',
            fecha_fin: mantenimientoToEdit.fecha_fin ? mantenimientoToEdit.fecha_fin.split('T')[0] : '',
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

    // Validación básica de fechas
    if (datos.fecha_inicio > datos.fecha_fin) {
        setMensaje("La fecha de inicio no puede ser posterior a la de fin.");
        setEsError(true);
        return;
    }

    const method = mantenimientoToEdit ? 'PUT' : 'POST';
    const url = mantenimientoToEdit 
        ? `${apiBaseUrl}/mantenimientos/${mantenimientoToEdit.id_mantenimiento}`
        : `${apiBaseUrl}/mantenimientos`;

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
                disabled={!!mantenimientoToEdit} // Normalmente no cambiamos el vehículo de un mantenimiento ya creado
            >
                <option value="">Seleccione Vehículo</option>
                {vehiculos.map(v => (
                    <option key={v.patente} value={v.patente}>
                        {v.marca} {v.modelo} ({v.patente})
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

      {/* MODAL DE ÉXITO */}
      {showModal && mantenimientoProcesado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🔧</span>
            <h3>{mantenimientoToEdit ? '¡Modificación Exitosa!' : '¡Mantenimiento Registrado!'}</h3>
            <p>Los datos se han guardado correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row"><span className="detail-label">ID:</span> <span>#{mantenimientoProcesado.id}</span></div>
              <div className="detail-row"><span className="detail-label">Vehículo:</span> <span>{mantenimientoProcesado.vehiculo?.marca} ({mantenimientoProcesado.patente})</span></div>
              <div className="detail-row"><span className="detail-label">Servicio:</span> <span>{mantenimientoProcesado.tipo_servicio}</span></div>
              <div className="detail-row"><span className="detail-label">Costo:</span> <span>${mantenimientoProcesado.costo}</span></div>
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

export default RegistroMantenimiento;