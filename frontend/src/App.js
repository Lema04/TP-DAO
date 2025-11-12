// /frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // 
import RegistroAlquiler from './components/RegistroAlquiler';
import GestionMultas from './components/GestionMultas';
import Reportes from './components/Reportes';
import Login from './components/Login';
import Logo from './components/Logo';
import './App.css'; // Importa estilos base

// URL BASE de tu API de Flask
const API_BASE_URL = 'http://127.0.0.1:5000'; // Asegúrate de que Flask corra en este puerto
// Componente para proteger las rutas
const ProtectedRoute = ({ children, permissionName }) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    // Si no está logueado, lo redirige al login
    return <Navigate to="/login" replace />;
  }
  
  if (!hasPermission(permissionName)) {
    // Si está logueado pero no tiene permisos, lo redirige a la raíz
    return <Navigate to="/" replace />; 
  }

  return children;
};

function App() { 
  const { user, logout, hasPermission } = useAuth();

  return (
    <Router> {/* El Router debe envolver el contenido principal */}
      <div className="App">
        <header className="App-header">
          <Logo />
          <nav className="App-nav">
            {/* Navegación Condicional */}
            {user ? (
              <>
                {hasPermission('RegistroAlquiler') && <Link to="/">Registrar Alquiler</Link>}
                {hasPermission('GestionMultas') && <Link to="/gestion">Gestión de Multas</Link>}
                {hasPermission('Reportes') && <Link to="/reportes">Reportes Estratégicos</Link>}
                <span className="user-info">Hola, {user.rol}</span>
                <button onClick={logout} className="logout-button">Salir</button>
              </>
            ) : (
              <Link to="/login">Ingresar</Link>
            )}
          </nav>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Rutas Protegidas por Rol */}
            <Route path="/" element={
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