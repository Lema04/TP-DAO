from flask import Flask, jsonify, request
from servicios.cliente_service import ClienteService
from servicios.empleado_service import EmpleadoService
from servicios.vehiculo_service import VehiculoService
from servicios.alquiler_service import AlquilerService
from servicios.reserva_service import ReservaService
from servicios.multa_service import MultaService
from servicios.mantenimiento_service import MantenimientoService
from flask_cors import CORS
# agg para reportes
from servicios.reporte_service import ReporteService #
from datetime import datetime # Necesario para los reportes de año
from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError,
    DatosInvalidosError, 
    ErrorDeLogicaDeNegocio,
    ErrorDeCliente,
    ClienteNoEncontradoError,

)
from servicios.usuario_service import UsuarioService

app = Flask(__name__)
CORS(app)

# --- Instancias de Servicios ---
servicio_cliente = ClienteService()
servicio_empleado = EmpleadoService()
servicio_vehiculo = VehiculoService()
servicio_alquiler = AlquilerService()
servicio_reserva = ReservaService()
servicio_multa = MultaService()

servicio_reporte = ReporteService() #
servicio_mantenimiento = MantenimientoService()
servicio_usuario = UsuarioService() #


# --- Ruta raíz ---
@app.route("/")
def principal():
    return "TP-DAO-2025"



# --- Archivo: app.py ---

# (Asegúrate de que 'servicio_multa = MultaService()' esté instanciado arriba)

# =============================
#     MULTAS CRUD (¡ARREGLADO!)
# =============================

@app.route("/multas", methods=["GET"])
def listar_multas():
    """
    Lista multas, filtrando por 'id_cliente' o 'patente' si se proveen.
    Ej: GET /multas
    Ej: GET /multas?id_cliente=1
    Ej: GET /multas?patente=ABC123
    """
    try:
        id_cliente = request.args.get('id_cliente', type=int)
        patente = request.args.get('patente', type=str)
        
        if id_cliente:
            multas = servicio_multa.buscar_multas_por_id_cliente(id_cliente)
        elif patente:
            multas = servicio_multa.buscar_multas_por_patente(patente)
        else:
            # Si no hay filtros, podríamos listar todas (si tuvieras el método)
            # multas = servicio_multa.listar_multas() 
            # Por ahora, devolvemos lista vacía si no hay filtro
            multas = [] 
        
        return jsonify([m.a_dict() for m in multas]), 200
    
    except RecursoNoEncontradoError as e: # Si la patente o cliente no existen
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/multas/<int:id_multa>", methods=["GET"])
def obtener_multa(id_multa):
    try:
        multa = servicio_multa.buscar_multa(id_multa)
        return jsonify(multa.a_dict()), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/multas", methods=["POST"])
def crear_multa():
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos.")
            
        nueva_multa = servicio_multa.crear_multa(datos)
        return jsonify(nueva_multa.a_dict()), 201
    
    except (DatosInvalidosError, RecursoNoEncontradoError) as e:
        # Error (fechas mal, monto 0, alquiler no existe)
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/multas/<int:id_multa>", methods=["PUT"])
def actualizar_multa(id_multa):
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
            
        multa_actualizada = servicio_multa.actualizar_multa(id_multa, datos)
        return jsonify(multa_actualizada.a_dict()), 200
    
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/multas/<int:id_multa>", methods=["DELETE"])
def eliminar_multa(id_multa):
    try:
        servicio_multa.eliminar_multa(id_multa)
        return jsonify({"mensaje": f"Multa {id_multa} eliminada."}), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 409
# =============================
#     CLIENTES CRUD
# =============================
# --- Archivo: app.py ---

# (Asegúrate de importar tus excepciones personalizadas al inicio del archivo)
# from excepciones import ErrorDeCliente, ClienteNoEncontradoError, DatosInvalidosError

# =============================
#     CLIENTES CRUD (¡ARREGLADO!)
# =============================

@app.route("/clientes", methods=["GET"])
def listar_clientes():
    try:
        # 1. El servicio retorna una LISTA DE OBJETOS [Cliente, Cliente, ...]
        clientes = servicio_cliente.listar_clientes()
        
        # 2. "Traducimos" cada objeto de la lista a un diccionario
        clientes_json = [cliente.a_dict() for cliente in clientes]
        
        # 3. Retornamos el JSON y el código de estado 200 OK
        return jsonify(clientes_json), 200
    
    except ErrorDeCliente as e:
        # Error genérico (ej. falla de BDD)
        return jsonify({"error": str(e)}), 500


