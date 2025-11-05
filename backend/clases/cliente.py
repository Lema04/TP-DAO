from typing import List
from alquiler import Alquiler
from reserva import Reserva

class Cliente:
    def __init__(self, id_cliente: int, nombre: str, apellido: str, dni: str,
                 direccion: str, telefono: str, email: str):
        self.id_cliente = id_cliente
        self.nombre = nombre
        self.apellido = apellido
        self.dni = dni
        self.direccion = direccion
        self.telefono = telefono
        self.email = email

        # Son typehints pero pueden no estar
        self.alquileres: List['Alquiler'] = []
        self.reservas: List['Reserva'] = []

    # para cdo se hace un print, ver
    # def __repr__(self):
    #     return f"Cliente({self.nombre} {self.apellido})"
