
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MisAlquileres = ({ apiBaseUrl }) => {
  const { user } = useAuth();
  const [alquileres, setAlquileres] = useState([]);
  const [mensaje, setMensaje] = useState('Cargando tus alquileres...');

  useEffect(() => {
    // Aseguramos que el usuario esté logueado y tenga un id_cliente asociado
    if (!user || !user.id_cliente) {
      setMensaje('Error: No se encontró ID de cliente asociado a tu cuenta.');
      return;
    }

    const fetchAlquileres = async () => {
      // Llama al endpoint GET /reportes/alquileres_por_cliente/<id_cliente> 
      // o un endpoint similar filtrado por el backend
      const url = `${apiBaseUrl}/alquileres?id_cliente=${user.id_cliente}`;
      console.log(url)
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.estado === 'ok' && data.data && data.data.length > 0) {
          setAlquileres(data.data);
          setMensaje(`Mostrando ${data.data.length} alquileres.`);
        } else if (data.estado === 'ok' && data.data.length === 0) {
          setMensaje('No tienes alquileres registrados en este momento.');
        } else {
          setMensaje(`Error al cargar: ${data.mensaje || 'Respuesta inválida.'}`);
        }
      } catch (error) {
        setMensaje('Error de conexión con el servidor de alquileres.');
        console.error('Error al cargar alquileres del cliente:', error);
      }
    };

    fetchAlquileres();
  }, [apiBaseUrl, user]);


  // Función auxiliar para renderizar la tabla (asumiendo que los datos vienen como arrays de arrays)
  const renderTable = () => {
    if (alquileres.length === 0) return null;

    // Asumimos un orden de columnas simplificado del backend, ej: 
    // [id_alquiler, fecha_inicio, fecha_fin, patente, costo_total]
    return (
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Patente</th>
            <th>Costo Total</th>
          </tr>
        </thead>
        <tbody>
          {alquileres.map((alquiler, index) => (
            <tr key={index}>
              <td>{alquiler[0]}</td>
              <td>{alquiler[1]}</td>
              <td>{alquiler[2]}</td>
              <td>{alquiler[3]}</td>
              <td>${parseFloat(alquiler[4]).toFixed(2)}</td>
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