from flask import Flask, jsonify, request
from flask_cors import CORS

from servicios.cliente_service import ClienteService

app = Flask(__name__)
CORS(app)  # permite que React (localhost:3000) acceda a la API

servicio = ClienteService()

@app.route("/clientes", methods=["GET"])
def listar_clientes():
    return jsonify(servicio.listar_clientes())

@app.route("/clientes", methods=["POST"])
def crear_cliente():
    datos = request.get_json()
    return jsonify(servicio.crear_cliente(datos))

@app.route("/clientes/buscar", methods=["GET"])
def buscar_cliente():
    valor = request.args.get("q", "")
    return jsonify(servicio.buscar_clientes(valor))

if __name__ == "__main__":
    app.run(debug=True)
