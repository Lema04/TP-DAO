import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// Permisos: Define qué puede ver cada rol
const PERMISSIONS = {
  supervisor: ['RegistroAlquiler', 'GestionMultas', 'Reportes', 'GestionClientes', 'RegistrarVehiculo', 'GestionUsuario', 'GestionEmpleados', 'RegistroReserva', 'GestionAlquileres', 'GestionReservas', 'GestionVehiculos', 'GestionMantenimientos', 'RegistroUsuarioEmpleado'],
  atencion: ['RegistroAlquiler', 'GestionMultas', 'GestionClientes', 'RegistrarVehiculo', 'GestionUsuario', 'GestionVehiculos', 'RegistroReserva', 'GestionAlquileres', 'GestionReservas', 'GestionMantenimientos',],
  cliente: ['MisAlquileres', 'MisMultas', 'GestionUsuario'],
  Anonimo: []
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }); // Carga inicial desde localStorage

  const login = (data) => {
    // data ejemplo: { rol: 'cliente', id_cliente: 4, id_empleado: null, ...}
    setUser(data); 
    localStorage.setItem('user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (componentName) => {
    const rol = user ? user.rol : 'Anonimo';
    const permisos = PERMISSIONS[rol] || [];
    return permisos.includes(componentName);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);