from typing import List
from reserva import Reserva
from mantenimiento import Mantenimiento
from alquiler import Alquiler


class Vehiculo:
    def __init__(self, patente: str, marca: str, modelo: str, anio: int,
                 precio_diario: float, estado: str):
        self.patente = patente
        self.marca = marca
        self.modelo = modelo
        self.anio = anio
        self.precio_diario = precio_diario
        self.estado = estado

        self.reservas: List['Reserva'] = []
        self.mantenimientos: List['Mantenimiento'] = []
        self.alquileres: List['Alquiler'] = []
