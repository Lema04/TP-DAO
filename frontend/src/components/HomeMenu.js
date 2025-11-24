import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUsers, FaCar, FaClipboardList, FaMoneyBillWave, 
  FaFileAlt, FaUserCog, FaUserTie, 
  FaBookmark,
  FaWrench
} from "react-icons/fa";

const HomeMenu = () => {
  const { hasPermission } = useAuth();

  const opciones = [
    { permiso: "GestionUsuario", ruta: "/usuario", texto: "Gestión de Usuario", icono: <FaUserCog /> },
    { permiso: "GestionEmpleados", ruta: "/empleado", texto: "Gestión de Empleados", icono: <FaUserTie /> },
    { permiso: "GestionClientes", ruta: "/clientes", texto: "Gestión de Clientes", icono: <FaUsers /> },
    { permiso: "GestionVehiculos", ruta: "/vehiculos", texto: "Gestión de Vehículos", icono: <FaCar /> },
    { permiso: "GestionReservas", ruta: "/reservas", texto: "Gestión de Reservas", icono: <FaBookmark />},
    { permiso: "GestionAlquileres", ruta: "/alquiler", texto: "Gestión de Alquileres", icono: <FaClipboardList /> },
    { permiso: "GestionMantenimientos", ruta: "/mantenimientos", texto: "Gestión de Mantenimientos", icono: <FaWrench />},
    { permiso: "MisAlquileres", ruta: "/mis-alquileres", texto: "Mis Alquileres", icono: <FaClipboardList /> },
    { permiso: "GestionMultas", ruta: "/gestion", texto: "Gestión de Multas y Daños", icono: <FaMoneyBillWave /> },
    { permiso: "MisMultas", ruta: "/mis-multas", texto: "Mis Multas", icono: <FaMoneyBillWave /> },
    { permiso: "Reportes", ruta: "/reportes", texto: "Gestión de Reportes", icono: <FaFileAlt /> },
  ];

  return (
    <div className="home-container">
      <h1 className="main-title">Panel de Operaciones</h1>
      <hr className="header-separator" />

      <div className="dashboard-grid">
        {opciones
          .filter(op => hasPermission(op.permiso))
          .map((op, idx) => (
            <Link key={idx} to={op.ruta} className="dashboard-card">
              <div className="icon">{op.icono}</div>
              <span>{op.texto}</span>
            </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeMenu;