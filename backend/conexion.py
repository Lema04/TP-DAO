import sqlite3, os

# Subimos un nivel: de /servicios a /backend
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "bd_alquiler_vehiculos.db")

class ConexionDB:
    def __init__(self, nombre_bd=DB_PATH):
        self.nombre_bd = nombre_bd

    def conectar(self):
        print(f"[DEBUG] Conectando a la base de datos: {self.nombre_bd}")
        return sqlite3.connect(self.nombre_bd)
