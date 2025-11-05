from typing import List, Optional
from datetime import date

from cliente import Cliente
from vehiculo import Vehiculo

class Reserva:
    def __init__(self, id_reserva: int, patente: str, id_cliente: int,
                 fecha_reserva: date, fecha_inicio_deseada: date, fecha_fin_deseada: date):
        self.id_reserva = id_reserva
        self.patente = patente
        self.id_cliente = id_cliente
        self.fecha_reserva = fecha_reserva
        self.fecha_inicio_deseada = fecha_inicio_deseada
        self.fecha_fin_deseada = fecha_fin_deseada

        # Relaciones
        self.cliente: Optional[Cliente] = None
        self.vehiculo: Optional[Vehiculo] = None