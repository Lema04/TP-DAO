import React, { useState, useEffect } from 'react';
// Eliminamos useNavigate porque la navegación la controla el padre

const RegistroAlquiler = ({ apiBaseUrl, onBack, onSuccess, alquilerToEdit }) => {
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
  
  // Este estado guardará la info para mostrar en el modal de éxito
  const [alquilerProcesado, setAlquilerProcesado] = useState(null);

  const hoy = new Date().toISOString().split('T')[0];

  // --- CARGA DE DATOS INICIALES Y EDICIÓN ---
  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json(); 
        if (!response.ok) throw new Error(data.error || `Error cargando ${endpoint}`);
        setter(data);
      } catch (error) {
        console.error(`Error cargando ${endpoint}:`, error);
        setMensaje(`Error cargando datos: ${error.message}`);
        setEsError(true);
      }
    };

    fetchData('vehiculos', setVehiculos);
    fetchData('clientes', setClientes);
    fetchData('empleados', setEmpleados);

    // Si estamos en modo EDICIÓN, rellenamos el formulario
    if (alquilerToEdit) {
        setDatos({
            id_cliente: alquilerToEdit.cliente.id_cliente,
            patente: alquilerToEdit.vehiculo.patente,
            id_empleado: alquilerToEdit.empleado.id_empleado,
            // Aseguramos que las fechas estén en formato YYYY-MM-DD
            fecha_inicio: alquilerToEdit.fecha_inicio.split('T')[0],
            fecha_fin: alquilerToEdit.fecha_fin.split('T')[0],
            costo_total: alquilerToEdit.costo_total
        });
    }
  }, [apiBaseUrl, alquilerToEdit]);


  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    // Definimos si es CREAR (POST) o EDITAR (PUT)
    const method = alquilerToEdit ? 'PUT' : 'POST';
    const url = alquilerToEdit 
        ? `${apiBaseUrl}/alquileres/${alquilerToEdit.id_alquiler}`
        : `${apiBaseUrl}/alquileres`;

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
      
      // Éxito: Preparamos datos para el modal
      // Si es edición, result es el objeto actualizado. Si es creación, es el nuevo.
      // Enriquecemos con los objetos completos de los arrays locales para mostrar nombres bonitos
      setAlquilerProcesado({
          id: result.id_alquiler || alquilerToEdit?.id_alquiler, // En PUT a veces devolvemos el obj entero
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
    setAlquilerProcesado(null);
    // Avisamos al padre que terminó la operación exitosamente
    if (onSuccess) onSuccess(); 
  };

  return (
    <div className="form-container-inner-shadow">
      <div className="form-header-row">
        <h3 className="form-subtitle-black">
            {alquilerToEdit ? `Modificar Alquiler #${alquilerToEdit.id_alquiler}` : 'Registrar Nuevo Alquiler'}
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
            <select className="form-input-client" name="id_cliente" onChange={handleChange} required value={datos.id_cliente}>
            <option value="">Seleccione Cliente</option>
            {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} {c.apellido} (DNI: {c.dni})
                </option>
            ))}
            </select>
        </div>
        
        <div className="form-group-client">
            <label className="form-label-client"><strong>Empleado</strong></label>
            <select className="form-input-client" name="id_empleado" onChange={handleChange} required value={datos.id_empleado}>
            <option value="">Seleccione Empleado</option>
            {empleados.map(e => (
                <option key={e.id_empleado} value={e.id_empleado}>
                {e.nombre} {e.apellido} (Rol: {e.puesto})
                </option>
            ))}
            </select>
        </div>

        <div className="form-group-client">
            <label className="form-label-client"><strong>Vehículo</strong></label>
            <select className="form-input-client" name="patente" onChange={handleChange} required value={datos.patente}>
            <option value="">Seleccione Vehículo</option>
            {vehiculos.map(v => {
                // Si estamos editando, debemos permitir ver el vehículo actual aunque no esté "Disponible" (porque lo tiene este alquiler)
                const esElActual = alquilerToEdit && alquilerToEdit.vehiculo.patente === v.patente;
                const esDisponible = v.estado.toLowerCase() === 'disponible';
                
                if (esDisponible || esElActual) {
                    return (
                        <option key={v.patente} value={v.patente}>
                            {v.marca} {v.modelo} ({v.patente}) {esElActual ? '(Actual)' : ''}
                        </option>
                    );
                }
                return null;
            })}
            </select>
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
            // Si editamos, permitimos fechas anteriores (las originales), si es nuevo, min hoy
            min={alquilerToEdit ? undefined : hoy} 
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
            min={datos.fecha_inicio || hoy} 
            />
        </div>
        
        <div className="form-group-client">
            <label className="form-label-client"><strong>Costo Total</strong></label>
            <input className="form-input-client" type="number" name="costo_total" onChange={handleChange} required value={datos.costo_total} min="0" step="0.01" />
        </div>

        <div className="form-actions-client-full-width">
            <button type="submit" className="btn-submit-client-full-width">
                {alquilerToEdit ? 'Guardar Cambios' : 'Registrar Alquiler'}
            </button>
        </div>
      </form>

      {/* MODAL DE ÉXITO */}
      {showModal && alquilerProcesado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">✅</span>
            <h3>{alquilerToEdit ? '¡Modificación Exitosa!' : '¡Alquiler Registrado!'}</h3>
            <p>La operación se ha completado correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row"><span className="detail-label">ID:</span> <span>#{alquilerProcesado.id}</span></div>
              <div className="detail-row"><span className="detail-label">Cliente:</span> <span>{alquilerProcesado.cliente?.nombre} {alquilerProcesado.cliente?.apellido}</span></div>
              <div className="detail-row"><span className="detail-label">Vehículo:</span> <span>{alquilerProcesado.vehiculo?.marca} {alquilerProcesado.vehiculo?.modelo}</span></div>
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

export default RegistroAlquiler;