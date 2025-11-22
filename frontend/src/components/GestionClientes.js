import React, { useState, useEffect } from "react";

const GestionClientes = ({ apiBaseUrl }) => {
  // ================================
  //      ESTADOS DEL COMPONENTE
  // ================================
  const [modo, setModo] = useState("listar"); // 'listar', 'crear' o 'editar'
  const [clientes, setClientes] = useState([]); // Lista de clientes
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Cliente que se está editando
  const [tipoFiltro, setTipoFiltro] = useState("nombreCompleto"); // Tipo de filtro
  const [valorFiltro, setValorFiltro] = useState(""); // Valor del filtro
  const [form, setForm] = useState({ nombre: "", apellido: "", dni: "", direccion: "", telefono: "", email: "" });
  const [mensaje, setMensaje] = useState(""); // Mensajes de éxito o error
  const [esError, setEsError] = useState(false); // Boolean para estilo de mensaje

  // ================================
  //      CONFIGURACIÓN DE FORMULARIO
  // ================================
  const CAMPO_ORDEN = ['nombre', 'apellido', 'dni', 'email', 'telefono', 'direccion'];

  const LABELS = { nombre: "Nombre", apellido: "Apellido", dni: "Documento", direccion: "Dirección", telefono: "Teléfono", email: "Correo" };
  const PLACEHOLDERS = { nombre: "Ej: Juan", apellido: "Ej: Pérez", dni: "Ej: 40123456", direccion: "Ej: Calle Falsa 123", telefono: "Ej: 3511234567", email: "Ej: ejemplo@correo.com" };

  // ================================
  //      FUNCIONES AUXILIARES
  // ================================

  // Cargar todos los clientes desde la API
  const cargarClientes = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/clientes`);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  // Manejar cambios en los inputs del formulario
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Función unificada para crear o actualizar un cliente y su usuario
  const accionCliente = async (tipo) => {
    try {
      const url = tipo === "crear" ? `${apiBaseUrl}/clientes` : `${apiBaseUrl}/clientes/${clienteSeleccionado.id_cliente}`;
      const method = tipo === "crear" ? "POST" : "PUT";

      // Crear o actualizar cliente
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Si estamos editando y existe usuario asociado, actualizar también el usuario
      if (tipo === "editar" && clienteSeleccionado.usuario) {
        const usuarioId = clienteSeleccionado.usuario.id_usuario;
        const usuarioPayload = {
          nombre_usuario: `${form.nombre.toLowerCase()}.${form.apellido.toLowerCase()}.${clienteSeleccionado.id_cliente}`,
        };
        const resUsuario = await fetch(`${apiBaseUrl}/usuarios/${usuarioId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuarioPayload)
        });
        const dataUsuario = await resUsuario.json();
        if (!resUsuario.ok) throw new Error(dataUsuario.error);
      }

      // Mostrar mensaje con ID del cliente
      const clienteId = tipo === "crear" ? data.id_cliente || "nuevo" : clienteSeleccionado.id_cliente;
      setMensaje(`Cliente con ID ${clienteId} ${tipo === "crear" ? "registrado" : "actualizado"} correctamente.`);
      setEsError(false);
      setForm({ nombre: "", apellido: "", dni: "", direccion: "", telefono: "", email: "" });
      setModo("listar");
      cargarClientes();
    } catch (e) {
      const clienteId = clienteSeleccionado?.id_cliente || "desconocido";
      setMensaje(`Error al ${tipo === "crear" ? "registrar" : "actualizar"} cliente con ID ${clienteId}: ${e.message}`);
      setEsError(true);
    }
  };

  // Buscar un cliente por ID y cargarlo en el formulario
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
    } catch (e) {
      setMensaje(`Error al buscar cliente con ID ${id}: ${e.message}`);
      setEsError(true);
    }
  };

  // Eliminar un cliente con confirmación
  const eliminarCliente = async (id) => {
    if (!window.confirm(`¿Desea eliminar el cliente con ID ${id}?`)) return;

    try {
      const res = await fetch(`${apiBaseUrl}/clientes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMensaje(`Cliente con ID ${id} eliminado correctamente.`);
      setEsError(false);
      cargarClientes();
    } catch (e) {
      setMensaje(`Error al eliminar cliente con ID ${id}: ${e.message}`);
      setEsError(true);
    }
  };

  // ================================
  //      FILTRADO DE CLIENTES
  // ================================
  const clientesFiltrados = clientes.filter((c) => {
    if (!valorFiltro) return true;
    const valor = valorFiltro.toLowerCase().trim();
    switch (tipoFiltro) {
      case "id": return c.id_cliente?.toString().includes(valor);
      case "dni": return c.dni?.toString().includes(valor);
      case "email": return c.email?.toLowerCase().includes(valor);
      default: return `${c.nombre||''} ${c.apellido||''}`.toLowerCase().includes(valor);
    }
  });

  // ================================
  //      CARGA INICIAL
  // ================================
  useEffect(() => { cargarClientes(); }, []);

  // ================================
  //      RENDER DEL COMPONENTE
  // ================================
  return (
    <div className="client-manager-container">
      <h1 className="main-title">Gestión de Clientes</h1>
      <hr className="header-separator" />

      {/* Mensajes de error o éxito */}
      {mensaje && <div className={esError ? "error-message" : "success-message"}>{mensaje}</div>}

      {/* LISTADO DE CLIENTES */}
      {modo === "listar" && (
        <>
          <div className="filter-and-button-row">
            <div className="filter-group-compact">
              <input type="text" className="filter-input-compact" placeholder="Buscar..." value={valorFiltro} onChange={e=>setValorFiltro(e.target.value)} />
              <select className="filter-select-compact" value={tipoFiltro} onChange={e=>setTipoFiltro(e.target.value)}>
                <option value="nombreCompleto">Filtrar por Nombre</option>
                <option value="id">Filtrar por ID</option>
                <option value="dni">Filtrar por Documento</option>
                <option value="email">Filtrar por Correo</option>
              </select>
            </div>
            <button className="btn-register-list-standalone" onClick={()=>{setModo("crear"); setForm({ nombre:"", apellido:"", dni:"", direccion:"", telefono:"", email:"" }); setMensaje(""); setEsError(false);}}>+ Registrar Cliente</button>
          </div>

          <div className="list-header-row"><h3 className="list-header-red">Listado de Clientes Registrados</h3></div>

          <div className="table-responsive">
            <table className="client-data-table">
              <thead><tr><th>ID</th><th>Nombre Completo</th><th>Documento</th><th>Correo</th><th>Teléfono</th><th>Dirección</th><th>Acción</th></tr></thead>
              <tbody>
                {clientesFiltrados.length===0 ? (
                  <tr><td colSpan="7" className="text-center-message">No se encontraron clientes.</td></tr>
                ) : (
                  clientesFiltrados.map(c=>(
                    <tr key={c.id_cliente}>
                      <td>{c.id_cliente}</td>
                      <td>{c.nombre} {c.apellido}</td>
                      <td>{c.dni}</td>
                      <td>{c.email}</td>
                      <td>{c.telefono}</td>
                      <td>{c.direccion}</td>
                      <td className="action-buttons-cell">
                        <button className="btn-edit-red" onClick={()=>buscarCliente(c.id_cliente)}>Editar</button>
                        <button className="btn-delete-red" onClick={()=>eliminarCliente(c.id_cliente)}>Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FORMULARIO CREAR / EDITAR */}
      {(modo==="crear" || modo==="editar") && (
        <form onSubmit={e=>{e.preventDefault(); modo==="crear"?accionCliente("crear"):accionCliente("editar");}} className="form-container-inner-shadow">
          <div className="form-header-row">
            <h3 className="form-subtitle-black">{modo==="crear"?"Registrar Nuevo Cliente":"Editar Cliente"}</h3>
            <button type="button" className="btn-back-link" onClick={()=>setModo("listar")}>Volver al Listado</button>
          </div>
          <hr className="form-separator" />
          <div className="form-fields-grid">
            {modo==="editar" && clienteSeleccionado && (
              <div className="form-group-client">
                <label className="form-label-client"><strong>ID:</strong></label>
                <input className="form-input-client disabled-input" type="text" value={clienteSeleccionado.id_cliente || ""} readOnly />
              </div>
            )}
            {CAMPO_ORDEN.map(campo=>(
              <div className="form-group-client" key={campo}>
                <label className="form-label-client"><strong>{LABELS[campo]}</strong></label>
                <input className="form-input-client" type="text" name={campo} placeholder={PLACEHOLDERS[campo]} value={form[campo]||""} onChange={handleChange} />
              </div>
            ))}
          </div>

          <div className="form-actions-client-full-width">
            <button type="submit" className="btn-submit-client-full-width">{modo==="crear"?"Registrar Cliente":"Actualizar Cliente"}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GestionClientes;