// --- /frontend/src/components/Reportes.js ---

import React, { useState } from 'react';

const Reportes = ({ apiBaseUrl }) => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState('alquileres_cliente');
  const [idCliente, setIdCliente] = useState('');
  const [mensaje, setMensaje] = useState('Seleccione un reporte para visualizar.');
  const [esError, setEsError] = useState(false);
  
  // Estado para guardar el link del último reporte
  const [linkReporte, setLinkReporte] = useState('');

  // Función para manejar el "fetch"
  const fetchReporte = async (endpoint) => {
    setMensaje('Generando reporte...');
    setEsError(false);
    setLinkReporte(''); // Limpiamos el link anterior
    
    const url = `${apiBaseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json(); // Leemos JSON (sea éxito o error)

      // Manejo de errores POO
      if (!response.ok) {
        // El backend envió 4xx/5xx. 'data' es {"error": "..."}
        throw new Error(data.error || `Error ${response.status}`);
      }

      // Éxito: 'data' es {"mensaje": "...", "ruta_archivo": "static/reportes/..."}
      
      setMensaje(data.mensaje || "Reporte generado con éxito.");
      setEsError(false);
      
      // ==========================================
      // ¡alquileres por vehiculo usaba ruta_archivo, pero vehiculos mas alquilados usaba path entonces habia conflictos
      // ==========================================
      const key = data.ruta_archivo ? "ruta_archivo" : "path";
      const urlReporte = `${apiBaseUrl}/${data[key]}`;
      setLinkReporte(urlReporte); 

      // Abrir el PDF en una nueva pestaña
      window.open(urlReporte, '_blank');
      
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
      setEsError(true);
      console.error('Error en reporte:', error);
    }
  };

  // Función que decide qué reporte llamar
  const handleGenerarReporte = () => {
    switch (reporteSeleccionado) {
      case 'alquileres_cliente':
        if (!idCliente) {
          setMensaje('Debe ingresar un ID de Cliente para este reporte.');
          setEsError(true);
          return;
        }
        fetchReporte(`/reportes/cliente/${idCliente}`); 
        break;
        
      case 'vehiculos_mas_alquilados':
        fetchReporte('/reportes/vehiculos_mas_alquilados'); 
        break;
        
      case 'facturacion_mensual':
        // Asume el año actual, como en tu backend
        fetchReporte(`/reportes/facturacion_mensual?anio=${new Date().getFullYear()}`); 
        break;
        
      default:
        setMensaje('Selección inválida.');
        setEsError(true);
    }
  };

  return (
    <div className="reportes-container form-container">
      <h2>Selector de Reportes</h2>
      
      <label htmlFor="report-select">Seleccionar Reporte:</label>
      <select 
        id="report-select" 
        value={reporteSeleccionado} 
        onChange={(e) => setReporteSeleccionado(e.target.value)}
      >
        <option value="alquileres_cliente">Alquileres por Cliente</option>
        <option value="vehiculos_mas_alquilados">Vehículos Más Alquilados</option>
        <option value="facturacion_mensual">Facturación Mensual</option>
      </select>

      {/* Input condicional para el reporte por cliente */}
      {reporteSeleccionado === 'alquileres_cliente' && (
        <div className="form-group" style={{marginTop: '15px'}}>
          <label>ID del Cliente:</label>
          <input 
            type="number" 
            value={idCliente} 
            onChange={(e) => setIdCliente(e.target.value)} 
            placeholder="Ingrese ID"
          />
        </div>
      )}

      <button onClick={handleGenerarReporte} style={{marginTop: '20px'}}>
        Generar Reporte
      </button>
      
      {/* Mensaje de estado */}
      {mensaje && (
        <p className={`mensaje ${esError ? 'error' : 'success'}`}>
          {mensaje}
        </p>
      )}

      {/* Link para re-abrir el reporte */}
      {linkReporte && !esError && (
        <div className="reporte-link-container" style={{marginTop: '15px'}}>
          <a href={linkReporte} target="_blank" rel="noopener noreferrer">
            Abrir el último reporte generado
          </a>
        </div>
      )}
    </div>
  );
};

export default Reportes;