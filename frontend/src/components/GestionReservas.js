import React, { useState, useEffect } from 'react';
import RegistroReserva from './RegistroReserva';

const GestionReservas = ({ apiBaseUrl }) => {
    const [reservas, setReservas] = useState([]);
    const [filteredReservas, setFilteredReservas] = useState([]);
    const [filter, setFilter] = useState("");
    
    // Vistas y Modales
    const [view, setView] = useState("list"); 
    const [reservaToEdit, setReservaToEdit] = useState(null);
    
    // Estado para el modal de conversión
    const [showModal, setShowModal] = useState(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [empleados, setEmpleados] = useState([]); 
    const [datosConversion, setDatosConversion] = useState({
        id_empleado: '',
        costo_total: ''
    });

    // --- NUEVO: Estado para el modal de cancelación ---
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [reservaToDelete, setReservaToDelete] = useState(null);

    const [error, setError] = useState("");

    useEffect(() => {
        fetchReservas();
        fetchEmpleados(); 
    }, []);

    useEffect(() => {
        const lowerFiltro = filter.toLowerCase();
        const resultados = reservas.filter(r => {
            const clienteNombre = r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}` : '';
            const patente = r.vehiculo ? r.vehiculo.patente : '';
            return clienteNombre.toLowerCase().includes(lowerFiltro) || 
                   patente.toLowerCase().includes(lowerFiltro);
        });
        setFilteredReservas(resultados);
    }, [filter, reservas]);

    const fetchReservas = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/reservas`);
            if (!response.ok) throw new Error("Error al cargar reservas");
            const data = await response.json();
            setReservas(data);
            setFilteredReservas(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/empleados`);
            if (response.ok) {
                setEmpleados(await response.json());
            }
        } catch (err) {
            console.error("Error cargando empleados:", err);
        }
    };

    // --- ACCIÓN: Abrir Modal de Cancelación ---
    const handleEliminar = (reserva) => {
        setReservaToDelete(reserva);
        setShowCancelModal(true);
    };

    // --- ACCIÓN: Confirmar Cancelación ---
    const confirmEliminar = async () => {
        if (!reservaToDelete) return;

        try {
            const response = await fetch(`${apiBaseUrl}/reservas/${reservaToDelete.id_reserva}`, { method: 'DELETE' });
            if (response.ok) {
                // alert("Reserva cancelada correctamente."); // Feedback visual suficiente con el cierre del modal
                setShowCancelModal(false);
                setReservaToDelete(null);
                // Si estaba abierto el modal de gestión, también cerrarlo
                if (showModal) {
                    setShowModal(false);
                    setReservaSeleccionada(null);
                }
                fetchReservas();
            } else {
                const data = await response.json();
                alert(data.error || "No se pudo eliminar.");
            }
        } catch (err) { 
            alert("Error de conexión."); 
        }
    };

    // --- ACCIONES ---
    const handleNuevo = () => { setReservaToEdit(null); setView('form'); };

    // Abrir modal de conversión
    const handleAbrirConversion = (reserva) => {
        if (!reserva.vehiculo) {
            alert("Esta reserva no tiene un vehículo asignado.");
            return;
        }
        setReservaSeleccionada(reserva);
        setDatosConversion({ id_empleado: '', costo_total: '' });
        setShowModal(true);
    };

    const convertirAAlquiler = async () => {
        if (!datosConversion.id_empleado || !datosConversion.costo_total) {
            alert("Por favor, seleccione un empleado e ingrese el costo.");
            return;
        }

        const alquilerPayload = {
            id_cliente: reservaSeleccionada.cliente.id_cliente,
            patente: reservaSeleccionada.vehiculo.patente,
            id_empleado: datosConversion.id_empleado,
            fecha_inicio: reservaSeleccionada.fecha_inicio_deseada, 
            fecha_fin: reservaSeleccionada.fecha_fin_deseada,
            costo_total: parseFloat(datosConversion.costo_total)
        };

        try {
            // 1. Crear Alquiler
            const responseAlq = await fetch(`${apiBaseUrl}/alquileres`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alquilerPayload)
            });
            
            if (!responseAlq.ok) {
                const errData = await responseAlq.json();
                throw new Error(errData.error || "Error al crear el alquiler.");
            }

            // 2. Eliminar Reserva
            await fetch(`${apiBaseUrl}/reservas/${reservaSeleccionada.id_reserva}`, { method: 'DELETE' });

            alert("¡Reserva convertida en alquiler exitosamente!");
            setShowModal(false);
            setReservaSeleccionada(null);
            fetchReservas(); 

        } catch (err) {
            alert(err.message);
        }
    };

    const getBadgeStyle = (estado) => {
        const base = { padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', color: 'white', display: 'inline-block' };
        switch(estado) {
            case 'Pendiente': return { ...base, backgroundColor: '#ecc94b', color: '#2d3748' };
            default: return { ...base, backgroundColor: '#cbd5e0' };
        }
    };

    // --- HELPER: Validar fecha LOCAL (sin UTC) ---
    const checkEsFechaValida = (fechaInicioStr) => {
        if (!fechaInicioStr) return false;
        // Creamos fechas en hora local (00:00:00)
        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        // Parseamos la fecha string (YYYY-MM-DD) asumiendo local
        const [y, m, d] = fechaInicioStr.split('-').map(Number);
        const fechaInicio = new Date(y, m - 1, d); // Mes es 0-indexado

        // Retorna true SOLO si hoy es EXACTAMENTE igual a la fecha de inicio
        return hoy.getTime() === fechaInicio.getTime();
    };

    // --- RENDERIZADO ---

    if (view === 'form') {
        return (
            <RegistroReserva 
                apiBaseUrl={apiBaseUrl} 
                onBack={() => setView('list')}
                onSuccess={() => { setView('list'); fetchReservas(); }}
                reservaToEdit={reservaToEdit}
            />
        );
    }

    return (
        <div className="client-manager-container">
            <h1 className="main-title">Gestión de Reservas</h1>
            <hr className="header-separator" />

            <div className="filter-and-button-row">
                <div className="filter-group-compact">
                    <input type="text" className="filter-input-compact" placeholder="🔍 Buscar por cliente o patente..." value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '300px' }} />
                </div>
                <button className="btn-register-list-standalone" onClick={handleNuevo}>+ Nueva Reserva</button>
            </div>

            <div className="list-header-row"><h3 className="list-header-red">Listado de Reservas</h3></div>
            {error && <div className="error-message">{error}</div>}

            <div className="table-responsive">
                <table className="client-data-table">
                    <thead>
                        <tr>
                            <th>Nro</th><th>Cliente</th><th>Vehículo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservas.length === 0 ? (
                            <tr><td colSpan="7" className="text-center-message">No hay reservas registradas.</td></tr>
                        ) : (
                            filteredReservas.map((res) => {
                                return (
                                    <tr key={res.id_reserva}>
                                        <td>{res.id_reserva}</td>
                                        <td>{res.cliente ? `${res.cliente.nombre} ${res.cliente.apellido}` : 'N/A'}</td>
                                        <td style={{ fontWeight: 'bold' }}>{res.vehiculo ? res.vehiculo.patente : <span style={{color:'#999'}}>Sin Asignar</span>}</td>
                                        <td>{new Date(res.fecha_inicio_deseada).toLocaleDateString()}</td>
                                        <td>{new Date(res.fecha_fin_deseada).toLocaleDateString()}</td>
                                        <td><span style={getBadgeStyle(res.estado)}>{res.estado}</span></td>
                                        <td className="action-buttons-cell">
                                            {res.estado === 'Pendiente' && (
                                                <>
                                                    <button 
                                                        className="btn-delete-red" 
                                                        style={{ marginRight: '5px' }} 
                                                        onClick={() => handleEliminar(res)} 
                                                        title="Cancelar Reserva"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    
                                                    <button 
                                                        className="btn-edit-red" 
                                                        style={{ 
                                                            backgroundColor: checkEsFechaValida(res.fecha_inicio_deseada) ? '#3182ce' : '#a0aec0',
                                                            cursor: checkEsFechaValida(res.fecha_inicio_deseada) ? 'pointer' : 'not-allowed',
                                                            opacity: checkEsFechaValida(res.fecha_inicio_deseada) ? 1 : 0.6
                                                        }} 
                                                        onClick={() => handleAbrirConversion(res)} 
                                                        disabled={!checkEsFechaValida(res.fecha_inicio_deseada)}
                                                        title={checkEsFechaValida(res.fecha_inicio_deseada) 
                                                            ? "Gestionar Reserva (Convertir a Alquiler)" 
                                                            : "Solo disponible el día de inicio de la reserva"}
                                                    >
                                                        Gestionar
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE CONVERSIÓN / GESTIÓN */}
            {showModal && reservaSeleccionada && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="modal-icon">🚗</span>
                        <h3>Gestionar Reserva #{reservaSeleccionada.id_reserva}</h3>
                        
                        <div className="modal-details" style={{textAlign: 'left'}}>
                            <div className="detail-row">
                                <span className="detail-label">Vehículo:</span>
                                <span className="detail-value">{reservaSeleccionada.vehiculo?.patente}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Fecha Inicio:</span>
                                <span className="detail-value">{reservaSeleccionada.fecha_inicio_deseada}</span>
                            </div>
                        </div>

                        {/* MENSAJE DE VALIDACIÓN DE FECHA */}
                        {!checkEsFechaValida(reservaSeleccionada.fecha_inicio_deseada) && (
                            <div style={{
                                backgroundColor: '#fffaf0', 
                                border: '1px solid #ed8936', 
                                color: '#c05621', 
                                padding: '10px', 
                                borderRadius: '4px',
                                marginTop: '10px',
                                fontSize: '0.9rem'
                            }}>
                                ⚠️ <strong>Aún no se puede convertir a alquiler.</strong> <br/>
                                La conversión solo está disponible el día de inicio de la reserva.
                            </div>
                        )}

                        <div className="form-group-client" style={{marginTop: '1rem'}}>
                            <label className="form-label-client">Empleado que procesa:</label>
                            <select
                                className="form-input-client"
                                value={datosConversion.id_empleado}
                                onChange={(e) => setDatosConversion({...datosConversion, id_empleado: e.target.value})}
                                disabled={!checkEsFechaValida(reservaSeleccionada.fecha_inicio_deseada)}
                            >
                                <option value="">Seleccione Empleado</option>
                                {empleados.map((emp) => (
                                    <option key={emp.id_empleado} value={emp.id_empleado}>
                                        {emp.nombre} {emp.apellido} ({emp.puesto})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-client">
                            <label className="form-label-client">Costo Total ($):</label>
                            <input
                                className="form-input-client"
                                type="number"
                                min="0"
                                step="0.01"
                                value={datosConversion.costo_total}
                                onChange={(e) => setDatosConversion({...datosConversion, costo_total: e.target.value})}
                                placeholder="0.00"
                                disabled={!checkEsFechaValida(reservaSeleccionada.fecha_inicio_deseada)}
                            />
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem'}}>
                            {/* BOTÓN 1: CONFIRMAR CONVERSIÓN (Bloqueado si no es fecha) */}
                            <button 
                                className="btn-submit-client-full-width" 
                                onClick={convertirAAlquiler}
                                disabled={!checkEsFechaValida(reservaSeleccionada.fecha_inicio_deseada)}
                                style={{
                                    opacity: checkEsFechaValida(reservaSeleccionada.fecha_inicio_deseada) ? 1 : 0.5,
                                    cursor: checkEsFechaValida(reservaSeleccionada.fecha_inicio_deseada) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {checkEsFechaValida(reservaSeleccionada.fecha_inicio_deseada) ? "Confirmar Conversión" : "Conversión No Disponible"}
                            </button>

                            {/* FILA DE BOTONES SECUNDARIOS */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {/* BOTÓN 2: CANCELAR RESERVA (MOVIDO AQUÍ) */}
                                <button 
                                    className="btn-delete-red"
                                    style={{ flex: 1 }}
                                    onClick={() => {
                                        // Cerrar este modal y abrir el de confirmación de cancelación
                                        setShowModal(false);
                                        handleEliminar(reservaSeleccionada);
                                    }}
                                >
                                    Eliminar Reserva
                                </button>

                                {/* BOTÓN 3: CERRAR MODAL (Cancelar acción) */}
                                <button 
                                    className="btn-back-link" 
                                    style={{flex: 1, border: '1px solid #ccc', padding: '10px', borderRadius: '4px', textAlign: 'center'}}
                                    onClick={() => { setShowModal(false); setReservaSeleccionada(null); }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NUEVO: MODAL DE CONFIRMACIÓN DE CANCELACIÓN --- */}
            {showCancelModal && reservaToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <span className="modal-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>⚠️</span>
                        <h3 style={{ color: '#c53030' }}>Cancelar Reserva</h3>
                        
                        <p style={{ textAlign: 'center', margin: '1rem 0', color: '#4a5568' }}>
                            ¿Estás seguro de que deseas cancelar la reserva de <strong>{reservaToDelete.cliente?.nombre} {reservaToDelete.cliente?.apellido}</strong>?
                        </p>
                        
                        <div className="modal-details" style={{ textAlign: 'left', backgroundColor: '#fff5f5', border: '1px solid #feb2b2' }}>
                            <div className="detail-row">
                                <span className="detail-label">Vehículo:</span>
                                <span className="detail-value">{reservaToDelete.vehiculo?.patente || 'Sin Asignar'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Fecha Inicio:</span>
                                <span className="detail-value">{reservaToDelete.fecha_inicio_deseada}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button 
                                className="btn-delete-red"
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={confirmEliminar}
                            >
                                Sí, Cancelar
                            </button>
                            <button 
                                className="btn-back-link" 
                                style={{ flex: 1, border: '1px solid #ccc', padding: '10px', borderRadius: '4px', textAlign: 'center' }}
                                onClick={() => { setShowCancelModal(false); setReservaToDelete(null); }}
                            >
                                No, Volver
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default GestionReservas;