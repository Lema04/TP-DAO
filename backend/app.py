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

@app.route("/clientes", methods=["GET"])
def listar_clientes():
    return jsonify(servicio_cliente.listar_clientes())

@app.route("/clientes/<int:id_cliente>", methods=["GET"])
def obtener_cliente(id_cliente):
    return jsonify(servicio_cliente.buscar_cliente(id_cliente))

@app.route("/clientes", methods=["POST"])
def crear_cliente():
    return jsonify(servicio_cliente.crear_cliente(request.get_json()))

@app.route("/clientes/<int:id_cliente>", methods=["PUT"])
def actualizar_cliente(id_cliente):
    return jsonify(servicio_cliente.actualizar_cliente(id_cliente, request.get_json()))

@app.route("/clientes/<int:id_cliente>", methods=["DELETE"])
def eliminar_cliente(id_cliente):
    return jsonify(servicio_cliente.eliminar_cliente(id_cliente))


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


# =============================
#     VEHÍCULOS CRUD
# =============================

@app.route("/vehiculos", methods=["GET"])
def listar_vehiculos():
    return jsonify(servicio_vehiculo.listar_vehiculos())

@app.route("/vehiculos/<string:patente>", methods=["GET"])
def obtener_vehiculo(patente):
    return jsonify(servicio_vehiculo.buscar_vehiculo(patente))

@app.route("/vehiculos", methods=["POST"])
def crear_vehiculo():
    return jsonify(servicio_vehiculo.crear_vehiculo(request.get_json()))

@app.route("/vehiculos/<string:patente>", methods=["PUT"])
def actualizar_vehiculo(patente):
    return jsonify(servicio_vehiculo.actualizar_vehiculo(patente, request.get_json()))

@app.route("/vehiculos/<string:patente>", methods=["DELETE"])
def eliminar_vehiculo(patente):
    return jsonify(servicio_vehiculo.eliminar_vehiculo(patente))


# =============================
#     ALQUILERES CRUD
# =============================

@app.route("/alquileres", methods=["GET"])
def listar_alquileres():
    return jsonify(servicio_alquiler.listar_alquileres())

@app.route("/alquileres/<int:id_alquiler>", methods=["GET"])
def obtener_alquiler(id_alquiler):
    return jsonify(servicio_alquiler.buscar_alquiler(id_alquiler))

@app.route("/alquileres", methods=["GET"])
def obtener_alquiler_por_cliente():
    id_cliente = request.args.get('id_cliente', type=int)
    if id_cliente:
        return jsonify(servicio_alquiler.buscar_alquileres_por_cliente(id_cliente))
    else:
        return jsonify({"estado": "error", "mensaje": "Falta el parámetro id_cliente"}), 400

@app.route("/alquileres", methods=["POST"])
def crear_alquiler():
    return jsonify(servicio_alquiler.crear_alquiler(request.get_json()))

@app.route("/alquileres/<int:id_alquiler>", methods=["PUT"])
def actualizar_alquiler(id_alquiler):
    return jsonify(servicio_alquiler.actualizar_alquiler(id_alquiler, request.get_json()))

@app.route("/alquileres/<int:id_alquiler>", methods=["DELETE"])
def eliminar_alquiler(id_alquiler):
    return jsonify(servicio_alquiler.eliminar_alquiler(id_alquiler))


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