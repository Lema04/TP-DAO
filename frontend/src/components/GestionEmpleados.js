import React, { useState, useEffect } from "react";

const GestionEmpleados = ({ apiBaseUrl }) => {
  const [modo, setModo] = useState("listar");
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("nombreCompleto");
  const [valorFiltro, setValorFiltro] = useState("");
  const [form, setForm] = useState({ nombre: "", apellido: "", dni: "", puesto: "", id_supervisor: "" });
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  const CAMPO_ORDEN = ["nombre", "apellido", "dni", "puesto", "id_supervisor"];
  const LABELS = { nombre: "Nombre", apellido: "Apellido", dni: "Documento", puesto: "Puesto", id_supervisor: "ID Supervisor" };
  const PLACEHOLDERS = { nombre: "Ej: Juan", apellido: "Ej: Pérez", dni: "Ej: 40123456", puesto: "Ej: Atención / Supervisor", id_supervisor: "Ej: 2" };
  const OPCIONES_PUESTO = ["Atención", "Supervisor"];

  const mostrarMensaje = (texto, error = false) => {
    setMensaje(texto);
    setEsError(error);
    setTimeout(() => {
      setMensaje("");
      setEsError(false);
    }, 5000);
  };

  // Carga inicial de empleados
  const cargarEmpleados = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/empleados`);
      const data = await res.json();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch {
      mostrarMensaje("Error al cargar empleados", true);
    }
  };

  useEffect(() => { cargarEmpleados(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Creación y edición de empleados.
  // Si se edita un empleado, también se sincroniza el usuario vinculado.
  const accionEmpleado = async (tipo) => {
    try {
      const url = tipo === "crear"
        ? `${apiBaseUrl}/empleados`
        : `${apiBaseUrl}/empleados/${empleadoSeleccionado.id_empleado}`;

      const res = await fetch(url, {
        method: tipo === "crear" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");

      const idEmpleado = tipo === "crear" ? data.id_empleado : empleadoSeleccionado.id_empleado;

      // Sincronizar datos del usuario si se edita un empleado
      if (tipo === "editar") {
        try {
          const resUser = await fetch(`${apiBaseUrl}/usuarios/empleado/${idEmpleado}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: form.nombre,
              apellido: form.apellido,
              dni: form.dni,
              rol: form.puesto
            })
          });

          const dataUser = await resUser.json();
          if (!resUser.ok) throw new Error(dataUser.error);
        } catch (e) {
          mostrarMensaje(`Empleado actualizado, pero falló la sincronización del usuario: ${e.message}`, true);
        }
      }

      setForm({ nombre: "", apellido: "", dni: "", puesto: "", id_supervisor: "" });
      setEmpleadoSeleccionado(null);
      setModo("listar");
      await cargarEmpleados();
      mostrarMensaje(`Empleado con ID ${idEmpleado} ${tipo === "crear" ? "registrado" : "actualizado"} correctamente.`);

    } catch (e) {
      mostrarMensaje(`Error al ${tipo === "crear" ? "registrar" : "actualizar"} empleado: ${e.message}`, true);
    }
  };

  // Trae un empleado para edición
  const buscarEmpleado = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/empleados/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEmpleadoSeleccionado(data);
      setForm({ ...data, id_supervisor: data.id_supervisor || "" });
      setModo("editar");
    } catch (e) {
      mostrarMensaje(`Error al buscar empleado: ${e.message}`, true);
    }
  };

  // Elimina empleado y también su usuario
  const eliminarEmpleado = async (id) => {
    if (!window.confirm(`¿Desea eliminar el empleado con ID ${id}?`)) return;
    try {
      const res = await fetch(`${apiBaseUrl}/empleados/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await cargarEmpleados();
      mostrarMensaje(`Empleado con ID ${id} eliminado correctamente.`);
    } catch (e) {
      mostrarMensaje(`Error al eliminar empleado: ${e.message}`, true);
    }
  };

  // Filtro dinámico
  const empleadosFiltrados = empleados.filter((e) => {
    if (!valorFiltro) return true;
    const valor = valorFiltro.toLowerCase();
    switch (tipoFiltro) {
      case "id": return e.id_empleado.toString().includes(valor);
      case "dni": return e.dni.toString().includes(valor);
      case "puesto": return e.puesto.toLowerCase().includes(valor);
      default: return `${e.nombre} ${e.apellido}`.toLowerCase().includes(valor);
    }
  });

  const supervisores = empleados.filter(e => e.puesto.toLowerCase() === "supervisor");

  return (
    <div className="client-manager-container">
      <h1 className="main-title">Gestión de Empleados</h1>
      <hr className="header-separator" />

      {mensaje && <div className={esError ? "error-message" : "success-message"}>{mensaje}</div>}

      {modo === "listar" && (
        <>
          <div className="filter-and-button-row">
            <div className="filter-group-compact">
              <input type="text" className="filter-input-compact" placeholder="Buscar..." value={valorFiltro} onChange={e => setValorFiltro(e.target.value)} />
              <select className="filter-select-compact" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                <option value="nombreCompleto">Filtrar por Nombre</option>
                <option value="id">Filtrar por ID</option>
                <option value="dni">Filtrar por Documento</option>
                <option value="puesto">Filtrar por Puesto</option>
              </select>
            </div>

            <button className="btn-register-list-standalone" onClick={() => {
              setModo("crear");
              setForm({ nombre: "", apellido: "", dni: "", puesto: "", id_supervisor: "" });
            }}>
              + Registrar Empleado
            </button>
          </div>

          <div className="list-header-row"><h3 className="list-header-red">Listado de Empleados</h3></div>

          <div className="table-responsive">
            <table className="client-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Documento</th>
                  <th>Puesto</th>
                  <th>ID Supervisor</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {empleadosFiltrados.length === 0 ? (
                  <tr><td colSpan="6" className="text-center-message">No se encontraron empleados.</td></tr>
                ) : (
                  empleadosFiltrados.map(e => (
                    <tr key={e.id_empleado}>
                      <td>{e.id_empleado}</td>
                      <td>{e.nombre} {e.apellido}</td>
                      <td>{e.dni}</td>
                      <td>{e.puesto}</td>
                      <td>{e.id_supervisor || "-"}</td>
                      <td className="action-buttons-cell">
                        <button className="btn-edit-red" onClick={() => buscarEmpleado(e.id_empleado)}>Editar</button>
                        <button className="btn-delete-red" onClick={() => eliminarEmpleado(e.id_empleado)}>Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(modo === "crear" || modo === "editar") && (
        <form onSubmit={(e) => { e.preventDefault(); accionEmpleado(modo === "crear" ? "crear" : "editar"); }} className="form-container-inner-shadow">
          <div className="form-header-row">
            <h3 className="form-subtitle-black">
              {modo === "crear" ? "Registrar Nuevo Empleado" : "Editar Empleado"}
            </h3>
            <button type="button" className="btn-back-link" onClick={() => setModo("listar")}>Volver al Listado</button>
          </div>

          <hr className="form-separator" />

          <div className="form-fields-grid">
            {modo === "editar" && (
              <div className="form-group-client">
                <label className="form-label-client"><strong>ID Empleado</strong></label>
                <input className="form-input-client disabled-input" type="text" readOnly value={empleadoSeleccionado?.id_empleado} />
              </div>
            )}

            {CAMPO_ORDEN.map(campo => (
              <div key={campo} className="form-group-client">
                <label className="form-label-client"><strong>{LABELS[campo]}</strong></label>

                {campo === "puesto" ? (
                  <select name="puesto" value={form.puesto} onChange={handleChange} className="form-input-client">
                    <option value="">Seleccione un puesto</option>
                    {OPCIONES_PUESTO.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : campo === "id_supervisor" ? (
                  <select
                    name="id_supervisor"
                    value={form.id_supervisor}
                    onChange={handleChange}
                    className="form-input-client"
                    disabled={form.puesto === "Supervisor"}
                  >
                    <option value="">Sin supervisor</option>
                    {supervisores.map(s => (
                      <option key={s.id_empleado} value={s.id_empleado}>
                        {s.id_empleado} - {s.nombre} {s.apellido}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-input-client"
                    type="text"
                    name={campo}
                    placeholder={PLACEHOLDERS[campo]}
                    value={form[campo]}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="form-actions-client-full-width">
            <button type="submit" className="btn-submit-client-full-width">
              {modo === "crear" ? "Registrar Empleado" : "Actualizar Empleado"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GestionEmpleados;