@app.route("/clientes/<int:id_cliente>", methods=["GET"])
def obtener_cliente(id_cliente):
    try:
        # 1. El servicio retorna UN OBJETO Cliente
        cliente = servicio_cliente.buscar_cliente(id_cliente)
        
        # 2. "Traducimos" el objeto a dict y retornamos 200 OK
        return jsonify(cliente.a_dict()), 200
    
    except ClienteNoEncontradoError as e:
        # 3. ¡Manejo de error específico! Retornamos 404 NOT FOUND
        return jsonify({"error": str(e)}), 404
    
    except ErrorDeCliente as e:
        return jsonify({"error": str(e)}), 500


@app.route("/clientes", methods=["POST"])
def crear_cliente():
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos en el request.")
            
        # 1. El servicio retorna el NUEVO OBJETO Cliente creado
        nuevo_cliente = servicio_cliente.crear_cliente(datos)
        
        # 2. "Traducimos" y retornamos 201 CREATED
        return jsonify(nuevo_cliente.a_dict()), 201
    
    except DatosInvalidosError as e:
        # 3. Manejo de error de validación. Retornamos 400 BAD REQUEST
        return jsonify({"error": str(e)}), 400
    
    except ErrorDeCliente as e:
        return jsonify({"error": str(e)}), 500


@app.route("/clientes/<int:id_cliente>", methods=["PUT"])
def actualizar_cliente(id_cliente):
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
            
        # 1. El servicio retorna el OBJETO Cliente actualizado
        cliente_actualizado = servicio_cliente.actualizar_cliente(id_cliente, datos)
        
        # 2. "Traducimos" y retornamos 200 OK
        return jsonify(cliente_actualizado.a_dict()), 200
    
    except ClienteNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    
    except ErrorDeCliente as e:
        return jsonify({"error": str(e)}), 500


@app.route("/clientes/<int:id_cliente>", methods=["DELETE"])
def eliminar_cliente(id_cliente):
    try:
        # 1. El servicio ya no retorna nada, solo levanta excepciones si falla
        servicio_cliente.eliminar_cliente(id_cliente)
        
        # 2. Retornamos un mensaje de éxito y 200 OK
        return jsonify({"mensaje": "Cliente eliminado correctamente"}), 200
    
    except ClienteNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    
    except ErrorDeCliente as e:
        return jsonify({"error": str(e)}), 500


# --- Archivo: app.py ---

# =============================
#     EMPLEADOS CRUD (¡ARREGLADO!)
# =============================

@app.route("/empleados", methods=["GET"])
def listar_empleados():
    try:
        empleados = servicio_empleado.listar_empleados()
        # Usamos .a_dict() que ya existe en la clase Empleado
        return jsonify([e.a_dict() for e in empleados]), 200
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/empleados/<int:id_empleado>", methods=["GET"])
def obtener_empleado(id_empleado):
    try:
        empleado = servicio_empleado.buscar_empleado(id_empleado)
        return jsonify(empleado.a_dict()), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/empleados", methods=["POST"])
def crear_empleado():
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos.")
            
        nuevo_empleado = servicio_empleado.crear_empleado(datos)
        return jsonify(nuevo_empleado.a_dict()), 201
    
    except DatosInvalidosError as e:
        # Error de validación (DNI duplicado, etc.)
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/empleados/<int:id_empleado>", methods=["PUT"])
def actualizar_empleado(id_empleado):
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
            
        empleado_actualizado = servicio_empleado.actualizar_empleado(id_empleado, datos)
        return jsonify(empleado_actualizado.a_dict()), 200
    
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/empleados/<int:id_empleado>", methods=["DELETE"])
def eliminar_empleado(id_empleado):
    try:
        servicio_empleado.eliminar_empleado(id_empleado)
        return jsonify({"mensaje": f"Empleado {id_empleado} eliminado."}), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        # Ej: No se puede borrar, está en un alquiler (Error de Foreign Key)
        return jsonify({"error": str(e)}), 409 # 409 Conflict
# --- Archivo: app.py ---

