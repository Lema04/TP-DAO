// --- /frontend/src/components/RegistroCliente.js (¡ARREGLADO!) ---

import React, { useState } from 'react';

// URL BASE de tu API de Flask
const API_BASE_URL = 'http://127.0.0.1:5000'; 

const RegistroCliente = () => {
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false); // Estado para controlar el estilo del mensaje

  const handleChange = (e) => {
    setDatosCliente({ ...datosCliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Registrando cliente...');
    setEsError(false); // Resetea el estado de error

    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCliente),
      });

      // Leemos el JSON. El backend *siempre* devuelve JSON (éxito o error)
      const result = await response.json();

      // --- ¡LÓGICA DE MANEJO DE ERRORES REFACTORIZADA! ---
      if (!response.ok) {
        // El backend envió un 4xx o 5xx. 'result' es {"error": "..."}
        // Lanzamos un error para que lo capture el 'catch'
        throw new Error(result.error || `Error ${response.status}`);
      }

      // --- LÓGICA DE ÉXITO (response.ok fue true, ej: 201 Created) ---
      // 'result' es el objeto Cliente: {"id_cliente": 123, "nombre": "...", ...}
      
      setMensaje(`¡Cliente registrado con ID: ${result.id_cliente}!`);
      setEsError(false); // Nos aseguramos de que no se muestre como error
      setDatosCliente({ nombre: '', apellido: '', dni: '', direccion: '', telefono: '', email: '' });
    
    } catch (error) {
      // Captura el 'throw new Error' o un error de red (ej. servidor caído)
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar cliente:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Registro de Nuevo Cliente</h2>
      <form onSubmit={handleSubmit}>
        
        <label>Nombre:</label>
        <input type="text" name="nombre" onChange={handleChange} required value={datosCliente.nombre} />
        
        <label>Apellido:</label>
        <input type="text" name="apellido" onChange={handleChange} required value={datosCliente.apellido} />
        
        <label>DNI:</label>
        <input type="text" name="dni" onChange={handleChange} required value={datosCliente.dni} />
        
        <label>Dirección:</label>
        <input type="text" name="direccion" onChange={handleChange} value={datosCliente.direccion} />
        
        <label>Teléfono:</label>
        <input type="text" name="telefono" onChange={handleChange} value={datosCliente.telefono} />
        
        <label>Email:</label>
        <input type="email" name="email" onChange={handleChange} required value={datosCliente.email} />

        <button type="submit">Registrar Cliente</button>
      </form>
      
      {/* El mensaje se mostrará con la clase 'error' o 'success' 
        (Asumiendo que tienes una clase 'success' en tu CSS)
      */}
      {mensaje && (
        <p className={`mensaje ${esError ? 'error' : 'success'}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default RegistroCliente;