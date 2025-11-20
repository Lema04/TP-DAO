// --- /frontend/src/components/RegistroUsuario.js ---

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:5000'; 

const RegistroUsuario = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    dni: '',
    nombre_usuario: '',
    contraseña: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setEsError(false);

    try {
      // PASO 1: Buscar si el cliente existe por DNI
      const resBusqueda = await fetch(`${API_BASE_URL}/clientes?buscar=${formData.dni}`);
      const clientesEncontrados = await resBusqueda.json();

      if (!resBusqueda.ok) {
        throw new Error('Error al verificar el DNI.');
      }

      // Filtramos para asegurar coincidencia exacta de DNI (la búsqueda puede ser parcial)
      const cliente = clientesEncontrados.find(c => c.dni === formData.dni);

      if (!cliente) {
        throw new Error('No se encontró un cliente registrado con este DNI. Por favor, acérquese a una sucursal para darse de alta como cliente antes de crear su usuario web.');
      }

      setClienteEncontrado(cliente);

      // PASO 2: Crear el Usuario vinculado al Cliente encontrado
      const resUsuario = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre_usuario: formData.nombre_usuario,
            contraseña: formData.contraseña,
            rol: 'cliente',
            id_cliente: cliente.id_cliente // ¡Vinculación con el cliente existente!
        }),
      });

      const dataUsuario = await resUsuario.json();

      if (!resUsuario.ok) {
        throw new Error(dataUsuario.error || 'Error al crear el usuario. Es posible que el nombre de usuario ya esté en uso.');
      }

      // Éxito total
      setShowModal(true);
      
    } catch (error) {
      setMensaje(error.message);
      setEsError(true);
      // console.error('Error en el registro:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/login');
  };

  return (
    <div className="form-card" style={{ maxWidth: '500px' }}>
      <h2 className="form-title">Crear Usuario Web</h2>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
        Si ya eres cliente de nuestra agencia, ingresa tu DNI para crear tu cuenta de acceso.
      </p>
      
      {mensaje && <div className={esError ? 'error-message' : 'success-message'}>{mensaje}</div>}

      <form onSubmit={handleSubmit} className="form-container-inner">
        
        <div className="form-group">
            <label>DNI (Cliente Registrado):</label>
            <input 
                className="form-input" 
                type="text" 
                name="dni" 
                onChange={handleChange} 
                required 
                value={formData.dni} 
                placeholder="Ingrese su DNI sin puntos"
            />
        </div>

        <div className="form-group">
            <label>Nombre de Usuario Deseado:</label>
            <input className="form-input" type="text" name="nombre_usuario" onChange={handleChange} required value={formData.nombre_usuario} />
        </div>

        <div className="form-group">
            <label>Contraseña:</label>
            <input className="form-input" type="password" name="contraseña" onChange={handleChange} required value={formData.contraseña} />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Crear Cuenta</button>
      </form>

      <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
        Volver al Login
      </button>

      {/* MODAL DE ÉXITO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">🎉</span>
            <h3>¡Cuenta Creada!</h3>
            <p>Hola <strong>{clienteEncontrado?.nombre}</strong>, tu usuario ha sido vinculado exitosamente.</p>
            <p>Ya puedes iniciar sesión.</p>
            <button className="modal-close-btn" onClick={closeModal}>
              Ir al Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistroUsuario;