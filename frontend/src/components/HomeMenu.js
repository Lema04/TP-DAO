import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeMenu = () => {
  const { hasPermission } = useAuth();

  return (
    <div className="form-card">
      <h2 className="form-title">Panel de Operaciones</h2>

      {hasPermission('GestionClientes') && (
        <Link to="/clientes" className="menu-button">Gestión de Clientes</Link>
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
        <Link to="/reportes" className="menu-button">Gestión de Reportes Estratégicos</Link>
      )}
      {hasPermission('GestionUsuario') && (
        <Link to="/usuario" className="menu-button">Gestión de Usuario</Link>
      )}
      {hasPermission('GestionEmpleados') && (
        <Link to="/empleado" className="menu-button">Gestión de Empleados</Link>  
      )}
    </div>
  );
};

export default HomeMenu;