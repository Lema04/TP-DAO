import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeMenu = () => {
  const { hasPermission } = useAuth();

  return (
    <div className="form-card">
      <h2 className="form-title">Panel de Operaciones</h2>
      {/* Usamos /alquiler, /gestion, y /reportes */}
      {hasPermission('RegistroCliente') && (
        <Link to="/clientes" className="menu-button">Registrar Nuevo Cliente</Link>
      )}
      {hasPermission('RegistrarVehiculo') && (
        <Link to="/registrar-vehiculo" className="menu-button">Registrar Nuevo Vehículo</Link>
      )}
      {hasPermission('MisAlquileres') && (
        <Link to="/mis-alquileres" className="menu-button">Ver Mis Alquileres</Link>
      )}
      {hasPermission('MisMultas') && (
        <Link to="/mis-multas" className="menu-button">Ver Mis Multas</Link> 
      )}
      {hasPermission('RegistroAlquiler') && (
        <Link to="/alquiler" className="menu-button">Registrar Nuevo Alquiler</Link>
      )}
      {hasPermission('GestionMultas') && (
        <Link to="/gestion" className="menu-button">Gestión de Multas y Daños</Link>
      )}
      {hasPermission('Reportes') && (
        <Link to="/reportes" className="menu-button">Ver Reportes Estratégicos</Link>
      )}
      
    </div>
  );
};

export default HomeMenu;