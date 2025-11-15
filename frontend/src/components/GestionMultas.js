// --- /frontend/src/components/GestionMultas.js (¡ARREGLADO!) ---

import React, { useState, useEffect } from 'react';
// (No necesitas useAuth si este formulario es para un Empleado/Gerente ya logueado)

const GestionMultas = ({ apiBaseUrl }) => {
  
  // --- CAMBIO 1: Cargar Alquileres para el Dropdown ---
  const [alquileres, setAlquileres] = useState([]); // Estado para el <select>
  
  const [datosMulta, setDatosMulta] = useState({
    id_alquiler: '', 
    descripcion: '',
    monto: 0.0,
    // --- CAMBIO 2: Usar el nombre de campo correcto ---
    fecha_incidente: new Date().toISOString().split('T')[0],
  });
  
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  // Carga los alquileres al montar el componente para llenar el <select>
  useEffect(() => {
    const fetchAlquileres = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/alquileres`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar alquileres');
        }
        // 'data' es la lista de objetos Alquiler
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

  // --- CAMBIO 3: Lógica de Submit (Estilo POO) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Registrando multa...');
    setEsError(false);

    try {
      const response = await fetch(`${apiBaseUrl}/multas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosMulta), // Envía 'fecha_incidente'
      });

      const result = await response.json(); // Leer JSON (éxito o error)

      if (!response.ok) {
        // El backend envió 4xx/5xx. 'result' es {"error": "..."}
        throw new Error(result.error || `Error ${response.status}`);
      }
      
      // Éxito (201 Created): 'result' es el objeto Multa completo
      setMensaje(`¡Multa registrada con ID: ${result.id_multa}!`);
      setEsError(false);
      // Limpiar formulario
      setDatosMulta({
        id_alquiler: '', 
        descripcion: '', 
        monto: 0.0,
        fecha_incidente: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      // Captura el 'throw' o un error de red
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar multa:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Gestión de Multas y Daños</h2>
      <form onSubmit={handleSubmit}>
        
        {/* --- CAMBIO 1: <select> en lugar de <input> --- */}
        <label>Alquiler Asociado:</label>
        <select name="id_alquiler" onChange={handleChange} required value={datosMulta.id_alquiler}>
          <option value="">Seleccione un Alquiler</option>
          {/* 'alquileres' es un array de OBJETOS Alquiler */}
          {alquileres.map(alq => (
            <option key={alq.id_alquiler} value={alq.id_alquiler}>
              {/* Mostramos info del vehículo y cliente (gracias a POO) */}
              Alq. {alq.id_alquiler} (Vehículo: {alq.vehiculo.patente} / Cliente: {alq.cliente.dni}, {alq.cliente.apellido})
            </option>
          ))}
        </select>
        
        <label>Descripción del Daño/Multa:</label>
        <textarea name="descripcion" onChange={handleChange} required value={datosMulta.descripcion}></textarea>
        
        <label>Monto a Cobrar (USD):</label>
        <input type="number" name="monto" onChange={handleChange} required value={datosMulta.monto} min="0.01" step="0.01" />

        {/* --- CAMBIO 2: Label y 'name' corregidos --- */}
        <label>Fecha de Incidente:</label>
        <input 
          type="date" 
          name="fecha_incidente" 
          onChange={handleChange} 
          required 
          value={datosMulta.fecha_incidente} 
        />

        <button type="submit">Registrar Multa</button>
      </form>
      
      {/* Mensaje de éxito o error */}
      {mensaje && (
        <p className={`mensaje ${esError ? 'error' : 'success'}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default GestionMultas;