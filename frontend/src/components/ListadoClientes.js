import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const ListadoClientes = () => {
    const { user } = useAuth();
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async (query = '') => {
        try {
            let url = `${API_URL}/clientes`;
            if (query) {
                url += `?buscar=${query}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            setClientes(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        cargarClientes(busqueda);
    };

    if (!user || (user.rol !== 'supervisor' && user.rol !== 'atencion')) {
        return <div className="container"><h3>Acceso Denegado</h3></div>;
    }

    return (
        <div className="form-card wide" style={{ maxWidth: '1200px', margin: '2rem auto' }}>
            <h2 className="form-title">Listado de Clientes</h2>
            
            <form onSubmit={handleSearch} style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                marginBottom: '1.5rem',
                alignItems: 'stretch'
            }}>
                <div style={{ flex: 1 }}>
                    <input 
                        type="text" 
                        className="form-input"
                        placeholder="Buscar por DNI o Nombre..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn-primary" style={{ 
                    width: 'auto', 
                    marginTop: 0, 
                    padding: '0.8rem 1.5rem' 
                }}>Buscar</button>
                {busqueda && (
                    <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ 
                            width: 'auto', 
                            marginTop: 0, 
                            padding: '0.8rem 1.5rem' 
                        }}
                        onClick={() => { setBusqueda(''); cargarClientes(); }}
                    >
                        Limpiar
                    </button>
                )}
            </form>

            {error && <div className="alert alert-danger" style={{ 
                padding: '1rem', 
                backgroundColor: '#fee', 
                color: '#c00', 
                borderRadius: '4px',
                marginBottom: '1rem'
            }}>{error}</div>}

            <div style={{ overflowX: 'auto' }}>
                <table className='styled-table'
                style={{ 
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
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>ID</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Nombre</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Apellido</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>DNI</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Email</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Teléfono</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((c, idx) => (
                            <tr key={c.id_cliente} style={{ 
                                backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                                borderBottom: '1px solid #e0e0e0',
                                textAlign: 'center'
                            }}>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{c.id_cliente}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{c.nombre}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{c.apellido}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{c.dni}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{c.email}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{c.telefono}</td>
                            </tr>
                        ))}
                        {clientes.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ 
                                    padding: '2rem', 
                                    textAlign: 'center',
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>No se encontraron clientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListadoClientes;
