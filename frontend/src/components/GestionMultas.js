// Asumo que el "Control de mantenimiento" se realiza internamente modificando el vehículo (PUT /vehiculos/<patente>), pero la multa es una transacción nueva.

import React, { useState } from 'react';

const GestionMultas = ({ apiBaseUrl }) => {
  const [datosMulta, setDatosMulta] = useState({
    id_alquiler: '', // Necesitas el ID del alquiler para asociar la multa
    descripcion: '',
    monto: 0.0,
    fecha_multa: new Date().toISOString().split('T')[0],
  });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setDatosMulta({ ...datosMulta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Registrando multa...');

    // Llama al endpoint POST /multas
    try {
      const response = await fetch(`${apiBaseUrl}/multas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosMulta),
      });

      const result = await response.json();

      if (response.status == 200) {
        setMensaje('Multa registrada correctamente.');
      } else {
        setMensaje(`Error: ${result.mensaje}`);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor.');
      console.error('Error al registrar multa:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Gestión de Multas y Daños</h2>
      <form onSubmit={handleSubmit}>
        <label>ID Alquiler Asociado:</label>
        <input type="number" name="id_alquiler" onChange={handleChange} required value={datosMulta.id_alquiler} />
        
        <label>Descripción del Daño/Multa:</label>
        <textarea name="descripcion" onChange={handleChange} required value={datosMulta.descripcion}></textarea>
        
        <label>Monto a Cobrar (USD):</label>
        <input type="number" name="monto" onChange={handleChange} required value={datosMulta.monto} min="0" step="0.01" />

        <label>Fecha de Registro:</label>
        <input type="date" name="fecha_multa" onChange={handleChange} required value={datosMulta.fecha_multa} />

        <button type="submit">Registrar Multa</button>
      </form>
      {mensaje && <p className="mensaje">{mensaje}</p>}
      
    <p className="note">⚠️ El **Control de Mantenimiento** (ej. cambiar estado a 'mantenimiento') debe hacerse a través de un <code>PUT /vehiculos/&lt;patente&gt;</code> desde el *backend* o una interfaz de administración dedicada.</p>    </div>
  );
};

export default GestionMultas;