from typing import Optional
from datetime import date

from vehiculo import Vehiculo

class Mantenimiento:
    def __init__(self, id_mantenimiento: int, fecha_inicio: date, fecha_fin: date,
                 tipo_servicio: str, costo: float, vehiculo: Vehiculo):

        if vehiculo is None:
            raise ValueError("Un mantenimiento debe estar asociado a un vehículo.")

        self.id_mantenimiento = id_mantenimiento
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.tipo_servicio = tipo_servicio
        self.costo = costo
        self.vehiculo = vehiculo

        # Relación bidireccional
        vehiculo.agregar_mantenimiento(self)