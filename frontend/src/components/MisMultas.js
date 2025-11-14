// /frontend/src/components/MisMultas.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MisMultas = ({ apiBaseUrl }) => {
  const { user } = useAuth();
  const [multas, setMultas] = useState([]);
  const [mensaje, setMensaje] = useState('Cargando tus multas y daños...');

  useEffect(() => {
    // ⚠️ Importante: El backend DEBE exponer un endpoint GET /multas/por_cliente/<id>
    if (!user || !user.id_cliente) {
      setMensaje('Error: No se encontró ID de cliente asociado a tu cuenta.');
      return;
    }

    const fetchMultas = async () => {
      // Endpoint asumido: GET /multas/por_cliente/<id_cliente>
      const url = `${apiBaseUrl}/multas/<id_cliente>/${user.id_cliente}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.estado === 'ok' && data.data) {
          if (data.data.length > 0) {
              setMultas(data.data);
              setMensaje(`Mostrando ${data.data.length} multas/daños registrados.`);
          } else {
              setMensaje('No tienes multas o daños registrados a tu nombre.');
          }
        } else {
          setMensaje(`Error al cargar: ${data.mensaje || 'Respuesta inválida.'}`);
        }
      } catch (error) {
        setMensaje('Error de conexión con el servidor de multas.');
        console.error('Error al cargar multas del cliente:', error);
      }
    };

    fetchMultas();
  }, [apiBaseUrl, user]);


  // Función auxiliar para renderizar la tabla
  const renderTable = () => {
    if (multas.length === 0) return null;

    // Asumimos un orden de columnas simplificado del backend, ej: 
    // [id_multa, id_alquiler, descripcion, monto, fecha_multa]
    return (
      <table>
        <thead>
          <tr>
            <th>ID Multa</th>
            <th>ID Alquiler</th>
            <th>Descripción</th>
            <th>Monto (USD)</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {multas.map((multa, index) => (
            <tr key={index}>
              <td>{multa[0]}</td>
              <td>{multa[1]}</td>
              <td>{multa[2]}</td>
              <td>${parseFloat(multa[3]).toFixed(2)}</td>
              <td>{multa[4]}</td>
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