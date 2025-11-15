
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:5000'; 

const RegistroUsuario = () => {
  const navigate = useNavigate();
  const [datosRegistro, setDatosRegistro] = useState({
    nombre_usuario: '',
    contraseña: '',
    rol: 'cliente' // Asumimos rol 'cliente' por defecto para el auto-registro
  });
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  const handleChange = (e) => {
    setDatosRegistro({ ...datosRegistro, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('Registrando usuario...');
    setEsError(false);

    // Llama al endpoint POST /usuarios
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosRegistro),
      });

      const result = await response.json();

      if (result.status === 200) {
        setMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setDatosRegistro({ nombre_usuario: '', contraseña: '', rol: 'cliente' });
        // Redirigir al login después de 2 segundos
        setTimeout(() => navigate('/login'), 2000); 
      } else {
        setMensaje(`Error: ${result.mensaje}`);
        setEsError(true);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor.');
      setEsError(true);
      console.error('Error al registrar usuario:', error);
    }
  };

  return (
    <div className="login-container form-container">
      <h2>Registrar Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre de Usuario:</label>
        <input type="text" name="nombre_usuario" onChange={handleChange} required value={datosRegistro.nombre_usuario} />

        <label>Contraseña:</label>
        <input type="password" name="contraseña" onChange={handleChange} required value={datosRegistro.contraseña} />
        
        {/* Nota: el campo rol se envía oculto o se define en el backend */}
        
        <button type="submit">Crear Cuenta</button>
      </form>
      {mensaje && <p className={`mensaje ${esError ? 'error' : ''}`}>{mensaje}</p>}
      <button type="button" onClick={() => navigate('/login')} style={{marginTop: '20px'}}>Volver al Login</button>
    </div>
  );
};

export default RegistroUsuario;