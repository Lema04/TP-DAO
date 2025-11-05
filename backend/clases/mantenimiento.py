from typing import Optional
from datetime import date

from vehiculo import Vehiculo

class Mantenimiento:
    def __init__(self, id_mantenimiento: int, patente: str,
                 fecha_inicio: date, fecha_fin: date,
                 tipo_servicio: str, costo: float):
        self.id_mantenimiento = id_mantenimiento
        self.patente = patente
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.tipo_servicio = tipo_servicio
        self.costo = costo

        # Relaciones
        self.vehiculo: Optional[Vehiculo] = None