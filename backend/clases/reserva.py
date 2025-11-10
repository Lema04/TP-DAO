from typing import List, Optional, TYPE_CHECKING
from datetime import date

if TYPE_CHECKING:
    from .cliente import Cliente
    from .vehiculo import Vehiculo

class Reserva:
    def __init__(self, id_reserva: int, fecha_reserva: date,
                 fecha_inicio_deseada: date, fecha_fin_deseada: date,
                 cliente: "Cliente", vehiculo: Optional["Vehiculo"] = None):

        if cliente is None:
            raise ValueError("Una reserva debe estar asociada a un cliente.")
        # Validación de fechas cruzadas
        if fecha_fin_deseada < fecha_inicio_deseada:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        
        if fecha_inicio_deseada < fecha_reserva:
             raise ValueError("La fecha de inicio deseada no puede ser anterior a la fecha de reserva.")

        self.id_reserva = id_reserva
        self.fecha_reserva = fecha_reserva
        self.fecha_inicio_deseada = fecha_inicio_deseada
        self.fecha_fin_deseada = fecha_fin_deseada
        self.cliente = cliente
        self.vehiculo = vehiculo

        # Relaciones bidireccionales
        cliente.agregar_reserva(self)
        if vehiculo:
            vehiculo.agregar_reserva(self)
            vehiculo.marcar_no_disponible()