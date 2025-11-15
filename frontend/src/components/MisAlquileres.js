import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// (Asumo que tienes un CSS para esto)
// import './MisAlquileres.css'; 

const MisAlquileres = ({ apiBaseUrl }) => {
  const { user } = useAuth();
  const [alquileres, setAlquileres] = useState([]); // El estado inicial es un array vacío []
  const [mensaje, setMensaje] = useState('Cargando tus alquileres...');

  useEffect(() => {
    if (!user || !user.id_cliente) {
      setMensaje('Error: No se encontró ID de cliente asociado a tu cuenta.');
      return;
    }

    const fetchAlquileres = async () => {
      const url = `${apiBaseUrl}/alquileres?id_cliente=${user.id_cliente}`;
      
      try {
        const response = await fetch(url);

        // --- ¡LÓGICA DE MANEJO DE ERRORES REFACTORIZADA! ---
        
        // Primero, leemos el JSON. Siempre habrá un JSON (de éxito o de error)
        const data = await response.json();

        // Chequeamos si la respuesta HTTP *no* fue exitosa (4xx, 5xx)
        if (!response.ok) {
          // El backend refactorizado envía {"error": "..."}
          // Usamos 'data.error' o un mensaje genérico
          throw new Error(data.error || `Error ${response.status} del servidor.`);
        }

        // --- LÓGICA DE ÉXITO (response.ok fue true) ---
        
        // 'data' es la lista de alquileres: [ {alq1}, {alq2}, ... ]
        if (data && data.length > 0) {
          // ¡ARREGLO! Guardamos 'data' (el array) directamente.
          setAlquileres(data); 
          setMensaje(`Mostrando ${data.length} alquileres.`);
        } else {
          // El backend devolvió un 200 OK con una lista vacía []
          setMensaje('No tienes alquileres registrados en este momento.');
        }
      } catch (error) {
        // Este 'catch' ahora recibe los errores del 'throw new Error'
        setMensaje(`Error al cargar: ${error.message}`);
        console.error('Error al cargar alquileres del cliente:', error);
      }
    };

    fetchAlquileres();
  }, [apiBaseUrl, user]);


  // --- ¡RENDERIZADO DE OBJETOS REFACTORIZADO! ---
  const renderTable = () => {
    // 'alquileres' ahora es un array de OBJETOS (o un array vacío), 
    // nunca 'undefined', por lo que .length es seguro.
    if (alquileres.length === 0) return null;

return (
      <table className="styled-table"> {/* 👈 AÑADIMOS LA CLASE PRINCIPAL */}
        <thead>
          <tr>
            <th>ID Alquiler</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Vehículo</th>
            <th>Patente</th>
            <th className="text-right">Costo Total</th> {/* 👈 ALINEAMOS NÚMEROS */}
          </tr>
        </thead>
        <tbody>
          {alquileres.map((alquiler) => (
            <tr key={alquiler.id_alquiler}>
              <td>{alquiler.id_alquiler}</td>
              <td>{new Date(alquiler.fecha_inicio).toLocaleDateString()}</td>
              <td>{new Date(alquiler.fecha_fin).toLocaleDateString()}</td>
              <td>{alquiler.vehiculo.marca} {alquiler.vehiculo.modelo}</td>
              <td>{alquiler.vehiculo.patente}</td>
              <td className="text-right">${parseFloat(alquiler.costo_total).toFixed(2)}</td> {/* 👈 ALINEAMOS NÚMEROS */}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="reportes-container form-container">
      <h2>Mis Alquileres Registrados</h2>
      <p className="mensaje">{mensaje}</p>
      {renderTable()}
    </div>
  );
};

export default MisAlquileres;