# =============================
#     VEHÍCULOS CRUD (¡ARREGLADO!)
# =============================

@app.route("/vehiculos", methods=["GET"])
def listar_vehiculos():
    try:
        vehiculos = servicio_vehiculo.listar_vehiculos()
        # Usamos .a_dict() que ya existe en la clase Vehiculo
        return jsonify([v.a_dict() for v in vehiculos]), 200
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/vehiculos/<string:patente>", methods=["GET"])
def obtener_vehiculo(patente):
    try:
        vehiculo = servicio_vehiculo.buscar_vehiculo(patente)
        return jsonify(vehiculo.a_dict()), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/vehiculos", methods=["POST"])
def crear_vehiculo():
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos.")
            
        nuevo_vehiculo = servicio_vehiculo.crear_vehiculo(datos)
        return jsonify(nuevo_vehiculo.a_dict()), 201
    
    except DatosInvalidosError as e:
        # Error de validación (patente inválida, año no es número)
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        # Error del DAO (patente duplicada)
        return jsonify({"error": str(e)}), 500

@app.route("/vehiculos/<string:patente>", methods=["PUT"])
def actualizar_vehiculo(patente):
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
            
        vehiculo_actualizado = servicio_vehiculo.actualizar_vehiculo(patente, datos)
        return jsonify(vehiculo_actualizado.a_dict()), 200
    
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/vehiculos/<string:patente>", methods=["DELETE"])
def eliminar_vehiculo(patente):
    try:
        servicio_vehiculo.eliminar_vehiculo(patente)
        return jsonify({"mensaje": f"Vehículo {patente} eliminado."}), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        # Ej: No se puede borrar, está en un alquiler (Error de Foreign Key)
        return jsonify({"error": str(e)}), 409 # 409 Conflict


# =============================
#     ALQUILERES CRUD
# =============================

@app.route("/alquileres", methods=["GET"])
def gestionar_alquileres():
    """
    Función única para manejar GET /alquileres.
    - Si hay 'id_cliente' en la query, busca por cliente.
    - Si no, lista todos los alquileres.
    """
    try:
        # Revisa si el query param 'id_cliente' fue enviado
        id_cliente = request.args.get('id_cliente', type=int)
        
        if id_cliente:
            # --- Lógica de buscar_por_cliente ---
            alquileres = servicio_alquiler.buscar_por_cliente(id_cliente)
            # Una lista vacía es un éxito, no un error
        else:
            # --- Lógica de listar_alquileres ---
            alquileres = servicio_alquiler.listar_alquileres()
        
        # Serializamos la lista de objetos Alquiler
        alquileres_json = [alquiler.a_dict() for alquiler in alquileres]
        return jsonify(alquileres_json), 200

    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {e}"}), 500


@app.route("/alquileres/<int:id_alquiler>", methods=["GET"])
def obtener_alquiler(id_alquiler):
    try:
        # 1. El servicio retorna UN objeto Alquiler
        alquiler = servicio_alquiler.buscar_alquiler(id_alquiler)
        
        # 2. Serializamos (con .a_dict() anidado) y retornamos 200
        return jsonify(alquiler.a_dict()), 200
    
    except RecursoNoEncontradoError as e:
        # 3. Manejo de error específico! Retornamos 404
        return jsonify({"error": str(e)}), 404
    
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500


@app.route("/alquileres", methods=["POST"])
def crear_alquiler():
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos.")
        
        # 1. El servicio hace toda la lógica (validar cliente, auto, etc.)
        # y retorna el objeto Alquiler creado.
        nuevo_alquiler = servicio_alquiler.crear_alquiler(datos)
        
        # 2. Serializamos y retornamos 201 CREATED
        return jsonify(nuevo_alquiler.a_dict()), 201
    
    except (DatosInvalidosError, RecursoNoEncontradoError) as e:
        # Si faltan datos o no se encuentra el cliente/auto
        return jsonify({"error": str(e)}), 400
    
    except ErrorDeLogicaDeNegocio as e:
        # Ej. "El vehículo no está disponible"
        return jsonify({"error": str(e)}), 409  # 409 Conflict
    
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500


@app.route("/alquileres/<int:id_alquiler>", methods=["PUT"])
def actualizar_alquiler(id_alquiler):
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
            
        # 1. El servicio retorna el objeto actualizado
        alquiler_actualizado = servicio_alquiler.actualizar_alquiler(id_alquiler, datos)
        
        # 2. Serializamos y retornamos 200 OK
        return jsonify(alquiler_actualizado.a_dict()), 200
    
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500


