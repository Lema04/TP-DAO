import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistroAlquiler = ({ apiBaseUrl, onBack, onSuccess, alquilerToEdit, initialFormData }) => {
  const navigate = useNavigate();
  const hoy = new Date().toISOString().split('T')[0];

  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  
  // NUEVO: Estado para reservas (para validar disponibilidad)
  const [reservas, setReservas] = useState([]);

  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alquilerRegistrado, setAlquilerRegistrado] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try { return new Date(dateString).toISOString().split('T')[0]; } catch { return ''; }
  };

  const [datos, setDatos] = useState(() => {
    const baseData = alquilerToEdit ? {
        id_alquiler: alquilerToEdit.id_alquiler,
        id_cliente: alquilerToEdit.cliente?.id_cliente || alquilerToEdit.id_cliente,
        patente: alquilerToEdit.vehiculo?.patente || alquilerToEdit.patente,
        id_empleado: alquilerToEdit.id_empleado,
        fecha_inicio: formatDate(alquilerToEdit.fecha_inicio),
        fecha_fin: formatDate(alquilerToEdit.fecha_fin),
        costo_total: parseFloat(alquilerToEdit.costo_total) || 0.0,
    } : {
        id_cliente: '', patente: '', id_empleado: '',
        fecha_inicio: '', fecha_fin: '', costo_total: 0.0,
    };
    return { ...baseData, ...initialFormData, costo_total: baseData.costo_total || 0.0 };
  });

  // Cálculo de Costo
  const calculateTotalCost = (patente, inicio, fin, vehiculosList) => {
    if (!patente || !inicio || !fin || !vehiculosList.length) return 0.0;
    const selectedVehiculo = vehiculosList.find(v => v.patente === patente);
    const precioDiario = selectedVehiculo ? parseFloat(selectedVehiculo.precio_diario) : 0;
    if (precioDiario <= 0) return 0.0;
    const dateInicio = new Date(inicio);
    const dateFin = new Date(fin);
    if (isNaN(dateInicio) || isNaN(dateFin) || dateInicio >= dateFin) return 0.0;
    const timeDiff = dateFin.getTime() - dateInicio.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return parseFloat((precioDiario * daysDiff).toFixed(2));
  };

  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json(); 
        if (!response.ok) throw new Error(data.error);
        setter(data);
      } catch (error) {
        console.error(`Error ${endpoint}:`, error);
      }
    };

    fetchData('vehiculos', setVehiculos);
    fetchData('clientes', setClientes);
    fetchData('empleados', setEmpleados);
    fetchData('reservas', setReservas); // Traemos reservas para validar
  }, [apiBaseUrl]);

  useEffect(() => {
    const newCosto = calculateTotalCost(datos.patente, datos.fecha_inicio, datos.fecha_fin, vehiculos);
    setDatos(prev => (prev.costo_total !== newCosto ? { ...prev, costo_total: newCosto } : prev));
  }, [datos.patente, datos.fecha_inicio, datos.fecha_fin, vehiculos]);

  const handleChange = (e) => setDatos({ ...datos, [e.target.name]: e.target.value });

  // --- FUNCIÓN CLAVE: Verificar si un vehículo está reservado en las fechas seleccionadas ---
  const isVehiculoReservado = (patente) => {
      if (!datos.fecha_inicio || !datos.fecha_fin) return false;
      
      // Filtramos reservas PENDIENTES que coincidan con la patente
      return reservas.some(r => {
          if (r.patente !== patente && r.vehiculo?.patente !== patente) return false;
          if (r.estado !== 'Pendiente') return false; // Solo reservas activas importan

          // Lógica de solapamiento de fechas
          // (InicioA <= FinB) y (FinA >= InicioB)
          const inicioReserva = r.fecha_inicio_deseada;
          const finReserva = r.fecha_fin_deseada;
          const inicioAlquiler = datos.fecha_inicio;
          const finAlquiler = datos.fecha_fin;

          return (inicioReserva <= finAlquiler && finReserva >= inicioAlquiler);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(''); setEsError(false);
    
    if (new Date(datos.fecha_inicio) >= new Date(datos.fecha_fin)) {
        setMensaje('Error: La fecha de fin debe ser posterior a inicio.'); setEsError(true); return;
    }

    try {
      const isEdit = alquilerToEdit && alquilerToEdit.id_alquiler;
      const url = isEdit ? `${apiBaseUrl}/alquileres/${alquilerToEdit.id_alquiler}` : `${apiBaseUrl}/alquileres`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setAlquilerRegistrado({
          id: result.id_alquiler || alquilerToEdit?.id_alquiler,
          ...datos,
          cliente: clientes.find(c => c.id_cliente == datos.id_cliente),
          vehiculo: vehiculos.find(v => v.patente === datos.patente)
      });
      setShowModal(true);
      if (!isEdit) setDatos({ id_cliente: '', patente: '', id_empleado: '', fecha_inicio: '', fecha_fin: '', costo_total: 0.0 });
      else onSuccess();

    } catch (error) {
      setMensaje(`Error: ${error.message}`); setEsError(true);
    }
  };

  const closeModal = () => {
    setShowModal(false); setAlquilerRegistrado(null);
    if (!alquilerToEdit) onSuccess(); 
  };

  const isEditMode = alquilerToEdit && alquilerToEdit.id_alquiler;
  
  return (
    <div className="form-card">
      <h2 className="form-title">{isEditMode ? `Editar Alquiler` : "Registro de Nuevo Alquiler"}</h2>
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        <div className="form-group">
            <label>Cliente:</label>
            <select className="form-select" name="id_cliente" onChange={handleChange} required value={datos.id_cliente}>
            <option value="">Seleccione Cliente</option>
            {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido} ({c.dni})</option>)}
            </select>
        </div>
        
        <div className="form-group">
            <label>Empleado:</label>
            <select className="form-select" name="id_empleado" onChange={handleChange} required value={datos.id_empleado}>
            <option value="">Seleccione Empleado</option>
            {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre} {e.apellido}</option>)}
            </select>
        </div>

        {/* FECHAS PRIMERO: Para filtrar vehículos según disponibilidad */}
        <div className="form-group">
            <label>Fecha Inicio:</label>
            <input className="form-input" type="date" name="fecha_inicio" onChange={handleChange} required value={datos.fecha_inicio} min={hoy} readOnly={isEditMode} />
        </div>

        <div className="form-group">
            <label>Fecha Fin:</label>
            <input className="form-input" type="date" name="fecha_fin" onChange={handleChange} required value={datos.fecha_fin} min={datos.fecha_inicio || hoy} />
        </div>

        <div className="form-group">
            <label>Vehículo (Patente):</label>
            <select className="form-select" name="patente" onChange={handleChange} required value={datos.patente} disabled={isEditMode}>
            <option value="">Seleccione Vehículo Disponible</option>
            {vehiculos
                .filter(v => {
                    // 1. Debe estar Disponible o ser el mismo que edito
                    const esDisponible = v.estado.toLowerCase() === 'disponible';
                    const esMismoVehiculo = isEditMode && v.patente === datos.patente;
                    // 2. NO debe tener reservas en esas fechas
                    const estaReservado = isVehiculoReservado(v.patente);
                    
                    return (esDisponible || esMismoVehiculo) && !estaReservado;
                })
                .map(v => (
                <option key={v.patente} value={v.patente}>
                    {v.marca} {v.modelo} ({v.patente}) - ${v.precio_diario}/día
                </option>
                ))}
            </select>
            {isVehiculoReservado(datos.patente) && <small style={{color:'red'}}>⚠️ El vehículo seleccionado tiene una reserva en estas fechas.</small>}
        </div>

        <div className="form-group">
            <label>Costo Total:</label>
            <input className="form-input disabled-input" type="number" readOnly value={datos.costo_total} placeholder="Calculado..." />
        </div>

        <button type="submit" className="btn-primary">{isEditMode ? "Guardar Cambios" : "Registrar Alquiler"}</button>
      </form>
      <button className="btn-secondary" onClick={onBack || (() => navigate('/home'))}>Volver</button>
      
      {showModal && alquilerRegistrado && ( /* ... Modal de éxito (igual que antes) ... */ 
          <div className="modal-overlay"><div className="modal-content"><h3>¡Éxito!</h3><button className="modal-close-btn" onClick={closeModal}>Aceptar</button></div></div>
      )}
    </div>
  );
};

export default RegistroAlquiler;