// --- /frontend/src/components/GestionUsuario.js ---
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const GestionUsuario = ({ apiBaseUrl }) => {
  const { user, actualizarUsuarioContext } = useAuth();
  const usuarioId = user?.id_usuario;

  const [form, setForm] = useState({ nombre_usuario: "", contraseña: "" });
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);

  const cargarUsuario = async () => {
    if (!usuarioId) return;
    setCargando(true);
    try {
      const res = await fetch(`${apiBaseUrl}/usuarios/${usuarioId}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al cargar usuario: ${text}`);
      }
      const data = await res.json();
      setForm({
        nombre_usuario: data.nombre_usuario || "",
        contraseña: data.contraseña || ""
      });
      setMensaje("");
      setEsError(false);
    } catch (e) {
      setMensaje(e.message);
      setEsError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuario();
  }, [usuarioId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    if (!usuarioId) {
      setMensaje("ID de usuario no definido.");
      setEsError(true);
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/usuarios/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Error desconocido al actualizar usuario");

      setMensaje("Usuario actualizado correctamente.");
      setEsError(false);

      if (actualizarUsuarioContext) actualizarUsuarioContext({ nombre_usuario: form.nombre_usuario });

      setForm({
        nombre_usuario: form.nombre_usuario,
        contraseña: form.contraseña
      });

      setMostrarContraseña(false);

      setTimeout(() => setMensaje(""), 3000);

    } catch (e) {
      setMensaje(e.message);
      setEsError(true);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  if (!usuarioId) return <p>Cargando usuario...</p>;

  return (
    <div className="form-card">
      <h2 className="form-title">Gestión de Usuario</h2>

      {/* Línea divisora debajo del título */}
      <hr style={{ border: "none", borderTop: "2px solid #000000", margin: "0.5rem 0 2rem 0" }} />

      {mensaje && (
        <div className={esError ? "error-message" : "success-message"}>
          {mensaje}
        </div>
      )}

      {cargando ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="form-fields-grid">
          {/* Usuario */}
          <div className="form-group-client">
            <label className="form-label-client"><strong>Usuario</strong></label>
            <input
              type="text"
              name="nombre_usuario"
              className="form-input-client"
              value={form.nombre_usuario}
              onChange={handleChange}
            />
          </div>

          {/* Contraseña */}
          <div className="form-group-client">
            <label className="form-label-client"><strong>Contraseña</strong></label>
            <div className="password-input-wrapper">
              <input
                type={mostrarContraseña ? "text" : "password"}
                name="contraseña"
                className="form-input-client"
                value={form.contraseña}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setMostrarContraseña(!mostrarContraseña)}
              >
                {mostrarContraseña ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Botón Guardar (ocupa ambas columnas) */}
          <div className="form-actions-client-full-width" style={{ gridColumn: "1 / -1" }}>
            <button
              className="btn-submit-client-full-width"
              type="button"
              onClick={guardarCambios}
            >
              Actualizar Usuario
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuario;
