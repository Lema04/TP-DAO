// Asumo que crearás los siguientes endpoints en Flask para obtener estos datos:

// GET /reportes/alquileres_por_cliente/<id_cliente>

// GET /reportes/vehiculos_mas_alquilados

// GET /reportes/facturacion_mensual

// /frontend/src/components/Reportes.js

import React, { useState } from 'react';
// Importa una librería de gráficos. Se recomienda 'recharts' o 'chart.js'.
// Por simplicidad, este código solo muestra la estructura y no el gráfico.

const Reportes = ({ apiBaseUrl }) => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState('alquileres_cliente');
  const [datosReporte, setDatosReporte] = useState(null);
  const [idCliente, setIdCliente] = useState('');
  const [mensaje, setMensaje] = useState('Seleccione un reporte para visualizar.');

  const fetchReporte = async (endpoint, params = {}) => {
    setMensaje('Cargando reporte...');
    setDatosReporte(null);
    let url = `${apiBaseUrl}${endpoint}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.estado === 'ok') {
        setDatosReporte(data.data);
        setMensaje(`Reporte cargado: ${Object.keys(data.data).length} resultados.`);
      } else {
        setMensaje(`Error al cargar reporte: ${data.mensaje}`);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor de reportes.');
      console.error('Error en reporte:', error);
    }
  };

  const handleGenerarReporte = () => {
    switch (reporteSeleccionado) {
      case 'alquileres_cliente':
        if (!idCliente) {
          setMensaje('Debe ingresar un ID de Cliente para este reporte.');
          return;
        }
       fetchReporte(`/reportes/alquileres_por_cliente/${idCliente}`); 
        break;
      case 'vehiculos_mas_alquilados':
        fetchReporte('/reportes/vehiculos_mas_alquilados'); 
        break;
      case 'facturacion_mensual':
        // Endpoint que requiere el año, se asume el año actual por defecto
        fetchReporte(`/reportes/facturacion_mensual?anio=${new Date().getFullYear()}`); 
        break;
      default:
        setMensaje('Selección inválida.');
    }
  };

  return (
    <div className="reportes-container">
      <h2>Selector de Reportes</h2>
      
      <label htmlFor="report-select">Seleccionar Reporte:</label>
      <select 
        id="report-select" 
        value={reporteSeleccionado} 
        onChange={(e) => setReporteSeleccionado(e.target.value)}
      >
        <option value="alquileres_cliente">Listado detallado de alquileres por cliente</option>
        <option value="vehiculos_mas_alquilados">Vehículos más alquilados</option>
        <option value="facturacion_mensual">Estadística de facturación mensual (Gráfico)</option>
      </select>

      {/* Input condicional para el reporte por cliente */}
      {reporteSeleccionado === 'alquileres_cliente' && (
        <>
          <label>ID del Cliente:</label>
          <input 
            type="number" 
            value={idCliente} 
            onChange={(e) => setIdCliente(e.target.value)} 
            placeholder="Ingrese ID de Cliente"
          />
        </>
      )}

      <button onClick={handleGenerarReporte}>Generar Reporte</button>
      
      <p className="mensaje">{mensaje}</p>

      {/* Visualización de Datos (Tabla o Gráfico) */}
      {datosReporte && (
        <pre className="reporte-data">
          {JSON.stringify(datosReporte, null, 2)}
        </pre>
      )}

     
    </div>
  );
};

export default Reportes;