import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ListadoAlquileres = () => {
    const { user } = useAuth();
    const [alquileres, setAlquileres] = useState([]);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [alquilerAFinalizar, setAlquilerAFinalizar] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        cargarAlquileres();
    }, []);

    const cargarAlquileres = async () => {
        try {
            const response = await fetch(`${API_URL}/alquileres`);
            if (!response.ok) throw new Error('Error al cargar alquileres');
            const data = await response.json();
            setAlquileres(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const confirmarFinalizacion = (alquiler) => {
        setAlquilerAFinalizar(alquiler);
        setShowModal(true);
    };

    const finalizarAlquiler = async () => {
        if (!alquilerAFinalizar) return;

        try {
            const response = await fetch(`${API_URL}/alquileres/${alquilerAFinalizar.id_alquiler}/finalizar`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al finalizar alquiler');
            }

            setMensaje('Alquiler finalizado correctamente');
            setShowModal(false);
            setAlquilerAFinalizar(null);
            cargarAlquileres();
            
            setTimeout(() => setMensaje(''), 3000);

        } catch (err) {
            setError(err.message);
            setShowModal(false);
            setAlquilerAFinalizar(null);
            setTimeout(() => setError(''), 3000);
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

        if (estado === 'Activo') {
            return { ...baseStyle, backgroundColor: '#48bb78', color: 'white' };
        } else {
            return { ...baseStyle, backgroundColor: '#718096', color: 'white' };
        }
    };

    if (!user || (user.rol !== 'supervisor' && user.rol !== 'atencion')) {
        return <div className="container"><h3>Acceso Denegado</h3></div>;
    }

    return (
        <>
            <div className="form-card wide" style={{ maxWidth: '1200px', margin: '2rem auto' }}>
                <h2 className="form-title">Gestión de Alquileres</h2>
                
                {error && <div className="error-message">{error}</div>}
                {mensaje && <div className="success-message">{mensaje}</div>}

                <div style={{ overflowX: 'auto' }}>
                    <table className="styled-table" style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <thead>
                            <tr style={{ 
                                backgroundColor: '#cc0000', 
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Nro</th>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Vehículo</th>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Cliente</th>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Desde</th>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Hasta</th>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Estado</th>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Costo</th>
                                <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alquileres.map((alquiler, idx) => (
                                <tr key={alquiler.id_alquiler} style={{ 
                                    backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                                    borderBottom: '1px solid #e0e0e0',
                                    textAlign: 'center'
                                }}>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{alquiler.id_alquiler}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{alquiler.vehiculo ? alquiler.vehiculo.patente : 'N/A'}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{alquiler.cliente ? `${alquiler.cliente.nombre} ${alquiler.cliente.apellido}` : 'N/A'}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{new Date(alquiler.fecha_inicio).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{new Date(alquiler.fecha_fin).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <span style={getEstadoBadgeStyle(alquiler.estado)}>
                                            {alquiler.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>${parseFloat(alquiler.costo_total).toFixed(2)}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        {alquiler.estado === 'Activo' && (
                                            <button 
                                                className="btn-primary"
                                                style={{ 
                                                    width: 'auto', 
                                                    marginTop: 0, 
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.9rem'
                                                }}
                                                onClick={() => confirmarFinalizacion(alquiler)}
                                            >
                                                Finalizar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {alquileres.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ 
                                        padding: '2rem', 
                                        textAlign: 'center',
                                        color: '#666',
                                        fontStyle: 'italic'
                                    }}>No hay alquileres registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="modal-icon">⚠️</span>
                        <h3>Confirmar Finalización</h3>
                        <p>¿Está seguro de finalizar este alquiler?</p>
                        
                        {alquilerAFinalizar && (
                            <div className="modal-details">
                                <div className="detail-row">
                                    <span className="detail-label">ID Alquiler:</span>
                                    <span className="detail-value">{alquilerAFinalizar.id_alquiler}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Vehículo:</span>
                                    <span className="detail-value">{alquilerAFinalizar.vehiculo?.patente || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Cliente:</span>
                                    <span className="detail-value">
                                        {alquilerAFinalizar.cliente ? 
                                            `${alquilerAFinalizar.cliente.nombre} ${alquilerAFinalizar.cliente.apellido}` : 
                                            'N/A'}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '1rem' }}>
                            El vehículo quedará disponible nuevamente.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowModal(false)}
                                style={{ marginTop: 0 }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="modal-close-btn"
                                onClick={finalizarAlquiler}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListadoAlquileres;
