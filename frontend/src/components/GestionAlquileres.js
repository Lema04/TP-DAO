import React, { useState, useEffect } from 'react';
import RegistroAlquiler from './RegistroAlquiler';

const GestionAlquileres = ({ apiBaseUrl }) => {
    const [alquileres, setAlquileres] = useState([]);
    const [filteredAlquileres, setFilteredAlquileres] = useState([]);
    const [filter, setFilter] = useState("");
    
    // Estado de vista y edición
    const [view, setView] = useState("list"); // 'list' | 'form'
    const [alquilerToEdit, setAlquilerToEdit] = useState(null);
    
    const [error, setError] = useState("");

    // Cargar datos
    useEffect(() => {
        fetchAlquileres();
    }, []);

    // Filtrado
    useEffect(() => {
        const lowerFiltro = filter.toLowerCase();
        const resultados = alquileres.filter(a => {
            const clienteNombre = a.cliente ? `${a.cliente.nombre} ${a.cliente.apellido}` : '';
            const patente = a.vehiculo ? a.vehiculo.patente : '';
            
            return clienteNombre.toLowerCase().includes(lowerFiltro) || 
                   patente.toLowerCase().includes(lowerFiltro);
        });
        setFilteredAlquileres(resultados);
    }, [filter, alquileres]);

    const fetchAlquileres = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/alquileres`);
            if (!response.ok) throw new Error("Error al cargar alquileres");
            const data = await response.json();
            setAlquileres(data);
            setFilteredAlquileres(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // --- ACCIONES ---

    const handleNuevo = () => {
        setAlquilerToEdit(null); // Limpiamos para indicar creación
        setView('form');
    };

    const handleEditar = (alquiler) => {
        setAlquilerToEdit(alquiler); // Pasamos el objeto a editar
        setView('form');
    };

    const handleEliminar = async (id_alquiler) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro de alquiler? El vehículo quedará disponible.")) return;

        try {
            const response = await fetch(`${apiBaseUrl}/alquileres/${id_alquiler}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchAlquileres();
            } else {
                const data = await response.json();
                alert(data.error || "No se pudo eliminar el alquiler.");
            }
        } catch (err) {
            alert("Error de conexión.");
        }
    };

    const getEstadoBadgeStyle = (estado) => {
        const estadoStr = estado || "Desconocido";
        const baseStyle = {
            padding: '0.3rem 0.6rem',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            display: 'inline-block',
            color: 'white'
        };
        
        if (estadoStr === 'Terminado') return { ...baseStyle, backgroundColor: '#718096' }; // Gris
        if (estadoStr === 'En Curso') return { ...baseStyle, backgroundColor: '#48bb78' }; // Verde
        return { ...baseStyle, backgroundColor: '#3182ce' }; // Azul por defecto
    };

    // --- RENDERIZADO ---
    
    // Vista Formulario (Crear o Editar)
    if (view === 'form') {
        return (
            <RegistroAlquiler 
                apiBaseUrl={apiBaseUrl} 
                onBack={() => {
                    setView('list');
                    setAlquilerToEdit(null);
                }}
                onSuccess={() => {
                    setView('list');
                    setAlquilerToEdit(null);
                    fetchAlquileres();
                }}
                alquilerToEdit={alquilerToEdit} // Pasamos el prop nuevo
            />
        );
    }

    // Vista Listado
    return (
        <div className="client-manager-container">
            <h1 className="main-title">Gestión de Alquileres</h1>
            <hr className="header-separator" />

            <div className="filter-and-button-row">
                <div className="filter-group-compact">
                    <input 
                        type="text" 
                        className="filter-input-compact" 
                        placeholder="🔍 Buscar por cliente o patente..." 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)} 
                        style={{ width: '300px' }}
                    />
                </div>

                <button className="btn-register-list-standalone" onClick={handleNuevo}>
                    + Nuevo Alquiler
                </button>
            </div>

            <div className="list-header-row"><h3 className="list-header-red">Historial de Alquileres</h3></div>
            
            {error && <div className="error-message">{error}</div>}

            <div className="table-responsive">
                <table className="client-data-table">
                    <thead>
                        <tr>
                            <th>Nro</th>
                            <th>Vehículo</th>
                            <th>Cliente</th>
                            <th>Desde</th>
                            <th>Hasta</th>
                            <th>Estado</th>
                            <th>Costo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlquileres.length === 0 ? (
                            <tr><td colSpan="8" className="text-center-message">No hay alquileres registrados.</td></tr>
                        ) : (
                            filteredAlquileres.map((alq) => (
                                <tr key={alq.id_alquiler}>
                                    <td>{alq.id_alquiler}</td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {alq.vehiculo ? alq.vehiculo.patente : 'N/A'}
                                    </td>
                                    <td>
                                        {alq.cliente ? `${alq.cliente.nombre} ${alq.cliente.apellido}` : 'N/A'}
                                    </td>
                                    <td>{new Date(alq.fecha_inicio).toLocaleDateString()}</td>
                                    <td>{new Date(alq.fecha_fin).toLocaleDateString()}</td>
                                    <td>
                                        <span style={getEstadoBadgeStyle(alq.estado)}>
                                            {alq.estado || 'En Curso'}
                                        </span>
                                    </td>
                                    <td>${parseFloat(alq.costo_total).toFixed(2)}</td>
                                    <td className="action-buttons-cell">
                                        <button 
                                            className="btn-edit-red"
                                            onClick={() => handleEditar(alq)}
                                            title="Modificar datos"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn-delete-red"
                                            onClick={() => handleEliminar(alq.id_alquiler)}
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

export default GestionAlquileres;