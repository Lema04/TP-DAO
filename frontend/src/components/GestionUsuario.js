import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
// 1. FIX: Uso correcto del hook de autenticación
import { useAuth } from "../context/AuthContext"; 

const GestionUsuario = ({ apiBaseUrl, empleadoPreseleccionado, onClose }) => {
  // Consumo del contexto
  const { token, user } = useAuth(); 
  const navigate = useNavigate();

  const [modo, setModo] = useState("crear");
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    rol: "atencion", // Valor inicial corregido a 'atencion' (empleado estándar)
    id_empleado: "",
    id_cliente: ""
  });

  const mostrarMensaje = (texto, error = false) => {
    setMensaje(texto);
    setEsError(error);
    setTimeout(() => {
      setMensaje("");
      setEsError(false);
    }, 5000);
  };

  // 2. FIX: Lógica de inicialización (Priorizar empleado sobre el usuario logueado)
  useEffect(() => {
    if (empleadoPreseleccionado) {
      setModo("crear");
      setForm({
        username: "", 
        password: "123456", 
        email: "", 
        // 3. FIX: Rol corregido a valores del Backend
        rol: empleadoPreseleccionado.puesto === "Supervisor" ? "supervisor" : "atencion", 
        id_empleado: empleadoPreseleccionado.id_empleado,
        id_cliente: ""
      });
      return;
    }

    if (!empleadoPreseleccionado && user && !onClose) {
      setModo("editar");
      setForm({
        username: user.sub || "", 
        password: "",
        email: user.email || "",
        rol: user.rol || "atencion",
        id_empleado: user.id_empleado || "",
        id_cliente: user.id_cliente || ""
      });
    }
  }, [empleadoPreseleccionado, user, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.username || !form.email) {
      mostrarMensaje("Usuario y Email son obligatorios", true);
      return;
    }
    if (modo === "crear" && !form.password) {
      mostrarMensaje("La contraseña es obligatoria para nuevos usuarios", true);
      return;
    }

    // 4. FIX: Mapeo de claves de Frontend a Backend
    const datosParaEnviar = {
      nombre_usuario: form.username, // Mapeo crítico
      contraseña: form.password,     // Mapeo crítico
      email: form.email,
      rol: form.rol,
      id_empleado: form.id_empleado || null,
      id_cliente: form.id_cliente || null
    };

    try {
      if (modo === "editar" && !datosParaEnviar.contraseña) {
         delete datosParaEnviar.contraseña;
      }

      const endpoint = modo === "crear" ? "/usuarios" : `/usuarios/${user.id_usuario}`; 
      const method = modo === "crear" ? "POST" : "PUT";

      const res = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosParaEnviar)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error en la operación");

      mostrarMensaje(
        modo === "crear" 
          ? `Usuario creado con éxito para el empleado ID ${form.id_empleado}` 
          : "Usuario actualizado correctamente"
      );

      setForm(prevForm => ({ ...prevForm, password: "" }));
      
      if (onClose && modo === "crear") {
          setTimeout(() => { onClose(); }, 2000); 
      }

    } catch (err) {
      mostrarMensaje(err.message, true);
    }
  };

  return (
    <div className="form-container-inner-shadow" style={{ padding: '20px', backgroundColor: '#fff' }}>
      <div className="form-header-row">
        <h3 className="form-subtitle-black">
          {modo === "crear" 
            ? `Crear Usuario para Empleado #${form.id_empleado || "?"}` 
            : "Mis Datos de Usuario"}
        </h3>
        {onClose && (
            <button type="button" className="btn-delete-red" onClick={onClose} style={{marginLeft: 'auto'}}>
                Cerrar
            </button>
        )}
      </div>

      <hr className="form-separator" />
      
      {mensaje && (
        <div className={esError ? "error-message" : "success-message"} style={{marginBottom: '1rem'}}>
          {mensaje}
        </div>
      )}

      {/* 5. FIX ESTRUCTURAL: Orden y existencia de todos los campos en un solo grid */}
      <form onSubmit={handleSubmit}>
        <div className="form-fields-grid">
          
          {/* Fila 1 Columna 1: Nombre de Usuario */}
          <div className="form-group-client">
            <label className="form-label-client">Nombre de Usuario</label>
            <input 
              className="form-input-client"
              name="username" 
              value={form.username} 
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>

          {/* Fila 1 Columna 2: Email */}
          <div className="form-group-client">
            <label className="form-label-client">Email</label>
            <input 
              className="form-input-client"
              type="email"
              name="email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          
          {/* Fila 2 Columna 1: Contraseña */}
          <div className="form-group-client">
            <label className="form-label-client">
                {modo === "crear" ? "Contraseña" : "Nueva Contraseña (dejar en blanco para mantener)"}
            </label>
            <input 
              className="form-input-client"
              type="password" 
              name="password" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})}
              required={modo === "crear"}
            />
          </div>

          {/* Fila 2 Columna 2: Rol (Select corregido) */}
          <div className="form-group-client">
            <label className="form-label-client">Rol</label>
            <select 
              className="form-input-client"
              name="rol" 
              value={form.rol} 
              onChange={e => setForm({...form, rol: e.target.value})}
            >
              <option value="atencion">Empleado</option> 
              <option value="supervisor">Administrador</option> 
              <option value="cliente">Cliente</option>
            </select>
          </div>

          {/* Fila 3 Columna 1: ID Empleado Vinculado */}
          <div className="form-group-client">
            <label className="form-label-client">ID Empleado Vinculado</label>
            <input 
              className="form-input-client disabled-input"
              value={form.id_empleado} 
              readOnly
              placeholder="Ninguno"
            />
          </div>
          
          {/* Fila 3 Columna 2: ID Cliente Vinculado */}
          <div className="form-group-client">
            <label className="form-label-client">ID Cliente Vinculado</label>
            <input 
              className="form-input-client disabled-input"
              value={form.id_cliente} 
              readOnly
              placeholder="Ninguno"
            />
          </div>

        </div> {/* Cierre de form-fields-grid */}

        <div className="form-actions-client-full-width" style={{marginTop: '20px'}}>
          <button type="submit" className="btn-submit-client-full-width">
            {modo === "crear" ? "Registrar Usuario" : "Actualizar Mis Datos"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GestionUsuario;