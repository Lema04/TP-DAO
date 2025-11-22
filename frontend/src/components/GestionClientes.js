// --- /frontend/src/components/GestionClientes.js ---

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GestionClientes = ({ apiBaseUrl }) => {
  const [modo, setModo] = useState("listar"); 
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estados de Filtrado Unificado
  const [tipoFiltro, setTipoFiltro] = useState("nombreCompleto"); 
  const [valorFiltro, setValorFiltro] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    direccion: "",
    telefono: "",
    email: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  // ================================
  //      FUNCIONES AUXILIARES
  // ================================

  // Definimos el ORDEN de los campos para el formulario
  const CAMPO_ORDEN = [
    'nombre', 
    'apellido', 
    'dni', 
    'email', 
    'telefono', 
    'direccion'
  ];

  // Función para formatear el nombre de campo a etiqueta legible
  const formatLabel = (campo) => {
    switch (campo) {
        case 'nombre': return 'Nombre:';
        case 'apellido': return 'Apellido:';
        case 'dni': return 'Documento:';
        case 'direccion': return 'Dirección:';
        case 'telefono': return 'Teléfono:';
        case 'email': return 'Correo:';
        default: return campo.charAt(0).toUpperCase() + campo.slice(1) + ':';
    }
  };

  // Función para generar el texto de ejemplo (placeholder)
  const getPlaceholder = (campo) => {
    switch (campo) {
        case 'nombre': return 'Ej: Juan';
        case 'apellido': return 'Ej: Pérez';
        case 'dni': return 'Ej: 40123456';
        case 'direccion': return 'Ej: Calle Falsa 123';
        case 'telefono': return 'Ej: 3511234567';
        case 'email': return 'Ej: ejemplo@correo.com';
        default: return '';
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/clientes`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setClientes([]);
        return;
      }
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const buscarCliente = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/clientes/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setClienteSeleccionado(data);
      setForm(data);
      setModo("editar");
      setMensaje("");
      setEsError(false);
    } catch (error) {
      setMensaje(error.message);
      setEsError(true);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const crearCliente = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMensaje("Cliente registrado correctamente");
      setEsError(false);
      setForm({
        nombre: "",
        apellido: "",
        dni: "",
        direccion: "",
        telefono: "",
        email: "",
      });
      cargarClientes();
      setModo("listar");
    } catch (e) {
      setMensaje(e.message);
      setEsError(true);
    }
  };

  const actualizarCliente = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/clientes/${clienteSeleccionado.id_cliente}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMensaje("Cliente actualizado correctamente");
      setEsError(false);
      cargarClientes();
      setModo("listar");
    } catch (e) {
      setMensaje(e.message);
      setEsError(true);
    }
  };

  const eliminarCliente = async (id) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar el cliente con ID ${id}?`
    );
  
    if (!confirmar) return;
  
    try {
      const res = await fetch(`${apiBaseUrl}/clientes/${id}`, {
        method: "DELETE",
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.error);
  
      // Mensaje con el ID exacto eliminado
      setMensaje(`Cliente con ID ${id} eliminado correctamente.`);
      setEsError(false);
  
      cargarClientes();
    } catch (e) {
      setMensaje(e.message);
      setEsError(true);
    }
  };
  
  // ================================
  //  FILTRADO DE CLIENTES (UNIFICADO)
  // ================================

  const clientesFiltrados = clientes.filter((c) => {
    if (!valorFiltro) return true;

    const valorBusqueda = valorFiltro.toString().toLowerCase().trim();

    let valorCampo = "";
    switch (tipoFiltro) {
      case "id":
        valorCampo = c.id_cliente ? c.id_cliente.toString() : "";
        break;
      case "dni":
        valorCampo = c.dni ? c.dni.toString() : "";
        break;
      case "email":
        valorCampo = c.email ? c.email.toString() : "";
        break;
      case "nombreCompleto":
        valorCampo = `${c.nombre || ''} ${c.apellido || ''}`;
        break;
      default:
        return true; 
    }

    return valorCampo.toLowerCase().includes(valorBusqueda);
  });

  // ================================
  //      CARGA INICIAL
  // ================================
  useEffect(() => {
    cargarClientes();
  }, []);

  return (
    <div className="client-manager-container">
      <h1 className="main-title">Gestión de Clientes</h1>
      <hr className="header-separator" />

      {mensaje && (
        <div className={esError ? "error-message" : "success-message"}>{mensaje}</div>
      )}

      {/* =======================
          LISTADO
      ======================= */}
      {modo === "listar" && (
        <>
          {/* Nueva estructura para Filtro y Botón de Registro */}
          <div className="filter-and-button-row"> 
            {/* Contenedor del Filtro */}
            <div className="filter-group-compact">
                <input
                    type="text"
                    className="filter-input-compact" 
                    placeholder={`Buscar...`}
                    value={valorFiltro}
                    onChange={(e) => setValorFiltro(e.target.value)}
                />
                <select
                    className="filter-select-compact" 
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                >
                    <option value="nombreCompleto">Filtrar por Nombre</option>
                    <option value="id">Filtrar por ID</option>
                    <option value="dni">Filtrar por Documento</option>
                    <option value="email">Filtrar por Correo</option>
                </select>
            </div>
            
            {/* Botón de Registro (Ahora separado del título rojo) */}
            <button
              className="btn-register-list-standalone" 
              onClick={() => {
                setModo("crear");
                setForm({
                  nombre: "",
                  apellido: "",
                  dni: "",
                  direccion: "",
                  telefono: "",
                  email: "",
                });
                setMensaje("");
                setEsError(false);
              }}
            >
              + Registrar Cliente
            </button>
          </div>

          {/* Cabecera Roja para el Título del Listado */}
          <div className="list-header-row">
            <h3 className="list-header-red">Listado de Clientes Registrados</h3>
            {/* El botón de registro YA NO está aquí */}
          </div>
          
          <div className="table-responsive">
            <table className="client-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Documento</th> 
                  <th>Correo</th> 
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="text-center-message">No se encontraron clientes.</td>
                    </tr>
                ) : (
                    clientesFiltrados.map((c) => (
                        <tr key={c.id_cliente} className="table-data-row">
                          <td>{c.id_cliente}</td>
                          <td>{c.nombre} {c.apellido}</td>
                          <td>{c.dni}</td>
                          <td>{c.email}</td>
                          <td>{c.telefono}</td>
                          <td>{c.direccion}</td>
        
                          <td className="action-buttons-cell">
                            <button 
                                className="btn-edit-red" 
                                onClick={() => buscarCliente(c.id_cliente)}
                            >
                              Editar
                            </button>
        
                            <button
                              className="btn-delete-red" 
                              onClick={() => eliminarCliente(c.id_cliente)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      )
                    )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* =======================
          FORM CREATE/EDIT
      ======================= */}
      {(modo === "crear" || modo === "editar") && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            modo === "crear" ? crearCliente() : actualizarCliente();
          }}
          className="form-container-inner-shadow" 
        >
          <div className="form-header-row">
              <h3 className="form-subtitle-black">
                {modo === "crear" ? "Registrar Nuevo Cliente" : "Editar Cliente"}
              </h3>
              <button 
                type="button" 
                className="btn-back-link" 
                onClick={() => setModo("listar")}
              >
                Volver al Listado
              </button>
          </div>
          
          <hr className="form-separator" />

          <div className="form-fields-grid"> 
            
            {/* 1. Campo ID (Solo para edición) */}
            {modo === "editar" && clienteSeleccionado && (
                <div className="form-group-client">
                    <label className="form-label-client">
                      <strong>ID:</strong>
                    </label>
                    <input
                        className="form-input-client disabled-input"
                        type="text"
                        value={clienteSeleccionado.id_cliente || ""}
                        readOnly
                    />
                </div>
            )}

            {/* 2. Mapeo de campos en el orden deseado */}
            {CAMPO_ORDEN.map((campo) => (
              <div className="form-group-client" key={campo}>
                <label className="form-label-client">
                  <strong>{formatLabel(campo)}</strong>
                </label>
                <input
                  className="form-input-client"
                  type="text"
                  name={campo}
                  placeholder={getPlaceholder(campo)} 
                  value={form[campo] || ""}
                  onChange={handleChange}
                />
                
              </div>
            ))}
            
          </div>

          <div className="form-actions-client-full-width">
            <button type="submit" className="btn-submit-client-full-width">
              {modo === "crear" ? "Registrar Cliente" : "Actualizar Cliente"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GestionClientes;