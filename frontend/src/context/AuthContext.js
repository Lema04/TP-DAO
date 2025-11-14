

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// Permisos: Define qué puede ver cada rol
const PERMISSIONS = {
  supervisor: ['RegistroAlquiler', 'GestionMultas', 'Reportes', 'RegistroCliente'],
  atencion: ['RegistroAlquiler', 'GestionMultas', 'RegistroCliente'],
  cliente: ['MisAlquileres', 'MisMultas'], // Un componente para que el cliente vea solo lo suyo
  Anonimo: []
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { rol: 'Gerente', id_usuario: 1 }

  const login = (data) => {
      // data ahora es: { rol: 'cliente', id_cliente: 4, id_empleado: null, ...}
      // Asegúrate de guardar todo en el estado 'user'
      setUser(data); 
      localStorage.setItem('user', JSON.stringify(data));
  };
  const logout = () => {
    setUser(null);
  };

  const hasPermission = (componentName) => {
    const rol = user ? user.rol : 'Anonimo';
    return PERMISSIONS[rol].includes(componentName);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);