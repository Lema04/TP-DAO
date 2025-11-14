// /frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // 
import RegistroAlquiler from './components/RegistroAlquiler';
import GestionMultas from './components/GestionMultas';
import Reportes from './components/Reportes';
import Login from './components/Login';
import Logo from './components/Logo';
import './App.css'; // Importa estilos base
import HomeMenu from './components/HomeMenu';
import HeaderNav from './components/HeaderNav';

// URL BASE de tu API de Flask
const API_BASE_URL = 'http://127.0.0.1:5000'; 
// Componente para proteger las rutas
const ProtectedRoute = ({ children, permissionName }) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    // Si no está logueado, lo redirige al login
    return <Navigate to="/login" replace />;
  }
  if (permissionName === 'any') {
      return children; 
  }
  
  if (!hasPermission(permissionName)) {
    // Si está logueado pero no tiene permisos, lo redirige a la raíz
    return <Navigate to="/home" replace />; 
  }

  return children;
};

function App() { 
  const { user, logout, hasPermission } = useAuth();


  return (
    <Router> {/* El Router debe envolver el contenido principal */}
      <div className="App">
        <HeaderNav />

        <main className="App-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* RUTA DE INICIO (PAGINA PRINCIPAL). Redirige a /login si no está logueado */}
            <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
            {/* RUTA 1: HOME/MENU (DEBE SER PROTEGIDA) */}
            <Route path="/home" element={
              <ProtectedRoute permissionName="any"> {/* 'any' es una permiso simulado para solo requerir login */}
                <HomeMenu /> 
              </ProtectedRoute>
            } />
            {/* Rutas Protegidas por Rol  */}
            <Route path="/alquiler" element={ // cambie la ruta de RegistroAlquiler a /alquiler
                <ProtectedRoute permissionName="RegistroAlquiler">
                    <RegistroAlquiler apiBaseUrl={API_BASE_URL} />
                </ProtectedRoute>
            } />

            <Route path="/gestion" element={
              <ProtectedRoute permissionName="GestionMultas">
                <GestionMultas apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />

            <Route path="/reportes" element={
              <ProtectedRoute permissionName="Reportes">
                <Reportes apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />

            {/* Manejo de rutas no encontradas y redirigir al login si es necesario */}
            <Route path="*" element={user ? <h1>No tiene permisos para ver esta página.</h1> : <Navigate to="/login" replace />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

// <<< Deja solo esta línea de exportación si usaste el nombre 'App' arriba
export default App;