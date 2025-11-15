from flask import Flask, jsonify, request
from servicios.cliente_service import ClienteService
from servicios.empleado_service import EmpleadoService
from servicios.vehiculo_service import VehiculoService
from servicios.alquiler_service import AlquilerService
from servicios.reserva_service import ReservaService
from servicios.multa_service import MultaService
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

servicio_usuario = UsuarioService() #


# --- Ruta raíz ---
@app.route("/")
def principal():
    return "TP-DAO-2025"


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


# =============================
#     EMPLEADOS CRUD
# =============================

@app.route("/empleados", methods=["GET"])
def listar_empleados():
    return jsonify(servicio_empleado.listar_empleados())

@app.route("/empleados/<int:id_empleado>", methods=["GET"])
def obtener_empleado(id_empleado):
    return jsonify(servicio_empleado.buscar_empleado(id_empleado))

@app.route("/empleados", methods=["POST"])
def crear_empleado():
    return jsonify(servicio_empleado.crear_empleado(request.get_json()))

@app.route("/empleados/<int:id_empleado>", methods=["PUT"])
def actualizar_empleado(id_empleado):
    return jsonify(servicio_empleado.actualizar_empleado(id_empleado, request.get_json()))

@app.route("/empleados/<int:id_empleado>", methods=["DELETE"])
def eliminar_empleado(id_empleado):
    return jsonify(servicio_empleado.eliminar_empleado(id_empleado))


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

# =============================
#     RESERVAS CRUD
# =============================

@app.route("/reservas", methods=["GET"])
def listar_reservas():
    return jsonify(servicio_reserva.listar_reservas())

@app.route("/reservas/<int:id_reserva>", methods=["GET"])
def obtener_reserva(id_reserva):
    return jsonify(servicio_reserva.buscar_reserva(id_reserva))

@app.route("/reservas", methods=["POST"])
def crear_reserva():
    return jsonify(servicio_reserva.crear_reserva(request.get_json()))

@app.route("/reservas/<int:id_reserva>", methods=["PUT"])
def actualizar_reserva(id_reserva):
    return jsonify(servicio_reserva.actualizar_reserva(id_reserva, request.get_json()))

@app.route("/reservas/<int:id_reserva>", methods=["DELETE"])
def eliminar_reserva(id_reserva):
    return jsonify(servicio_reserva.eliminar_reserva(id_reserva))


# =============================
#     MULTAS CRUD
# =============================

# @app.route("/multas", methods=["GET"])
# def listar_multas():
#     return jsonify(servicio_multa.listar_multas())

@app.route("/multas/<int:id_patente>", methods=["GET"])
def obtener_multa_por_patente(patente):
    return jsonify(servicio_multa.buscar_multas_por_patente(patente))

@app.route("/multas/<int:id_cliente>", methods=["GET"])
def obtener_multa_por_cliente(id_cliente):
    return jsonify(servicio_multa.buscar_multas_por_id_cliente(id_cliente))

@app.route("/multas", methods=["POST"])
def crear_multa():
    return jsonify(servicio_multa.crear_multa(request.get_json()))

@app.route("/multas/<int:id_multa>", methods=["PUT"])
def actualizar_multa(id_multa):
    return jsonify(servicio_multa.actualizar_multa(id_multa, request.get_json()))

@app.route("/multas/<int:id_multa>", methods=["DELETE"])
def eliminar_multa(id_multa):
    return jsonify(servicio_multa.eliminar_multa(id_multa))

# =============================
#          REPORTES 
# =============================

# Listado detallado de alquileres por cliente 
@app.route("/reportes/alquileres_por_cliente/<int:cliente_id>", methods=["GET"])
def reporte_alquileres_por_cliente(cliente_id):
    try:
        archivo_path = servicio_reporte.generar_reporte_alquileres_por_cliente(cliente_id, formato="pdf")
        return jsonify({"estado": "ok", "mensaje": f"Reporte PDF generado en: {archivo_path}"})
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)})

# Vehículos más alquilados 
@app.route("/reportes/vehiculos_mas_alquilados", methods=["GET"])
def reporte_vehiculos_mas_alquilados():
    try:
        # Aquí se podría pasar el límite por query param, pero se usa un límite por defecto para el servicio.
        archivo_path = servicio_reporte.generar_reporte_vehiculos_mas_alquilados(limite=5) 
        return jsonify({"estado": "ok", "mensaje": f"Reporte PDF generado en: {archivo_path}"})
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)})

# Estadística de facturación mensual en gráfico de barras 
@app.route("/reportes/facturacion_mensual", methods=["GET"])
def reporte_facturacion_mensual():
    try:
        # Recibe el año como parámetro de consulta (query param)
        anio = request.args.get('anio', type=int, default=datetime.now().year)
        
        archivo_path = servicio_reporte.generar_reporte_facturacion_mensual(anio)
        return jsonify({"estado": "ok", "mensaje": f"Reporte PDF generado en: {archivo_path}"})
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)})

# Alquileres por período (mes, trimestre) 
@app.route("/reportes/alquileres_por_periodo", methods=["GET"])
def reporte_alquileres_por_periodo():
    try:
        # Recibe la frecuencia (M o Q) y el año como parámetros de consulta
        frecuencia = request.args.get('frecuencia', type=str, default='M') 
        anio = request.args.get('anio', type=int, default=datetime.now().year)
        
        archivo_path = servicio_reporte.generar_reporte_alquileres_por_periodo(frecuencia.upper(), anio)
        return jsonify({"estado": "ok", "mensaje": f"Reporte PDF generado en: {archivo_path}"})
    except Exception as e:
        return jsonify({"estado": "error", "mensaje": str(e)})


# =============================
#     USUARIOS / LOGIN
# =============================

@app.route("/usuarios", methods=["POST"])
def registrar_usuario():
    datos = request.get_json()
    return jsonify(servicio_usuario.crear_usuario(datos))

@app.route("/usuarios/login", methods=["POST"])
def login_usuario():
    datos = request.get_json()
    return jsonify(servicio_usuario.autenticar_usuario(datos))
    
    # Llama al servicio de usuario para autenticar (asumo que tienes un método 'autenticar' o similar)
    # try:
        # Nota: Asumo que UsuarioService tiene un método 'autenticar'
      # VER  resultado = servicio_usuario.autenticar_usuario(nombre_usuario, contraseña)
        
        # if resultado.get("estado") == "ok":
        #     # Devolvemos el rol y el ID para el frontend
        #     usuario_data = resultado.get("data", {})
        #     return jsonify({
        #         "estado": "ok",
        #         "mensaje": "Login exitoso",
        #         "rol": usuario_data.get("rol"), # Ej: 'Gerente', 'Empleado', 'Cliente'
        #         "id_usuario": usuario_data.get("id_usuario")
        #     })
        # else:
        #     return jsonify({"estado": "error", "mensaje": resultado.get("mensaje")}), 401
            
    # except Exception as e:
    #     return jsonify({"estado": "error", "mensaje": f"Error de servidor: {e}"}), 500
      
# =============================
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