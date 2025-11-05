from typing import Optional
from datetime import date
from alquiler import Alquiler

class MultaDano:
    def __init__(self, id_multa: int, id_alquiler: int,
                 descripcion: str, monto: float, fecha_incidente: date):
        self.id_multa = id_multa
        self.id_alquiler = id_alquiler
        self.descripcion = descripcion
        self.monto = monto
        self.fecha_incidente = fecha_incidente

        # Relaciones
        self.alquiler: Optional[Alquiler] = None