@app.route("/alquileres/<int:id_alquiler>", methods=["DELETE"])
def eliminar_alquiler(id_alquiler):
    try:
        # 1. El servicio hace la lógica (ej. re-habilitar el auto)
        servicio_alquiler.eliminar_alquiler(id_alquiler)
        
        # 2. Retornamos un mensaje de éxito
        return jsonify({"mensaje": "Alquiler eliminado correctamente"}), 200
    
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

# --- Archivo: app.py ---

# (Asegúrate de que 'servicio_reserva = ReservaService()' esté instanciado arriba)

# =============================
#     RESERVAS CRUD (¡ARREGLADO!)
# =============================

@app.route("/reservas", methods=["GET"])
def listar_reservas():
    try:
        reservas = servicio_reserva.listar_reservas()
        return jsonify([r.a_dict() for r in reservas]), 200
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reservas/<int:id_reserva>", methods=["GET"])
def obtener_reserva(id_reserva):
    try:
        reserva = servicio_reserva.buscar_reserva(id_reserva)
        return jsonify(reserva.a_dict()), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reservas", methods=["POST"])
def crear_reserva():
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos.")
            
        nueva_reserva = servicio_reserva.crear_reserva(datos)
        return jsonify(nueva_reserva.a_dict()), 201
    
    except (DatosInvalidosError, RecursoNoEncontradoError) as e:
        # Error (fechas mal, cliente o vehiculo no existe)
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reservas/<int:id_reserva>", methods=["PUT"])
def actualizar_reserva(id_reserva):
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
            
        reserva_actualizada = servicio_reserva.actualizar_reserva(id_reserva, datos)
        return jsonify(reserva_actualizada.a_dict()), 200
    
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reservas/<int:id_reserva>", methods=["DELETE"])
def eliminar_reserva(id_reserva):
    try:
        servicio_reserva.eliminar_reserva(id_reserva)
        return jsonify({"mensaje": f"Reserva {id_reserva} eliminada."}), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 409


# --- Archivo: app.py ---

# (Importaciones...)
# ...

# =============================
#          REPORTES (¡JSON CORREGIDO!)
# =============================

@app.route("/reportes/alquileres_por_cliente/<int:cliente_id>", methods=["GET"])
def reporte_alquileres_por_cliente(cliente_id):
    try:
        archivo_path = servicio_reporte.generar_reporte_alquileres_por_cliente(cliente_id, formato="pdf")
        
        # Éxito: Devolvemos un JSON simple con la información
        return jsonify({
            "mensaje": f"Reporte PDF generado para el cliente {cliente_id}",
            "path": archivo_path
        }), 200
    
    except RecursoNoEncontradoError as e:
        # Error: Devolvemos solo la clave "error"
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error del servidor al generar reporte: {e}"}), 500

@app.route("/reportes/vehiculos_mas_alquilados", methods=["GET"])
def reporte_vehiculos_mas_alquilados():
    try:
        limite = request.args.get('limite', type=int, default=5)
        archivo_path = servicio_reporte.generar_reporte_vehiculos_mas_alquilados(limite=limite) 
        
        return jsonify({
            "mensaje": f"Reporte de vehículos más alquilados (Top {limite}) generado.",
            "path": archivo_path
        }), 200
    
    except RecursoNoEncontradoError as e:
         return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error del servidor al generar reporte: {e}"}), 500

@app.route("/reportes/facturacion_mensual", methods=["GET"])
def reporte_facturacion_mensual():
    try:
        anio = request.args.get('anio', type=int, default=datetime.now().year)
        archivo_path = servicio_reporte.generar_reporte_facturacion_mensual(anio)
        
        return jsonify({
            "mensaje": f"Reporte de facturación mensual para {anio} generado.",
            "path": archivo_path
        }), 200
    
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error del servidor al generar reporte: {e}"}), 500

