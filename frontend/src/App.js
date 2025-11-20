// /frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RegistroAlquiler from './components/RegistroAlquiler';
import GestionMultas from './components/GestionMultas';
import Reportes from './components/Reportes';
import Login from './components/Login';
import './App.css';
import HomeMenu from './components/HomeMenu';
import HeaderNav from './components/HeaderNav';
import RegistroCliente from './components/RegistroCliente';
import MisAlquileres from './components/MisAlquileres';
import RegistroUsuario from './components/RegistroUsuario';
import MisMultas from './components/MisMultas';
import RegistrarVehiculo from './components/RegistrarVehiculo';
import GestionReservas from './components/GestionReservas';
import CrearReserva from './components/CrearReserva';

// URL BASE de tu API de Flask
const API_BASE_URL = 'http://127.0.0.1:5000'; 

// Componente para proteger las rutas
const ProtectedRoute = ({ children, permissionName }) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (permissionName === 'any') {
      return children; 
  }
  
  if (!hasPermission(permissionName)) {
    return <Navigate to="/home" replace />; 
  }

  return children;
};

function App() { 
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <HeaderNav />

        <main className="App-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
            <Route path="/home" element={
              <ProtectedRoute permissionName="any">
                <HomeMenu /> 
              </ProtectedRoute>
            } />
            <Route path="/registrarme" element={<RegistroUsuario />} />
            
            <Route path="/alquiler" element={
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

            <Route path="/clientes" element={
              <ProtectedRoute permissionName="RegistroCliente">
                <RegistroCliente apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />

            <Route path="/mis-alquileres" element={
              <ProtectedRoute permissionName="MisAlquileres">
                <MisAlquileres apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />

            <Route path="/mis-multas" element={
              <ProtectedRoute permissionName="MisMultas">
                <MisMultas apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />
            
            <Route path="/registrar-vehiculo" element={
              <ProtectedRoute permissionName="RegistrarVehiculo">
                <RegistrarVehiculo apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />

            <Route path="/gestion-reservas" element={
              <ProtectedRoute permissionName="GestionReservas">
                <GestionReservas apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />

            <Route path="/crear-reserva" element={
              <ProtectedRoute permissionName="CrearReserva">
                <CrearReserva apiBaseUrl={API_BASE_URL} />
              </ProtectedRoute>
            } />

            <Route path="*" element={user ? <h1>No tiene permisos para ver esta página.</h1> : <Navigate to="/login" replace />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;