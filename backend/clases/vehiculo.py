from typing import List
from reserva import Reserva
from mantenimiento import Mantenimiento
from alquiler import Alquiler


class Vehiculo:
    def __init__(self, patente: str, marca: str, modelo: str, anio: int,
                 precio_diario: float, estado: str = "Disponible"):
        self.patente = patente
        self.marca = marca
        self.modelo = modelo
        self.anio = anio
        self.precio_diario = precio_diario
        self.estado = estado

        # Relaciones
        self.reservas: List[Reserva] = []
        self.alquileres: List[Alquiler] = []
        self.mantenimientos: List[Mantenimiento] = []

    def marcar_no_disponible(self):
        self.estado = "No disponible"

    def marcar_disponible(self):
        self.estado = "Disponible"

    def agregar_reserva(self, reserva: Reserva):
        if reserva not in self.reservas:
            self.reservas.append(reserva)

    def agregar_alquiler(self, alquiler: Alquiler):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)

    def agregar_mantenimiento(self, mantenimiento: Mantenimiento):
        if mantenimiento not in self.mantenimientos:
            self.mantenimientos.append(mantenimiento)
