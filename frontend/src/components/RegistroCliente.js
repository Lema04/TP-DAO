
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

  const handleChange = (e) => {
    setDatosCliente({ ...datosCliente, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Registrando cliente...');

    // Llama al endpoint POST /clientes (asumiendo que existe)
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCliente),
      });

      const result = await response.json();

      if (result.estado === 'ok') {
        setMensaje(`Cliente registrado con ID: ${result.mensaje.split('ID ')[1].replace('.', '')}`);
        setDatosCliente({ nombre: '', apellido: '', dni: '', direccion: '', telefono: '', email: '' });
      } else {
        setMensaje(`Error: ${result.mensaje}`);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor de clientes.');
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
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default RegistroCliente;