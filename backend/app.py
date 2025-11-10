from flask import Flask, jsonify, request
from servicios.cliente_service import ClienteService
from servicios.empleado_service import EmpleadoService
from servicios.vehiculo_service import VehiculoService
from servicios.alquiler_service import AlquilerService
from servicios.reserva_service import ReservaService
from servicios.multa_service import MultaService
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# --- Instancias de Servicios ---
servicio_cliente = ClienteService()
servicio_empleado = EmpleadoService()
servicio_vehiculo = VehiculoService()
servicio_alquiler = AlquilerService()
servicio_reserva = ReservaService()
servicio_multa = MultaService()

@app.route("/")
def principal():
    return("TP-DA0-2025")

# --- Rutas de Clientes ---
@app.route("/clientes", methods=["GET"])
def listar_clientes():
    return jsonify(servicio_cliente.listar_clientes())
# ... (resto de rutas de cliente) ...

# --- Rutas de Empleados ---
@app.route("/empleados", methods=["GET"])
def listar_empleados():
    return jsonify(servicio_empleado.listar_empleados())
# ... (resto de rutas de empleado) ...

# --- Rutas de Vehículos ---
@app.route("/vehiculos", methods=["GET"])
def listar_vehiculos():
    return jsonify(servicio_vehiculo.listar_vehiculos())

@app.route("/vehiculos", methods=["POST"])
def crear_vehiculo():
    return jsonify(servicio_vehiculo.crear_vehiculo(request.get_json()))

@app.route("/vehiculos/<patente>", methods=["PUT"])
def actualizar_vehiculo(patente):
    return jsonify(servicio_vehiculo.actualizar_vehiculo(patente, request.get_json()))

# --- Rutas de Alquileres ---
@app.route("/alquileres", methods=["GET"])
def listar_alquileres():
    return jsonify(servicio_alquiler.listar_alquileres())

@app.route("/alquileres", methods=["POST"])
def crear_alquiler():
    return jsonify(servicio_alquiler.crear_alquiler(request.get_json()))

# --- Rutas de Reservas ---
@app.route("/reservas", methods=["POST"])
def crear_reserva():
    return jsonify(servicio_reserva.crear_reserva(request.get_json()))

# --- Rutas de Multas ---
@app.route("/multas", methods=["POST"])
def crear_multa():
    return jsonify(servicio_multa.crear_multa(request.get_json()))


if __name__ == "__main__":
    app.run(debug=True)