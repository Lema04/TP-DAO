from typing import Optional, TYPE_CHECKING
from datetime import date

if TYPE_CHECKING:
    from .cliente import Cliente
    from .vehiculo import Vehiculo

class Reserva:
    def __init__(self, id_reserva: int, fecha_reserva: date,
                 fecha_inicio_deseada: date, fecha_fin_deseada: date,
                 cliente: "Cliente", vehiculo: Optional["Vehiculo"] = None):

        # Validaciones iniciales
        if cliente is None:
            raise ValueError("Una reserva debe estar asociada a un cliente.")
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

        # Relaciones
        cliente.agregar_reserva(self)
        if vehiculo:
            vehiculo.agregar_reserva(self)
            vehiculo.marcar_no_disponible()
        
        # Representación legible
        def __repr__(self):
            return f"Reserva {self.id_reserva} - Cliente {self.cliente.nombre} {self.cliente.apellido}"

    def a_dict(self):
        return {
            "id_reserva": self.id_reserva,
            "fecha_reserva": self.fecha_reserva.isoformat() if self.fecha_reserva else None,
            "fecha_inicio_deseada": self.fecha_inicio_deseada.isoformat() if self.fecha_inicio_deseada else None,
            "fecha_fin_deseada": self.fecha_fin_deseada.isoformat() if self.fecha_fin_deseada else None,
            "cliente": self.cliente.a_dict() if hasattr(self.cliente, "a_dict") else None,
            "vehiculo": self.vehiculo.a_dict() if self.vehiculo and hasattr(self.vehiculo, "a_dict") else None
        }