// --- /frontend/src/components/Login.js ---

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './Logo';

const API_BASE_URL = 'http://127.0.0.1:5000'; 

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario: username, contraseña: password }),
      });

      const result = await response.json();

      if (response.status === 200) {
        login(result);
        navigate('/home'); 
      } else {
        setError(result.mensaje || 'Credenciales inválidas. Intente de nuevo.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Revise el backend.');
    }
  };

  return (
    <div className="form-card">
      <Logo />
      <h2 className="form-title">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="form-container-inner">
        <div className="form-group">
            <label>Usuario:</label>
            <input className="form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>

        <div className="form-group">
            <label>Contraseña:</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="btn-primary">Ingresar</button>
      </form>
      
      {error && <div className="error-message">{error}</div>}

      {/* BOTÓN REGISTRARME */}
      <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
        <p style={{color: '#718096'}}>¿No tienes cuenta? <Link to="/registrarme" style={{color: '#cc0000', fontWeight: 'bold'}}>Registrarme</Link></p>
      </div>
    </div>
  );
};

export default Login;