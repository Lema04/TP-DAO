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
        # --- Getter/Setter para descripcion ---
    @property
    def descripcion(self):
        return self._descripcion

    @descripcion.setter
    def descripcion(self, valor: str):
        if not valor or not valor.strip():
            raise ValueError("La descripción de la multa no puede estar vacía.")
        self._descripcion = valor.strip()

    # --- Getter/Setter para monto ---
    @property
    def monto(self):
        return self._monto

    @monto.setter
    def monto(self, valor: float):
        if not isinstance(valor, (int, float)) or valor <= 0:
            raise ValueError("El monto de la multa debe ser un número positivo.")
        self._monto = valor

