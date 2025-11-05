from typing import Optional
from datetime import date
from alquiler import Alquiler

class MultaDano:
    def __init__(self, id_multa: int, descripcion: str, monto: float,
                 fecha_incidente: date, alquiler: Alquiler):

        if alquiler is None:
            raise ValueError("Una multa o daño debe estar asociado a un alquiler.")

        self.id_multa = id_multa
        self.descripcion = descripcion
        self.monto = monto
        self.fecha_incidente = fecha_incidente
        self.alquiler = alquiler

        # Relación bidireccional
        alquiler.agregar_multa(self)