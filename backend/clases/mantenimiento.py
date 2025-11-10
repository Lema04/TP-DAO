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

    # --- Getter/Setter para tipo_servicio ---
    @property
    def tipo_servicio(self):
        return self._tipo_servicio

    @tipo_servicio.setter
    def tipo_servicio(self, valor: str):
        if not valor or not valor.strip():
            raise ValueError("El tipo de servicio no puede estar vacío.")
        self._tipo_servicio = valor.strip()

    # --- Getter/Setter para costo ---
    @property
    def costo(self):
        return self._costo

    @costo.setter
    def costo(self, valor: float):
        if not isinstance(valor, (int, float)) or valor < 0:
            raise ValueError("El costo del mantenimiento no puede ser negativo.")
        self._costo = valor