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

        # Relaciones
        self.reservas: List[Reserva] = []
        self.alquileres: List[Alquiler] = []

    def agregar_reserva(self, reserva: Reserva):
        if reserva not in self.reservas:
            self.reservas.append(reserva)

    def agregar_alquiler(self, alquiler: Alquiler):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)

    # para cdo se hace un print, ver
    # def __repr__(self):
    #     return f"Cliente({self.nombre} {self.apellido})"
