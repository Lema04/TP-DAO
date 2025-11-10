import sqlite3
import os

# Ruta absoluta a la base real
DB_PATH = os.path.join(os.path.dirname(__file__), "bd_alquiler_vehiculos.db")

class ConexionDB:
    def __init__(self, nombre_bd=DB_PATH):
        self.nombre_bd = nombre_bd

    def conectar(self):
        return sqlite3.connect(self.nombre_bd)
