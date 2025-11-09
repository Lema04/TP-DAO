import sqlite3

class ConexionDB:
    def __init__(self, nombre_bd='bd_alquiler_vehiculos.db'):
        self.nombre_bd = nombre_bd

    def conectar(self):
        return sqlite3.connect(self.nombre_bd)
