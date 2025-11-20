
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// Permisos: Define qué puede ver cada rol
const PERMISSIONS = {
  supervisor: ['RegistroAlquiler', 'GestionMultas', 'Reportes', 'RegistroCliente', 'RegistrarVehiculo', 'GestionReservas', 'CrearReserva'],
  atencion: ['RegistroAlquiler', 'GestionMultas', 'RegistroCliente', 'RegistrarVehiculo'],
  cliente: ['MisAlquileres', 'MisMultas'], 
  anonimo: []
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (data) => {
      setUser(data); 
      localStorage.setItem('user', JSON.stringify(data));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (componentName) => {
    if (!user || !user.rol) return false;
    
    // Normalizamos el rol a minúsculas para evitar errores de mayúsculas/minúsculas
    const rol = user.rol.toLowerCase();
    
    // DEBUG: Ver qué rol tiene el usuario y qué permiso se pide
    console.log(`[AuthContext] Rol: '${rol}' (Original: '${user.rol}'), Permiso pedido: '${componentName}', Tiene permiso: ${PERMISSIONS[rol]?.includes(componentName)}`);
    
    const userPermissions = PERMISSIONS[rol] || [];
    return userPermissions.includes(componentName);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);