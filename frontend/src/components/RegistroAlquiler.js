// llama al endpoint POST /alquileres
import React, { useState, useEffect } from 'react';

const RegistroAlquiler = ({ apiBaseUrl }) => {
  const [datos, setDatos] = useState({
    id_cliente: '',
    patente: '',
    id_empleado: '',
    fecha_inicio: '',
    fecha_fin: '',
    costo_total: 0.0,
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // 1. Cargar datos iniciales (Vehículos, Clientes, Empleados)
  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json();
        // Asumiendo que el resultado es { estado: "ok", data: [...] }
        if (data.estado === 'ok' && data.data) {
          setter(data.data);
        }
      } catch (error) {
        console.error(`Error cargando ${endpoint}:`, error);
      }
    };

    fetchData('vehiculos', setVehiculos);
    fetchData('clientes', setClientes);
    fetchData('empleados', setEmpleados);
  }, [apiBaseUrl]);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Procesando alquiler...');

    // Llama al endpoint POST /alquileres
    try {
      const response = await fetch(`${apiBaseUrl}/alquileres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const result = await response.json();

      if (result.estado === 'ok') {
        setMensaje(`Alquiler registrado. ID: ${result.mensaje.split('ID ')[1].replace('.', '')}`);
        // Limpiar formulario o recargar datos
      } else {
        setMensaje(`Error: ${result.mensaje}`);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor.');
      console.error('Error al registrar alquiler:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Registro de Nuevo Alquiler</h2>
      <form onSubmit={handleSubmit}>
        {/* Selector de Cliente */}
        <label>Cliente:</label>
        <select name="id_cliente" onChange={handleChange} required value={datos.id_cliente}>
          <option value="">Seleccione Cliente</option>
          {clientes.map(c => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre} {c.apellido} (DNI: {c.dni})
            </option>
          ))}
        </select>
        
        {/* Selector de Empleado */}
        <label>Empleado:</label>
        <select name="id_empleado" onChange={handleChange} required value={datos.id_empleado}>
          <option value="">Seleccione Empleado</option>
          {empleados.map(e => (
            <option key={e.id_empleado} value={e.id_empleado}>
              {e.nombre} {e.apellido}
            </option>
          ))}
        </select>

        {/* Selector de Vehículo (Solo disponibles) */}
        <label>Vehículo (Patente):</label>
        <select name="patente" onChange={handleChange} required value={datos.patente}>
          <option value="">Seleccione Vehículo Disponible</option>
          {vehiculos
            .filter(v => v.estado === 'disponible') // **Validación de disponibilidad simple**
            .map(v => (
            <option key={v.patente} value={v.patente}>
              {v.marca} {v.modelo} ({v.patente})
            </option>
          ))}
        </select>

        {/* Fechas y Costo */}
        <label>Fecha Inicio:</label>
        <input type="date" name="fecha_inicio" onChange={handleChange} required value={datos.fecha_inicio} />

        <label>Fecha Fin:</label>
        <input type="date" name="fecha_fin" onChange={handleChange} required value={datos.fecha_fin} />
        
        <label>Costo Total:</label>
        <input type="number" name="costo_total" onChange={handleChange} required value={datos.costo_total} min="0" step="0.01" />

        <button type="submit">Registrar Alquiler</button>
      </form>
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default RegistroAlquiler;