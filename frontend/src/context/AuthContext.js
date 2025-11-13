

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// Permisos: Define qué puede ver cada rol
const PERMISSIONS = {
  supervisor: ['RegistroAlquiler', 'GestionMultas', 'Reportes'],
  atencion: ['RegistroAlquiler', 'GestionMultas'],
  cliente: ['MisAlquileres'], // Un componente para que el cliente vea solo lo suyo
  Anonimo: []
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { rol: 'Gerente', id_usuario: 1 }

  const login = (userData) => {
    // Almacenamos rol e id del usuario
    setUser({ rol: userData.rol, id_usuario: userData.id_usuario });
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (componentName) => {
    const rol = user ? user.rol : 'Anonimo';
    console.log(`Verificando permiso para rol: ${rol} en componente: ${componentName}`)
    return PERMISSIONS[rol].includes(componentName);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);