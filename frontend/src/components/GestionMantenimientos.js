import React, { useState, useEffect } from 'react';
import RegistroMantenimiento from './RegistroMantenimiento';

const GestionMantenimientos = ({ apiBaseUrl }) => {
    const [mantenimientos, setMantenimientos] = useState([]);
    const [filteredMantenimientos, setFilteredMantenimientos] = useState([]);
    const [filter, setFilter] = useState("");
    const [view, setView] = useState("list"); // 'list' | 'form'
    const [mantenimientoToEdit, setMantenimientoToEdit] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchMantenimientos();
    }, []);

    // Filtrado en tiempo real
    useEffect(() => {
        const lowerFiltro = filter.toLowerCase();
        const resultados = mantenimientos.filter(m => {
            const patente = m.vehiculo ? m.vehiculo.patente : '';
            const servicio = m.tipo_servicio || '';
            
            return patente.toLowerCase().includes(lowerFiltro) || 
                   servicio.toLowerCase().includes(lowerFiltro);
        });
        setFilteredMantenimientos(resultados);
    }, [filter, mantenimientos]);

    const fetchMantenimientos = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/mantenimientos`);
            if (!response.ok) throw new Error("Error al cargar mantenimientos");
            const data = await response.json();
            setMantenimientos(data);
            setFilteredMantenimientos(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEliminar = async (id_mantenimiento) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro de mantenimiento?")) return;

        try {
            const response = await fetch(`${apiBaseUrl}/mantenimientos/${id_mantenimiento}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchMantenimientos();
            } else {
                const data = await response.json();
                alert(data.error || "No se pudo eliminar el mantenimiento.");
            }
        } catch (err) {
            alert("Error de conexión.");
        }
    };

    // Acciones de Navegación
    const handleNuevo = () => {
        setMantenimientoToEdit(null);
        setView('form');
    };

    const handleEditar = (mantenimiento) => {
        setMantenimientoToEdit(mantenimiento);
        setView('form');
    };

    // --- RENDERIZADO ---

    if (view === 'form') {
        return (
            <RegistroMantenimiento 
                apiBaseUrl={apiBaseUrl} 
                onBack={() => setView('list')}
                onSuccess={() => {
                    setView('list');
                    fetchMantenimientos();
                }}
                mantenimientoToEdit={mantenimientoToEdit}
            />
        );
    }

    return (
        <div className="client-manager-container">
            <h1 className="main-title">Gestión de Mantenimientos</h1>
            <hr className="header-separator" />

            <div className="filter-and-button-row">
                <div className="filter-group-compact">
                    <input 
                        type="text" 
                        className="filter-input-compact" 
                        placeholder="🔍 Buscar por patente o servicio..." 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)} 
                        style={{ width: '300px' }}
                    />
                </div>

                <button className="btn-register-list-standalone" onClick={handleNuevo}>
                    + Nuevo Mantenimiento
                </button>
            </div>

            <div className="list-header-row"><h3 className="list-header-red">Historial de Mantenimientos</h3></div>
            
            {error && <div className="error-message">{error}</div>}

            <div className="table-responsive">
                <table className="client-data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehículo</th>
                            <th>Tipo Servicio</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Costo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMantenimientos.length === 0 ? (
                            <tr><td colSpan="7" className="text-center-message">No hay mantenimientos registrados.</td></tr>
                        ) : (
                            filteredMantenimientos.map((m) => (
                                <tr key={m.id_mantenimiento}>
                                    <td>{m.id_mantenimiento}</td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {m.vehiculo ? `${m.vehiculo.patente} - ${m.vehiculo.marca}` : 'N/A'}
                                    </td>
                                    <td>{m.tipo_servicio}</td>
                                    <td>{new Date(m.fecha_inicio).toLocaleDateString()}</td>
                                    <td>{new Date(m.fecha_fin).toLocaleDateString()}</td>
                                    <td>${parseFloat(m.costo).toFixed(2)}</td>
                                    
                                    <td className="action-buttons-cell">
                                        <button 
                                            className="btn-edit-red"
                                            onClick={() => handleEditar(m)}
                                            title="Modificar mantenimiento"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn-delete-red"
                                            onClick={() => handleEliminar(m.id_mantenimiento)}
                                            title="Eliminar registro"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionMantenimientos;