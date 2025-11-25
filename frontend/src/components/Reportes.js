// --- /frontend/src/components/Reportes.js ---

import React, { useState, useEffect } from 'react';

const Reportes = ({ apiBaseUrl }) => {
  const [reporteSeleccionado, setReporteSeleccionado] = useState('alquileres_cliente');
  const [idCliente, setIdCliente] = useState('');
  const [clientes, setClientes] = useState([]); // Estado para la lista de clientes
  const [mensaje, setMensaje] = useState('Seleccione un reporte para visualizar.');
  const [esError, setEsError] = useState(false);
  const [frecuencia, setFrecuencia] = useState('M');
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  
  // Estado para guardar el link del último reporte
  const [linkReporte, setLinkReporte] = useState('');

  // Cargar clientes al montar el componente
  // useEffect(() => {
  //   const fetchClientes = async () => {
  //     try {
  //       const response = await fetch(`${apiBaseUrl}/clientes`);
  //       if (!response.ok) {
  //         throw new Error('Error al cargar clientes');
  //       }
  //       const data = await response.json();
  //       setClientes(data);
  //     } catch (error) {
  //       console.error('Error cargando clientes:', error);
  //       setMensaje('Error al cargar la lista de clientes.');
  //       setEsError(true);
  //     }
  //   };

  //   fetchClientes();
  // }, [apiBaseUrl]);

  // Cargar datos iniciales (Clientes y Años)
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // 1. Cargar Clientes
        const resClientes = await fetch(`${apiBaseUrl}/clientes`);
        if (resClientes.ok) {
          setClientes(await resClientes.json());
        } else {
          throw new Error('Error al cargar clientes');
        };

        // 2. Cargar Años Disponibles (NUEVO)
        const resAnios = await fetch(`${apiBaseUrl}/alquileres/anios-disponibles`);
        if (resAnios.ok) {
          const dataAnios = await resAnios.json();
          setAniosDisponibles(dataAnios);
          // Si hay años disponibles, seleccionamos el más reciente por defecto
          if (dataAnios.length > 0) {
            setAnio(dataAnios[0]);
          }
        } else {
          throw new Error('Error al cargar años disponibles');
        }

      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        setMensaje("Error de conexión al cargar filtros.");
        setEsError(true);
      }
    };

    cargarDatosIniciales();
  }, [apiBaseUrl]);

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
          setMensaje('Debe seleccionar un Cliente para este reporte.');
          setEsError(true);
          return;
        }
        fetchReporte(`/reportes/alquileres_por_cliente/${idCliente}`); 
        break;
        
      case 'vehiculos_mas_alquilados':
        fetchReporte('/reportes/vehiculos_mas_alquilados'); 
        break;
        
      case 'facturacion_mensual':
        // Asume el año actual, como en tu backend
        fetchReporte(`/reportes/facturacion_mensual?anio=${anio}`); 
        break;

      case 'alquileres_por_periodo':
        fetchReporte(`/reportes/alquileres_por_periodo?frecuencia=${frecuencia}&anio=${anio}`);
        break;
        
      default:
        setMensaje('Selección inválida.');
        setEsError(true);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Selector de Reportes</h2>
      
      <div className="form-group">
        <label htmlFor="report-select">Seleccionar Reporte:</label>
        <select 
            id="report-select" 
            className="form-select"
            value={reporteSeleccionado} 
            onChange={(e) => setReporteSeleccionado(e.target.value)}
        >
            <option value="alquileres_cliente">Alquileres por Cliente</option>
            <option value="vehiculos_mas_alquilados">Vehículos Más Alquilados</option>
            <option value="facturacion_mensual">Facturación Mensual</option>
            <option value="alquileres_por_periodo">Alquileres por Período</option>
        </select>
      </div>

      {/* Input condicional para el reporte por cliente */}
      {reporteSeleccionado === 'alquileres_cliente' && (
        <div className="form-group">
          <label>Cliente:</label>
          <select 
            className="form-select"
            value={idCliente} 
            onChange={(e) => setIdCliente(e.target.value)} 
          >
            <option value="">Seleccione un Cliente</option>
            {clientes.map(c => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} {c.apellido} (DNI: {c.dni})
              </option>
            ))}
          </select>
        </div>
      )}

      {(reporteSeleccionado === "alquileres_por_periodo" || reporteSeleccionado === "facturacion_mensual") && (
        <>
          {reporteSeleccionado === "alquileres_por_periodo" && (
            <div className='form-group'>
              <label>Frecuencia:</label>
              <select 
                className='form-select' 
                value={frecuencia} 
                onChange={(e) => setFrecuencia(e.target.value)}
              >
                <option value="M">Mensual</option>
                <option value="Q">Trimestral</option>
              </select>
            </div>
          )}

          <div className='form-group'>
            <label>Año:</label>
            <select 
              className='form-select' 
              value={anio} 
              onChange={(e) => setAnio(e.target.value)}
            >
              {aniosDisponibles.length > 0 ? (
                  aniosDisponibles.map(a => (
                      <option key={a} value={a}>{a}</option>
                  ))
              ) : (
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              )}
            </select>
          </div>
        </>
      )}

      <button onClick={handleGenerarReporte} className="btn-primary" style={{marginBottom: '1rem'}}>
        Generar Reporte
      </button>
      
      {/* Mensaje de estado */}
      {mensaje && (
        <div className={esError ? 'error-message' : 'success-message'}>
          {mensaje}
        </div>
      )}

      {/* Link para re-abrir el reporte */}
      {linkReporte && !esError && (
        <div className="reporte-link-container" style={{marginTop: '15px', textAlign: 'center'}}>
          <a href={linkReporte} target="_blank" rel="noopener noreferrer" style={{color: '#cc0000', fontWeight: 'bold'}}>
            Abrir el último reporte generado
          </a>
        </div>
      )}
    </div>
  );
};

export default Reportes;