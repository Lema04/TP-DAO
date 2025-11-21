// --- /frontend/src/components/MisMultas.js (¡ARREGLADO!) ---

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MisMultas = ({ apiBaseUrl }) => {
  const { user } = useAuth();
  const [multas, setMultas] = useState([]); // Iniciar con array vacío
  const [mensaje, setMensaje] = useState('Cargando tus multas y daños...');

  useEffect(() => {
    if (!user || !user.id_cliente) {
      setMensaje('Error: No se encontró ID de cliente asociado a tu cuenta.');
      return;
    }

    const fetchMultas = async () => {
      // --- CAMBIO 1: URL del Endpoint ---
      // Tu app.py refactorizado espera un query param
      const url = `${apiBaseUrl}/multas?id_cliente=${user.id_cliente}`;

      try {
        const response = await fetch(url);
        const data = await response.json(); // Leer el JSON (sea éxito o error)

        // --- CAMBIO 2: Lógica de Fetch (Estilo POO) ---
        if (!response.ok) {
          // El backend envió un 4xx o 5xx. 'data' es {"error": "..."}
          throw new Error(data.error || `Error ${response.status}`);
        }

        // Éxito: 'data' es el array de objetos Multa: [ {multa1}, {multa2}, ... ]
        if (data && data.length > 0) {
          setMultas(data); // Guardamos el array de objetos directamente
          setMensaje(`Mostrando ${data.length} multas/daños registrados.`);
        } else {
          // Éxito, pero el array está vacío
          setMensaje('No tienes multas o daños registrados a tu nombre.');
        }
      } catch (error) {
        // Captura el 'throw new Error' o un error de red
        setMensaje(`Error al cargar: ${error.message}`);
        console.error('Error al cargar multas del cliente:', error);
      }
    };

    fetchMultas();
  }, [apiBaseUrl, user]);

  // --- CAMBIO 3: Lógica de Renderizado (Objetos) ---
  const renderTable = () => {
    // 'multas' es un array de objetos, .length es seguro
    if (multas.length === 0) return null;

    return (
      <table className="styled-table" 
        style={{ width: '100%', 
        borderCollapse: 'collapse', 
        fontSize: '0.95rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
        <thead>
          <tr style={{ backgroundColor: '#cc0000', color: 'white', textAlign: 'center'}}>
            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>ID Alquiler</th>
            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Vehículo</th>
            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Descripción</th>
            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Monto</th>
            <th style={{ padding: '0.75rem', borderBottom: '2px solid #990000', textAlign: 'center' }}>Fecha Incidente</th>
          </tr>
        </thead>
        <tbody>
          {multas.map((multa, idx) => (
            // Usamos la propiedad .id_multa como key
            <tr key={multa.id_multa} 
            style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9', 
            borderBottom: '1px solid #e0e0e0', 
            textAlign: 'center' 
            }}>
              {/* Accedemos al objeto ANIDADO 'alquiler' */}
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{multa.alquiler.id_alquiler}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{multa.alquiler.vehiculo.patente}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{multa.descripcion}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>${parseFloat(multa.monto).toFixed(2)}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{new Date(multa.fecha_incidente).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="reportes-container form-container">
      <h2>Mis Multas y Daños Pendientes</h2>
      <p className="mensaje">{mensaje}</p>
      {renderTable()}
    </div>
  );
};

export default MisMultas;