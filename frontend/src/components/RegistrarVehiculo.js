import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrarVehiculo = ({ apiBaseUrl, onBack, onSuccess, vehicleToEdit }) => {
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

  // EFECTO: Si recibimos un vehículo para editar, llenamos el formulario
  useEffect(() => {
    if (vehicleToEdit) {
        setFormData({
            patente: vehicleToEdit.patente,
            marca: vehicleToEdit.marca,
            modelo: vehicleToEdit.modelo,
            anio: vehicleToEdit.anio,
            precio_diario: vehicleToEdit.precio_diario,
            estado: vehicleToEdit.estado
        });
    } else {
        // Limpiar si es registro nuevo
        setFormData({
            patente: '',
            marca: '',
            modelo: '',
            anio: '',
            precio_diario: '',
            estado: 'Disponible'
        });
    }
  }, [vehicleToEdit]);

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

    // Determinamos si es PUT (Actualizar) o POST (Crear)
    const method = vehicleToEdit ? 'PUT' : 'POST';
    
    // Si es PUT, la URL incluye la patente original. Si es POST, es solo /vehiculos
    const url = vehicleToEdit 
        ? `${apiBaseUrl}/vehiculos/${vehicleToEdit.patente}`
        : `${apiBaseUrl}/vehiculos`;

    try {
      const response = await fetch(url, {
        method: method,
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
        alert(vehicleToEdit ? "Vehículo actualizado con éxito" : "Vehículo registrado con éxito");
        if (onSuccess) onSuccess(); // Avisar al padre para recargar la lista
      } else {
        setError(data.error || "Error al procesar la solicitud.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
      console.error(err);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">
          {vehicleToEdit ? `Modificar Vehículo ${vehicleToEdit.patente}` : 'Registrar Nuevo Vehículo'}
      </h2>
      
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
            // AQUÍ ESTÁ LA CLAVE: Si estamos editando, se deshabilita
            disabled={!!vehicleToEdit} 
            style={{ backgroundColor: vehicleToEdit ? '#e9ecef' : 'white' }} // Visualmente gris si está bloqueado
          />
          {!vehicleToEdit && <small>6 o 7 caracteres alfanuméricos. (No editable posteriormente)</small>}
        </div>

        <div className="form-group">
          <label>Marca</label>
          <input
            className="form-input"
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
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
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
            <label>Estado</label>
            <select className="form-select" name="estado" value={formData.estado} onChange={handleChange}>
                <option value="Disponible">Disponible</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Alquilado">Alquilado</option>
                <option value="Reservado">Reservado</option>
            </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {vehicleToEdit ? 'Guardar Cambios' : 'Registrar'}
            </button>
            
            <button type="button" className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>
                Cancelar
            </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarVehiculo;