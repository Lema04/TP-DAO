import React, { useState, useEffect } from 'react';

const GestionVehiculos = ({ apiBaseUrl }) => {
    // --- ESTADOS ---
    const [vehiculos, setVehiculos] = useState([]);
    const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
    const [valorFiltro, setValorFiltro] = useState("");
    
    // Control de Vistas: "listar" | "crear" | "editar"
    const [modo, setModo] = useState("listar");
    
    // Estado del Formulario Unificado
    const [form, setForm] = useState({
        patente: '',
        marca: '',
        modelo: '',
        anio: '',
        precio_diario: '',
        estado: 'Disponible'
    });

    // Manejo de Mensajes
    const [mensaje, setMensaje] = useState("");
    const [esError, setEsError] = useState(false);

    // --- EFECTOS ---
    useEffect(() => {
        fetchVehiculos();
    }, []);

    // Filtrado dinámico
    useEffect(() => {
        const lowerFiltro = valorFiltro.toLowerCase();
        const resultados = vehiculos.filter(v => 
            v.patente.toLowerCase().includes(lowerFiltro) ||
            v.marca.toLowerCase().includes(lowerFiltro) ||
            v.modelo.toLowerCase().includes(lowerFiltro)
        );
        setVehiculosFiltrados(resultados);
    }, [valorFiltro, vehiculos]);

    // --- FUNCIONES DE API ---
    const fetchVehiculos = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/vehiculos`);
            if (!response.ok) throw new Error('Error al cargar vehículos');
            const data = await response.json();
            setVehiculos(data);
            setVehiculosFiltrados(data);
        } catch (err) {
            setMensaje(err.message);
            setEsError(true);
        }
    };

    const accionVehiculo = async (tipoAccion) => {
        // Validaciones básicas
        if (!form.patente || !form.marca || !form.modelo || !form.anio || !form.precio_diario) {
            setMensaje("Por favor, complete todos los campos obligatorios.");
            setEsError(true);
            return;
        }

        const method = tipoAccion === "crear" ? 'POST' : 'PUT';
        const url = tipoAccion === "crear"
            ? `${apiBaseUrl}/vehiculos`
            : `${apiBaseUrl}/vehiculos/${form.patente}`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    anio: parseInt(form.anio),
                    precio_diario: parseFloat(form.precio_diario)
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje(tipoAccion === "crear" ? "Vehículo registrado con éxito." : "Vehículo actualizado con éxito.");
                setEsError(false);
                fetchVehiculos();
                setModo("listar");
            } else {
                setMensaje(data.error || "Error al procesar la solicitud.");
                setEsError(true);
            }
        } catch (err) {
            setMensaje("Error de conexión.");
            setEsError(true);
        }
    };

    const eliminarVehiculo = async (patente) => {
        if (!window.confirm(`¿Estás seguro de eliminar el vehículo ${patente}?`)) return;

        try {
            const response = await fetch(`${apiBaseUrl}/vehiculos/${patente}`, { method: 'DELETE' });
            if (response.ok) {
                setMensaje("Vehículo eliminado correctamente.");
                setEsError(false);
                fetchVehiculos();
            } else {
                const data = await response.json();
                setMensaje(data.error || "No se pudo eliminar.");
                setEsError(true);
            }
        } catch (err) {
            setMensaje("Error de conexión.");
            setEsError(true);
        }
    };

    // --- MANEJADORES DE EVENTOS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const iniciarEdicion = (vehiculo) => {
        setForm(vehiculo);
        setModo("editar");
        setMensaje("");
    };

    const iniciarCreacion = () => {
        setForm({
            patente: '', marca: '', modelo: '', anio: '', precio_diario: '', estado: 'Disponible'
        });
        setModo("crear");
        setMensaje("");
    };

    // Helper de estilos para las etiquetas de estado
    const getEstadoBadgeStyle = (estado) => {
        const baseStyle = {
            padding: '0.3rem 0.6rem',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            display: 'inline-block',
            color: 'white'
        };
        switch(estado) {
            case 'Disponible': return { ...baseStyle, backgroundColor: '#48bb78' };
            case 'Alquilado': return { ...baseStyle, backgroundColor: '#e53e3e' }; // Rojo similar a gestion de empleados
            case 'Reservado': return { ...baseStyle, backgroundColor: '#ed8936' };
            case 'Mantenimiento': return { ...baseStyle, backgroundColor: '#ecc94b', color: '#2d3748' };
            default: return { ...baseStyle, backgroundColor: '#cbd5e0', color: '#2d3748' };
        }
    };

    // --- RENDERIZADO ---
    return (
        <div className="client-manager-container">
            <h1 className="main-title">Gestión de Vehículos</h1>
            <hr className="header-separator" />

            {mensaje && <div className={esError ? "error-message" : "success-message"}>{mensaje}</div>}

            {/* VISTA: LISTADO */}
            {modo === "listar" && (
                <>
                    <div className="filter-and-button-row">
                        <div className="filter-group-compact">
                            <input 
                                type="text" 
                                className="filter-input-compact" 
                                placeholder="🔍 Buscar por patente, marca..." 
                                value={valorFiltro} 
                                onChange={e => setValorFiltro(e.target.value)} 
                                style={{ width: '300px' }}
                            />
                        </div>

                        <button className="btn-register-list-standalone" onClick={iniciarCreacion}>
                            + Registrar Vehículo
                        </button>
                    </div>

                    <div className="list-header-row"><h3 className="list-header-red">Listado de Vehículos</h3></div>

                    <div className="table-responsive">
                        <table className="client-data-table">
                            <thead>
                                <tr>
                                    <th>Patente</th>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Año</th>
                                    <th>Precio/Día</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehiculosFiltrados.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center-message">No se encontraron vehículos.</td></tr>
                                ) : (
                                    vehiculosFiltrados.map(v => (
                                        <tr key={v.patente}>
                                            <td>{v.patente}</td>
                                            <td>{v.marca}</td>
                                            <td>{v.modelo}</td>
                                            <td>{v.anio}</td>
                                            <td>${v.precio_diario}</td>
                                            <td>
                                                <span style={getEstadoBadgeStyle(v.estado)}>{v.estado}</span>
                                            </td>
                                            <td className="action-buttons-cell">
                                                <button className="btn-edit-red" onClick={() => iniciarEdicion(v)}>Editar</button>
                                                <button className="btn-delete-red" onClick={() => eliminarVehiculo(v.patente)}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* VISTA: FORMULARIO (CREAR / EDITAR) */}
            {(modo === "crear" || modo === "editar") && (
                <form onSubmit={(e) => { e.preventDefault(); accionVehiculo(modo); }} className="form-container-inner-shadow">
                    <div className="form-header-row">
                        <h3 className="form-subtitle-black">
                            {modo === "crear" ? "Registrar Nuevo Vehículo" : "Editar Vehículo"}
                        </h3>
                        <button type="button" className="btn-back-link" onClick={() => { setModo("listar"); setMensaje(""); }}>Volver al Listado</button>
                    </div>

                    <hr className="form-separator" />

                    <div className="form-fields-grid">
                        <div className="form-group-client">
                            <label className="form-label-client"><strong>Patente</strong></label>
                            <input 
                                className={`form-input-client ${modo === "editar" ? "disabled-input" : ""}`}
                                type="text" 
                                name="patente" 
                                value={form.patente} 
                                onChange={handleChange}
                                placeholder="Ej: AA123BB"
                                maxLength="7"
                                // Aquí bloqueamos la patente si estamos editando
                                readOnly={modo === "editar"}
                            />
                            {modo === "crear" && <small style={{fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'block'}}>6-7 caracteres alfanuméricos</small>}
                        </div>

                        <div className="form-group-client">
                            <label className="form-label-client"><strong>Marca</strong></label>
                            <input className="form-input-client" type="text" name="marca" value={form.marca} onChange={handleChange} placeholder="Ej: Toyota" />
                        </div>

                        <div className="form-group-client">
                            <label className="form-label-client"><strong>Modelo</strong></label>
                            <input className="form-input-client" type="text" name="modelo" value={form.modelo} onChange={handleChange} placeholder="Ej: Corolla" />
                        </div>

                        <div className="form-group-client">
                            <label className="form-label-client"><strong>Año</strong></label>
                            <input className="form-input-client" type="number" name="anio" value={form.anio} onChange={handleChange} placeholder="Ej: 2022" />
                        </div>

                        <div className="form-group-client">
                            <label className="form-label-client"><strong>Precio Diario ($)</strong></label>
                            <input className="form-input-client" type="number" name="precio_diario" value={form.precio_diario} onChange={handleChange} step="0.01" placeholder="0.00" />
                        </div>

                        <div className="form-group-client">
                            <label className="form-label-client"><strong>Estado</strong></label>
                            <select className="form-input-client" name="estado" value={form.estado} onChange={handleChange}>
                                <option value="Disponible">Disponible</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Alquilado">Alquilado</option>
                                <option value="Reservado">Reservado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions-client-full-width">
                        <button type="submit" className="btn-submit-client-full-width">
                            {modo === "crear" ? "Registrar Vehículo" : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default GestionVehiculos;