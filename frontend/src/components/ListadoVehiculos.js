import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ListadoVehiculos = () => {
    const { user } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [error, setError] = useState('');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        cargarVehiculos();
    }, []);

    const cargarVehiculos = async () => {
        try {
            const response = await fetch(`${API_URL}/vehiculos`);
            if (!response.ok) throw new Error('Error al cargar vehículos');
            const data = await response.json();
            setVehiculos(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const getEstadoBadgeStyle = (estado) => {
        const baseStyle = {
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.85rem',
            display: 'inline-block'
        };

        switch(estado) {
            case 'Disponible':
                return { ...baseStyle, backgroundColor: '#48bb78', color: 'white' };
            case 'Alquilado':
                return { ...baseStyle, backgroundColor: '#cc0000', color: 'white' };
            case 'Reservado':
                return { ...baseStyle, backgroundColor: '#f6ad55', color: 'white' };
            case 'Mantenimiento':
                return { ...baseStyle, backgroundColor: '#ecc94b', color: '#2d3748' };
            default:
                return { ...baseStyle, backgroundColor: '#cbd5e0', color: '#2d3748' };
        }
    };

    if (!user || (user.rol !== 'supervisor' && user.rol !== 'atencion')) {
        return <div className="container"><h3>Acceso Denegado</h3></div>;
    }

    return (
        <div className="form-card wide" style={{ maxWidth: '1200px', margin: '2rem auto' }}>
            <h2 className="form-title">Listado de Vehículos</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '0.95rem'
                }}>
                    <thead>
                        <tr style={{ 
                            backgroundColor: '#cc0000', 
                            color: 'white',
                            textAlign: 'left'
                        }}>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000' }}>Patente</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000' }}>Marca</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000' }}>Modelo</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000' }}>Año</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehiculos.map((v, idx) => (
                            <tr key={v.patente} style={{ 
                                backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                                borderBottom: '1px solid #e0e0e0'
                            }}>
                                <td style={{ padding: '0.75rem' }}>{v.patente}</td>
                                <td style={{ padding: '0.75rem' }}>{v.marca}</td>
                                <td style={{ padding: '0.75rem' }}>{v.modelo}</td>
                                <td style={{ padding: '0.75rem' }}>{v.anio}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={getEstadoBadgeStyle(v.estado)}>
                                        {v.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {vehiculos.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ 
                                    padding: '2rem', 
                                    textAlign: 'center',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>No hay vehículos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListadoVehiculos;
