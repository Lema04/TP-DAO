
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

      if (response.ok && result.estado === 'ok') {
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
    <div className="login-container form-container">
      <Logo />
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <label>Usuario:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Contraseña:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Ingresar</button>
      </form>
      {error && <p className="mensaje error">{error}</p>}

      {/* BOTÓN REGISTRARME */}
      <div style={{textAlign: 'center', marginTop: '15px'}}>
        <p>¿No tienes cuenta? <Link to="/registrarme">Registrarme</Link></p>
      </div>
    </div>
  );
};

export default Login;