@app.route("/reportes/alquileres_por_periodo", methods=["GET"])
def reporte_alquileres_por_periodo():
    try:
        frecuencia = request.args.get('frecuencia', type=str, default='M').upper()
        anio = request.args.get('anio', type=int, default=datetime.now().year)
        
        if frecuencia not in ['M', 'Q']:
             raise DatosInvalidosError("Frecuencia inválida. Use 'M' o 'Q'.")
             
        archivo_path = servicio_reporte.generar_reporte_alquileres_por_periodo(frecuencia, anio)
        
        return jsonify({
            "mensaje": f"Reporte de alquileres por período ({frecuencia}) para {anio} generado.",
            "path": archivo_path
        }), 200
    
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error del servidor al generar reporte: {e}"}), 500
    
# --- Ruta para Reporte de Cliente (¡!) ---
@app.route("/reportes/cliente/<int:id_cliente>", methods=["GET"])
def generar_reporte_cliente_route(id_cliente):
    """
    Genera el reporte de historial de alquileres para un cliente específico.
    """
    try:
        # 1. Llama al servicio para generar el reporte.
        # Se asume que el servicio devuelve la ruta al archivo PDF guardado.
        ruta_archivo = servicio_reporte.generar_reporte_alquileres_por_cliente(id_cliente)       
        return jsonify({
            "mensaje": f"Reporte del cliente {id_cliente} generado con éxito.", 
            "ruta_archivo": ruta_archivo 
        }), 200
        
    except RecursoNoEncontradoError as e:
        # El cliente con ese ID no existe.
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        # Error genérico del servicio.
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        # Otros errores inesperados.
        print(f"Error al generar reporte de cliente: {e}")
        return jsonify({"error": "Error interno del servidor al generar reporte."}), 500

# (Asegúrate de que 'servicio_mantenimiento = MantenimientoService()' esté instanciado arriba)

# =============================
#     MANTENIMIENTO CRUD (¡NUEVO Y ARREGLADO!)
# =============================

@app.route("/mantenimientos", methods=["GET"])
def listar_mantenimientos():
    """
    Lista todos los mantenimientos o filtra por patente.
    Ej: GET /mantenimientos
    Ej: GET /mantenimientos?patente=ABC123
    """
    try:
        patente = request.args.get('patente')
        if patente:
            mantenimientos = servicio_mantenimiento.buscar_por_vehiculo(patente)
        else:
            mantenimientos = servicio_mantenimiento.listar_mantenimientos()
        
        return jsonify([m.a_dict() for m in mantenimientos]), 200
    
    except RecursoNoEncontradoError as e: # Si la patente no existe
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/mantenimientos/<int:id_mantenimiento>", methods=["GET"])
def obtener_mantenimiento(id_mantenimiento):
    try:
        mantenimiento = servicio_mantenimiento.buscar_mantenimiento(id_mantenimiento)
        return jsonify(mantenimiento.a_dict()), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/mantenimientos", methods=["POST"])
def crear_mantenimiento():
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos.")
            
        nuevo_mantenimiento = servicio_mantenimiento.crear_mantenimiento(datos)
        return jsonify(nuevo_mantenimiento.a_dict()), 201
    
    except (DatosInvalidosError, RecursoNoEncontradoError) as e:
        # Error de validación (fechas mal, patente no existe)
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/mantenimientos/<int:id_mantenimiento>", methods=["PUT"])
def actualizar_mantenimiento(id_mantenimiento):
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
            
        mantenimiento_actualizado = servicio_mantenimiento.actualizar_mantenimiento(id_mantenimiento, datos)
        return jsonify(mantenimiento_actualizado.a_dict()), 200
    
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/mantenimientos/<int:id_mantenimiento>", methods=["DELETE"])
def eliminar_mantenimiento(id_mantenimiento):
    try:
        servicio_mantenimiento.eliminar_mantenimiento(id_mantenimiento)
        return jsonify({"mensaje": f"Mantenimiento {id_mantenimiento} eliminado."}), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 409


# --- Archivo: app.py ---

# (Asegúrate de que 'servicio_usuario = UsuarioService()' esté instanciado arriba)

# =============================
#     USUARIOS / LOGIN (¡ARREGLADO!)
# =============================

