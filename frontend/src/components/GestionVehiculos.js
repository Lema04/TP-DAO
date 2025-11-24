import React, { useState, useEffect } from 'react';
import RegistrarVehiculo from './RegistrarVehiculo';

const GestionVehiculos = ({ apiBaseUrl }) => {
    const [vehiculos, setVehiculos] = useState([]);
    const [filteredVehiculos, setFilteredVehiculos] = useState([]);
    const [filter, setFilter] = useState('');
    const [view, setView] = useState('list'); // Controla si vemos la lista o el formulario
    const [vehicleToEdit, setVehicleToEdit] = useState(null); // Almacena el objeto a editar
    const [error, setError] = useState('');

    // Cargar datos al inicio
    useEffect(() => {
        fetchVehiculos();
    }, []);

    // Filtrado en tiempo real
    useEffect(() => {
        if (!vehiculos) return;
        const lowerFilter = filter.toLowerCase();
        const results = vehiculos.filter(v => 
            v.patente.toLowerCase().includes(lowerFilter) ||
            v.marca.toLowerCase().includes(lowerFilter) ||
            v.modelo.toLowerCase().includes(lowerFilter)
        );
        setFilteredVehiculos(results);
    }, [filter, vehiculos]);

    const fetchVehiculos = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/vehiculos`);
            if (!response.ok) throw new Error('Error al cargar vehículos');
            const data = await response.json();
            setVehiculos(data);
            setFilteredVehiculos(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (patente) => {
        if (!window.confirm(`¿Estás seguro de eliminar el vehículo ${patente}?`)) return;

        try {
            const response = await fetch(`${apiBaseUrl}/vehiculos/${patente}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchVehiculos(); // Recargar lista
            } else {
                const data = await response.json();
                alert(data.error || "No se pudo eliminar el vehículo.");
            }
        } catch (err) {
            alert("Error de conexión.");
        }
    };

    // Acción al hacer click en "Editar"
    const handleEdit = (vehiculo) => {
        setVehicleToEdit(vehiculo); // Guardamos el objeto entero
        setView('form'); // Cambiamos a la vista de formulario
    };

    // Acción al hacer click en "Registrar Nuevo"
    const handleRegister = () => {
        setVehicleToEdit(null); // Limpiamos para que el formulario sepa que es nuevo
        setView('form');
    };

    // Cuando el formulario termina exitosamente
    const handleSuccess = () => {
        fetchVehiculos();
        setView('list');
        setVehicleToEdit(null);
    };

    // --- VISTA: FORMULARIO ---
    if (view === 'form') {
        return (
            <RegistrarVehiculo 
                apiBaseUrl={apiBaseUrl} 
                onBack={() => { setView('list'); setVehicleToEdit(null); }} 
                onSuccess={handleSuccess}
                vehicleToEdit={vehicleToEdit} // Pasamos el objeto (o null)
            />
        );
    }

    // Helper para estilos de estado
    const getEstadoBadgeStyle = (estado) => {
        const baseStyle = {
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.85rem',
            display: 'inline-block',
            color: 'white'
        };
        switch(estado) {
            case 'Disponible': return { ...baseStyle, backgroundColor: '#48bb78' };
            case 'Alquilado': return { ...baseStyle, backgroundColor: '#cc0000' };
            case 'Reservado': return { ...baseStyle, backgroundColor: '#f6ad55' };
            case 'Mantenimiento': return { ...baseStyle, backgroundColor: '#ecc94b', color: '#2d3748' };
            default: return { ...baseStyle, backgroundColor: '#cbd5e0', color: '#2d3748' };
        }
    };

    // --- VISTA: LISTADO ---
    return (
        <div className="form-card wide" style={{ maxWidth: '1200px', margin: '2rem auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="form-title" style={{ margin: 0 }}>Gestión de Vehículos</h2>
                <button className="btn-primary" onClick={handleRegister} style={{ width: 'auto', padding: '10px 20px' }}>
                    + Nuevo Vehículo
                </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por patente, marca..." 
                    className="form-input"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            
            {error && <div className="error-message">{error}</div>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#cc0000', color: 'white' }}>
                            <th style={{ padding: '10px' }}>Patente</th>
                            <th style={{ padding: '10px' }}>Marca</th>
                            <th style={{ padding: '10px' }}>Modelo</th>
                            <th style={{ padding: '10px' }}>Año</th>
                            <th style={{ padding: '10px' }}>Precio</th>
                            <th style={{ padding: '10px' }}>Estado</th>
                            <th style={{ padding: '10px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehiculos.map((v, idx) => (
                            <tr key={v.patente} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{v.patente}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{v.marca}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{v.modelo}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{v.anio}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>${v.precio_diario}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <span style={getEstadoBadgeStyle(v.estado)}>{v.estado}</span>
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => handleEdit(v)}
                                        className='btn-edit-red'
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(v.patente)}
                                        className='btn-delete-red'
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredVehiculos.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>No se encontraron vehículos.</p>
                )}
            </div>
        </div>
    );
};

export default GestionVehiculos;