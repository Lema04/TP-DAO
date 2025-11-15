// --- /frontend/src/components/RegistroAlquiler.js (¡ARREGLADO!) ---

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
  const [esError, setEsError] = useState(false);

  // --- CAMBIO 1: Lógica de Fetch (Dropdowns) ---
  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json(); // Leer JSON (éxito o error)

        if (!response.ok) {
          throw new Error(data.error || `Error cargando ${endpoint}`);
        }
        
        // Éxito: 'data' ES el array de objetos [ {obj1}, {obj2}, ... ]
        setter(data); // Guardamos el array de objetos
        
      } catch (error) {
        console.error(`Error cargando ${endpoint}:`, error);
        setMensaje(`Error cargando ${endpoint}: ${error.message}`);
        setEsError(true);
      }
    };

    fetchData('vehiculos', setVehiculos);
    fetchData('clientes', setClientes);
    fetchData('empleados', setEmpleados);
  }, [apiBaseUrl]);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  // --- CAMBIO 3: Lógica de Submit (Crear) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Procesando alquiler...');
    setEsError(false);

    try {
      const response = await fetch(`${apiBaseUrl}/alquileres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });

      const result = await response.json(); // Leer JSON (éxito o error)

      if (!response.ok) {
        // El backend envió 4xx o 5xx. 'result' es {"error": "..."}
        throw new Error(result.error || `Error ${response.status}`);
      }
      
      // Éxito (201 Created): 'result' es el objeto Alquiler completo
      setMensaje(`¡Alquiler registrado con ID: ${result.id_alquiler}!`);
      // Limpiamos el formulario
      setDatos({
        id_cliente: '', patente: '', id_empleado: '',
        fecha_inicio: '', fecha_fin: '', costo_total: 0.0
      });

    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error al registrar alquiler:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Registro de Nuevo Alquiler</h2>
      <form onSubmit={handleSubmit}>
        
        {/* --- CAMBIO 2: Renderizado de Dropdowns (Objetos) --- */}
        
        <label>Cliente:</label>
        <select name="id_cliente" onChange={handleChange} required value={datos.id_cliente}>
          <option value="">Seleccione Cliente</option>
          {/* 'clientes' es un array de OBJETOS */}
          {clientes.map(c => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre} {c.apellido} (DNI: {c.dni})
            </option>
          ))}
        </select>
        
        <label>Empleado:</label>
        <select name="id_empleado" onChange={handleChange} required value={datos.id_empleado}>
          <option value="">Seleccione Empleado</option>
          {/* 'empleados' es un array de OBJETOS */}
          {empleados.map(e => (
            <option key={e.id_empleado} value={e.id_empleado}>
              {e.nombre} {e.apellido} (Rol: {e.puesto})
            </option>
          ))}
        </select>

        <label>Vehículo (Patente):</label>
        <select name="patente" onChange={handleChange} required value={datos.patente}>
          <option value="">Seleccione Vehículo Disponible</option>
          {/* 'vehiculos' es un array de OBJETOS */}
          {vehiculos
            .filter(v => v.estado.toLowerCase() === 'disponible') // Acceso por propiedad
            .map(v => (
              <option key={v.patente} value={v.patente}>
                {v.marca} {v.modelo} ({v.patente})
              </option>
            ))}
        </select>

        <label>Fecha Inicio:</label>
        <input type="date" name="fecha_inicio" onChange={handleChange} required value={datos.fecha_inicio} />

        <label>Fecha Fin:</label>
        <input type="date" name="fecha_fin" onChange={handleChange} required value={datos.fecha_fin} />
        
        <label>Costo Total:</label>
        <input type="number" name="costo_total" onChange={handleChange} required value={datos.costo_total} min="0" step="0.01" />

        <button type="submit">Registrar Alquiler</button>
      </form>
      {/* Mensaje de éxito o error */}
      {mensaje && <p className={`mensaje ${esError ? 'error' : 'success'}`}>{mensaje}</p>}
    </div>
  );
};

export default RegistroAlquiler;