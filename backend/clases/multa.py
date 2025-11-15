from typing import TYPE_CHECKING
from datetime import date

if TYPE_CHECKING:
    from .alquiler import Alquiler

class MultaDano:
    def __init__(self, id_multa: int, descripcion: str, monto: float,
                 fecha_incidente: date, alquiler: "Alquiler"):

        # Validaciones iniciales
        if alquiler is None:
            raise ValueError("Una multa o daño debe estar asociado a un alquiler.")

        self.id_multa = id_multa
        self.descripcion = descripcion
        self.monto = monto
        self.fecha_incidente = fecha_incidente
        self.alquiler = alquiler

        # Relaciones
        alquiler.agregar_multa(self)
    
    # Propiedades con validación
    @property
    def descripcion(self):
        return self._descripcion

    @descripcion.setter
    def descripcion(self, valor: str):
        if not valor or not valor.strip():
            raise ValueError("La descripción de la multa no puede estar vacía.")
        self._descripcion = valor.strip()

    @property
    def monto(self):
        return self._monto

    @monto.setter
    def monto(self, valor: float):
        if not isinstance(valor, (int, float)) or valor <= 0:
            raise ValueError("El monto de la multa debe ser un número positivo.")
        self._monto = valor
    
    # Representación legible
    def __repr__(self):
        return (f"Multa {self.id_multa} - Alquiler {self.alquiler.id_alquiler}")

    def a_dict(self):
        return {
            "id_multa": self.id_multa,
            "descripcion": self.descripcion,
            "monto": self.monto,
            "fecha_incidente": self.fecha_incidente.isoformat() if self.fecha_incidente else None,
            # Evitar recursión profunda: incluir sólo referencia al alquiler
            "alquiler": {"id_alquiler": getattr(self.alquiler, "id_alquiler", None)}
        }