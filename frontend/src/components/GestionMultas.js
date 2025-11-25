import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GestionMultas = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  // --- ESTADOS AÑADIDOS PARA EL LISTADO ---
  const [view, setView] = useState("list"); // CAMBIO: Iniciar en 'list'
  const [filter, setFilter] = useState(""); 
  const [multas, setMultas] = useState([]); 
  const [filteredMultas, setFilteredMultas] = useState([]); 
  // ----------------------------------------
  const [alquileres, setAlquileres] = useState([]); 
  
  const [datosMulta, setDatosMulta] = useState({
    id_alquiler: '', 
    descripcion: '',
    monto: 0.0,
    fecha_incidente: new Date().toISOString().split('T')[0],
  });
  
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [multaRegistrada, setMultaRegistrada] = useState(null);

  // Helper para formato de fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [y, m, d] = dateString.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  // Función para cargar Alquileres
  const fetchAlquileres = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/alquileres`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar alquileres');
      }
      setAlquileres(data); 
    } catch (error) {
      // Solo loguear el error, no sobrescribir el mensaje principal del listado
      console.error('Error al cargar lista de alquileres:', error.message);
    }
  };

  // --- NUEVA FUNCIÓN: Cargar Multas ---
  const fetchMultas = async () => {
    try {
      setMensaje('Cargando multas...');
      setEsError(false);
      const response = await fetch(`${apiBaseUrl}/multas`);
      const data = await response.json(); 
      console.log(data)
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar multas');

      }
      setMultas(data);
      setFilteredMultas(data);
      // Ocultar mensaje de carga rápidamente
      setTimeout(() => setMensaje(''), 100); 
    } catch (error) {
      setMensaje(`Error al cargar lista de multas: ${error.message}`);
      setEsError(true);
      setMultas([]);
      setFilteredMultas([]);
    }
  };

  // Carga inicial y recarga de multas
  useEffect(() => {
    fetchAlquileres();
    fetchMultas(); // Cargar multas también al inicio
  }, [apiBaseUrl]);

 
  useEffect(() => {
    const lowerFiltro = filter.toLowerCase();
    const resultados = multas.filter(m => {
        // Asumiendo que la multa incluye alquiler.vehiculo y alquiler.cliente
        const patente = m.alquiler?.vehiculo?.patente || '';
        const clienteNombre = m.alquiler?.cliente ? 
            `${m.alquiler.cliente.nombre} ${m.alquiler.cliente.apellido}` : '';
        
        return clienteNombre.toLowerCase().includes(lowerFiltro) || 
               patente.toLowerCase().includes(lowerFiltro) ||
               m.descripcion.toLowerCase().includes(lowerFiltro);
    });
    setFilteredMultas(resultados);
  }, [filter, multas]);
  // ---------------------------------


  const handleChange = (e) => {
    setDatosMulta({ ...datosMulta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      const response = await fetch(`${apiBaseUrl}/multas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosMulta), 
      });

      const result = await response.json(); 

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }
      
      // Éxito
      const alquilerAsociado = alquileres.find(a => a.id_alquiler == datosMulta.id_alquiler);
      setMultaRegistrada({
          id: result.id_multa,
          ...datosMulta,
          alquiler: alquilerAsociado
      });
      setShowModal(true);

      // Limpiar y Recargar la lista de multas
      setDatosMulta({
        id_alquiler: '', 
        descripcion: '', 
        monto: 0.0,
        fecha_incidente: new Date().toISOString().split('T')[0]
      });
      fetchMultas(); // Recargar la lista después de un registro exitoso 

    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar multa:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setMultaRegistrada(null);
    setView('list'); // Volver al listado después de registrar
    setMensaje("Multa registrada con éxito.");
    setEsError(false);
    setTimeout(() => setMensaje(''), 3000);
  };
  
  // --- Renderizado del Listado (Vista principal) --- 
  const renderListView = () => (
    <div className="client-manager-container">
        <h1 className="main-title">Gestión de Multas y Daños</h1>
        <hr className="header-separator" />

        <div className="filter-and-button-row" style={{ justifyContent: 'space-between' }}>
            <div className="filter-group-compact">
                <input 
                    type="text" 
                    className="filter-input-compact" 
                    placeholder="🔍 Buscar por patente, cliente o descripción..." 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)} 
                    style={{ width: '300px' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                {/* Botón para registrar nueva multa (Estilo consistente con GestionAlquileres) */}
                <button 
                    className="btn-register-list-standalone" 
                    onClick={() => {
                        setView('form'); 
                        setMensaje('');
                        setEsError(false);
                    }}
                    style={{ backgroundColor: '#ed8936' }} // Color de Gestión de Alquileres
                >
                    + Registrar Multa
                </button>
            </div>
        </div>
        
        <div className="list-header-row"><h3 className="list-header-red">Listado de Multas y Daños</h3></div>
        
        {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

        <div className="table-responsive">
            <table className="client-data-table">
                <thead>
                    <tr>
                        <th>Nro Multa</th>
                        <th>Alquiler</th>
                        <th>Vehículo</th>
                        <th>Cliente</th>
                        <th>Fecha Incidente</th>
                        <th>Monto ($)</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMultas.length === 0 ? (
                        <tr><td colSpan="7" className="text-center-message">No se encontraron multas/daños.</td></tr>
                    ) : (
                        filteredMultas.map((m) => (
                            <tr key={m.id_multa}>
                                <td>{m.id_multa}</td>
                                <td>{m.alquiler?.id_alquiler || 'N/A'}</td>
                                <td style={{ fontWeight: 'bold' }}>
                                    {m.alquiler?.vehiculo?.patente || 'N/A'}
                                </td>
                                <td>
                                    {m.alquiler?.cliente ? `${m.alquiler.cliente.nombre} ${m.alquiler.cliente.apellido}` : 'N/A'}
                                </td>
                                <td>{formatDate(m.fecha_incidente)}</td>
                                <td className="text-right">${parseFloat(m.monto).toFixed(2)}</td>
                                <td>{m.descripcion}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button className="btn-secondary" onClick={() => navigate('/home')}>
                Volver al Menú
            </button>
        </div>
    </div>
  );
  // ------------------------------------

  // --- RENDERIZADO DEL FORMULARIO ---
  const renderFormView = () => (
    <div className="form-card">
      <h2 className="form-title">Registrar Multa o Daño</h2>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        
        <div className="form-group">
            <label>Alquiler Asociado:</label>
            <select className="form-select" name="id_alquiler" onChange={handleChange} required value={datosMulta.id_alquiler}>
            <option value="">Seleccione un Alquiler</option>
            {alquileres.map(alq => (
                <option key={alq.id_alquiler} value={alq.id_alquiler}>
                Alq. {alq.id_alquiler} (Vehículo: {alq.vehiculo.patente} / Cliente: {alq.cliente.dni}, {alq.cliente.apellido})
                </option>
            ))}
            </select>
        </div>
        
        <div className="form-group">
            <label>Descripción del Daño/Multa:</label>
            <textarea className="form-input" name="descripcion" onChange={handleChange} required value={datosMulta.descripcion} rows="3"></textarea>
        </div>
        
        <div className="form-group">
            <label>Monto a Cobrar (USD):</label>
            <input className="form-input" type="number" name="monto" onChange={handleChange} required value={datosMulta.monto} min="0.01" step="0.01" />
        </div>

        <div className="form-group">
            <label>Fecha de Incidente:</label>
            <input 
            className="form-input"
            type="date" 
            name="fecha_incidente" 
            onChange={handleChange} 
            required 
            value={datosMulta.fecha_incidente} 
            max={new Date().toISOString().split('T')[0]}
            />
        </div>

        <button type="submit" className="btn-primary">Registrar Multa</button>
      </form>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', gap: '10px' }}>
        <button className="btn-secondary" onClick={() => setView('list')}>
            ← Volver al Listado
        </button>
        <button className="btn-secondary" onClick={() => navigate('/home')}>
            Volver al Menú
        </button>
      </div>


      {/* MODAL DE ÉXITO */}
      {showModal && multaRegistrada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">⚠️</span>
            <h3>¡Multa Registrada!</h3>
            <p>La incidencia ha sido guardada correctamente.</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">ID Multa:</span>
                <span className="detail-value">#{multaRegistrada.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Alquiler:</span>
                <span className="detail-value">#{multaRegistrada.id_alquiler}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Monto:</span>
                <span className="detail-value">${multaRegistrada.monto}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fecha:</span>
                <span className="detail-value">{multaRegistrada.fecha_incidente}</span>
              </div>
            </div>

            <button className="modal-close-btn" onClick={closeModal}>
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
  // ------------------------------------

  // Renderizar la vista actual
  return view === 'form' ? renderFormView() : renderListView();
};

export default GestionMultas;