@app.route("/usuarios", methods=["GET"])
def listar_usuarios():
    """ Lista todos los usuarios (solo para admin, probablemente) """
    try:
        usuarios = servicio_usuario.listar_usuarios()
        # .a_dict() oculta todas las contraseñas
        return jsonify([u.a_dict() for u in usuarios]), 200
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/usuarios/<int:id_usuario>", methods=["GET"])
def obtener_usuario(id_usuario):
    """ Obtiene un usuario específico por ID """
    try:
        usuario = servicio_usuario.buscar_usuario(id_usuario)
        return jsonify(usuario.a_dict()), 200 # .a_dict() oculta la contraseña
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/usuarios", methods=["POST"])
def registrar_usuario():
    """ Registra un nuevo usuario """
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos.")
        
        nuevo_usuario = servicio_usuario.crear_usuario(datos)
        # .a_dict() oculta la contraseña
        return jsonify(nuevo_usuario.a_dict()), 201
        
    except DatosInvalidosError as e:
        # Ej: "Usuario ya existe", "Contraseña obligatoria"
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/usuarios/<int:id_usuario>", methods=["PUT"])
def actualizar_usuario(id_usuario):
    """ Actualiza un usuario """
    try:
        datos = request.get_json()
        if not datos:
            raise DatosInvalidosError("No se proporcionaron datos para actualizar.")
        
        usuario_actualizado = servicio_usuario.actualizar_usuario(id_usuario, datos)
        return jsonify(usuario_actualizado.a_dict()), 200 # .a_dict() oculta la contraseña
        
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except DatosInvalidosError as e:
        return jsonify({"error": str(e)}), 400
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500

@app.route("/usuarios/<int:id_usuario>", methods=["DELETE"])
def eliminar_usuario(id_usuario):
    """ Elimina un usuario """
    try:
        servicio_usuario.eliminar_usuario(id_usuario)
        return jsonify({"mensaje": f"Usuario {id_usuario} eliminado."}), 200
    except RecursoNoEncontradoError as e:
        return jsonify({"error": str(e)}), 404
    except ErrorDeAplicacion as e:
        # Ej: Error de FK si el usuario está atado a un Empleado
        return jsonify({"error": str(e)}), 409 # Conflict

@app.route("/usuarios/login", methods=["POST"])
def login_usuario():
    """ Autentica un usuario y devuelve datos de sesión """
    try:
        datos = request.get_json()
        if not datos or not datos.get('nombre_usuario') or not datos.get('contraseña'):
            raise DatosInvalidosError("Usuario y contraseña son requeridos.")
        
        # El servicio ya devuelve un diccionario limpio (no un objeto)
        sesion_data = servicio_usuario.autenticar_usuario(datos)
        
        # Devolvemos el dict de sesión (rol, ids, etc.)
        return jsonify(sesion_data), 200
        
    except DatosInvalidosError as e:
        # 401 Unauthorized es el código correcto para login fallido
        return jsonify({"error": str(e)}), 401 
    except ErrorDeAplicacion as e:
        return jsonify({"error": str(e)}), 500# =============================
#     MAIN
# =============================

if __name__ == "__main__":
    app.run(debug=True)


    # # --- PRUEBAS MANUALES ---
    # print("\n=== PRUEBAS MANUALES DE API ===")

    # with app.test_client() as client:
    #     # Prueba 1: ruta raíz
    #     resp = client.get("/")
    #     print("GET / →", resp.status_code, resp.data.decode())

    #     # Prueba 2: listar clientes
    #     resp = client.get("/clientes")
    #     print("GET /clientes →", resp.status_code, resp.json)

    #     #         self.id_cliente = id_cliente
    #     # self.nombre = nombre
    #     # self.apellido = apellido
    #     # self.dni = dni
    #     # self.direccion = direccion
    #     # self.telefono = telefono
    #     # self.email = email


    #     # Prueba 3: crear cliente (solo ejemplo)
    #     nuevo_cliente = {
    #         "nombre": "Agustín",
    #         "apellido": "Pérez",
    #         "dni": "40123456",
    #         "direccion": "Utn frc",
    #         "telefono": "12345678",
    #         "email": "agus@example.com"
    #     }
    #     resp = client.post("/clientes", json=nuevo_cliente)
    #     print("POST /clientes →", resp.status_code, resp.json)

    #     # Prueba 4: listar alquileres
    #     resp = client.get("/alquileres")
    #     print("GET /alquileres →", resp.status_code, resp.json)

    #     # Prueba 5: listar vehículos
    #     resp = client.get("/vehiculos")
    #     print("GET /vehiculos →", resp.status_code, resp.json)