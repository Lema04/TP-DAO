// --- /frontend/src/components/GestionMultas.js ---

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GestionMultas = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchAlquileres = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/alquileres`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar alquileres');
        }
        setAlquileres(data); 
      } catch (error) {
        setMensaje(`Error al cargar lista de alquileres: ${error.message}`);
        setEsError(true);
      }
    };
    fetchAlquileres();
  }, [apiBaseUrl]);

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
      setMultaRegistrada({
          id: result.id_multa,
          ...datosMulta,
          alquiler: alquileres.find(a => a.id_alquiler == datosMulta.id_alquiler)
      });
      setShowModal(true);

      setDatosMulta({
        id_alquiler: '', 
        descripcion: '', 
        monto: 0.0,
        fecha_incidente: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar multa:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setMultaRegistrada(null);
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Gestión de Multas y Daños</h2>
      
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
            />
        </div>

        <button type="submit" className="btn-primary">Registrar Multa</button>
      </form>
      
      <button className="btn-secondary" onClick={() => navigate('/home')}>
        Volver al Menú
      </button>

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
};

export default GestionMultas;