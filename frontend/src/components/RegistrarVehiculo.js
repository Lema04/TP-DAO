import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './RegistrarVehiculo.css'; // Ya no es necesario, usamos estilos globales en App.css

const RegistrarVehiculo = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    precio_diario: '',
    estado: 'Disponible'
  });

  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [registeredVehicle, setRegisteredVehicle] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!formData.patente || !formData.marca || !formData.modelo || !formData.anio || !formData.precio_diario) {
        setError("Por favor, complete todos los campos obligatorios.");
        return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/vehiculos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...formData,
            anio: parseInt(formData.anio),
            precio_diario: parseFloat(formData.precio_diario)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardamos los datos del vehículo registrado para el modal
        setRegisteredVehicle(data);
        setShowModal(true);
        
        // Limpiar formulario
        setFormData({
            patente: '',
            marca: '',
            modelo: '',
            anio: '',
            precio_diario: '',
            estado: 'Disponible'
        });
      } else {
        setError(data.error || "Error al registrar el vehículo.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setRegisteredVehicle(null);
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Registrar Nuevo Vehículo</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        <div className="form-group">
          <label>Patente</label>
          <input
            className="form-input"
            type="text"
            name="patente"
            value={formData.patente}
            onChange={handleChange}
            placeholder="Ej: AA123BB"
            maxLength="7"
            required
          />
          <small>6 o 7 caracteres alfanuméricos</small>
        </div>

        <div className="form-group">
          <label>Marca</label>
          <input
            className="form-input"
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            placeholder="Ej: Toyota"
            required
          />
        </div>

        <div className="form-group">
          <label>Modelo</label>
          <input
            className="form-input"
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            placeholder="Ej: Corolla"
            required
          />
        </div>

        <div className="form-group">
          <label>Año</label>
          <input
            className="form-input"
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            placeholder="Ej: 2022"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        <div className="form-group">
          <label>Precio Diario ($)</label>
          <input
            className="form-input"
            type="number"
            name="precio_diario"
            value={formData.precio_diario}
            onChange={handleChange}
            placeholder="Ej: 50.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
            <label>Estado Inicial</label>
            <select className="form-select" name="estado" value={formData.estado} onChange={handleChange}>
                <option value="Disponible">Disponible</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Alquilado">Alquilado</option>
                <option value="Reservado">Reservado</option>
            </select>
        </div>

        <button type="submit" className="btn-primary">Registrar Vehículo</button>
      </form>
      
      <button className="btn-secondary" onClick={() => navigate('/home')}>
        Volver al Menú
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && registeredVehicle && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🎉</span>
            <h3>¡Registro Exitoso!</h3>
            <p>El vehículo ha sido agregado correctamente al sistema.</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">Patente:</span>
                <span className="detail-value">{registeredVehicle.patente}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Vehículo:</span>
                <span className="detail-value">{registeredVehicle.marca} {registeredVehicle.modelo}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Año:</span>
                <span className="detail-value">{registeredVehicle.anio}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Precio:</span>
                <span className="detail-value">${registeredVehicle.precio_diario} / día</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className="detail-value">{registeredVehicle.estado}</span>
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

export default RegistrarVehiculo;
