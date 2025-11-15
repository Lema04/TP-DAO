// --- /frontend/src/components/RegistroAlquiler.js (¡CON VALIDACIÓN DE FECHA!) ---

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
  // ... (tus otros estados: vehiculos, clientes, empleados, mensaje, esError)
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  // --- ¡NUEVO! OBTENER FECHA DE HOY ---
  // Obtenemos la fecha de "hoy" en formato YYYY-MM-DD,
  // que es el formato que el atributo 'min' del input[type=date] espera.
  const hoy = new Date().toISOString().split('T')[0];
  // ------------------------------------

  // ... (tu useEffect para cargar los dropdowns está perfecto) ...
  useEffect(() => {
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/${endpoint}`);
        const data = await response.json(); 
        if (!response.ok) {
          throw new Error(data.error || `Error cargando ${endpoint}`);
        }
        setter(data);
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

  // ... (tu handleSubmit refactorizado está perfecto) ...
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

      const result = await response.json();
      if (!response.ok) {
        // ¡Esto ahora capturará el "ValueError" de tu backend!
        // Ej: "Error: Las fechas de inicio y fin no pueden ser anteriores a hoy."
        throw new Error(result.error || `Error ${response.status}`);
      }
      
      setMensaje(`¡Alquiler registrado con ID: ${result.id_alquiler}!`);
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
        
        {/* ... (Tus <select> para cliente, empleado y vehiculo están perfectos) ... */}
        
        <label>Cliente:</label>
        <select name="id_cliente" onChange={handleChange} required value={datos.id_cliente}>
          <option value="">Seleccione Cliente</option>
          {clientes.map(c => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre} {c.apellido} (DNI: {c.dni})
            </option>
          ))}
        </select>
        
        <label>Empleado:</label>
        <select name="id_empleado" onChange={handleChange} required value={datos.id_empleado}>
           <option value="">Seleccione Empleado</option>
           {empleados.map(e => (
             <option key={e.id_empleado} value={e.id_empleado}>
               {e.nombre} {e.apellido} (Rol: {e.puesto})
             </option>
           ))}
        </select>

        <label>Vehículo (Patente):</label>
        <select name="patente" onChange={handleChange} required value={datos.patente}>
          <option value="">Seleccione Vehículo Disponible</option>
          {vehiculos
            .filter(v => v.estado.toLowerCase() === 'disponible')
            .map(v => (
              <option key={v.patente} value={v.patente}>
                {v.marca} {v.modelo} ({v.patente})
              </option>
            ))}
        </select>

        {/* --- ¡CAMBIO: VALIDACIÓN DE FECHA EN FRONTEND! --- */}
        <label>Fecha Inicio:</label>
        <input 
          type="date" 
          name="fecha_inicio" 
          onChange={handleChange} 
          required 
          value={datos.fecha_inicio}
          min={hoy} 
        />

        <label>Fecha Fin:</label>
        <input 
          type="date" 
          name="fecha_fin" 
          onChange={handleChange} 
          required 
          value={datos.fecha_fin}
          min={datos.fecha_inicio || hoy} 
        />
        {/* ------------------------------------- */}
        
        <label>Costo Total:</label>
        <input type="number" name="costo_total" onChange={handleChange} required value={datos.costo_total} min="0" step="0.01" />

        <button type="submit">Registrar Alquiler</button>
      </form>
      {mensaje && <p className={`mensaje ${esError ? 'error' : 'success'}`}>{mensaje}</p>}
    </div>
  );
};

export default RegistroAlquiler;