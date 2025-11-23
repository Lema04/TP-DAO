from typing import Optional, TYPE_CHECKING
from datetime import date

if TYPE_CHECKING:
    from .cliente import Cliente
    from .vehiculo import Vehiculo

class Reserva:
    def __init__(self, id_reserva: int, fecha_reserva: date,
                 fecha_inicio_deseada: date, fecha_fin_deseada: date,
                 cliente: "Cliente", vehiculo: Optional["Vehiculo"] = None,
                 estado: str = "Pendiente"):

        # Validaciones iniciales
        if cliente is None:
            raise ValueError("Una reserva debe estar asociada a un cliente.")
        if fecha_fin_deseada < fecha_inicio_deseada:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        if fecha_inicio_deseada < fecha_reserva:
             raise ValueError("La fecha de inicio deseada no puede ser anterior a la fecha de reserva.")
        if (fecha_inicio_deseada - date.today()) > 3:
            raise ValueError("La fecha de inicio deseada debe ser al menos 3 dias desde la fecha de reserva.")

        self.id_reserva = id_reserva
        self.fecha_reserva = fecha_reserva
        self.fecha_inicio_deseada = fecha_inicio_deseada
        self.fecha_fin_deseada = fecha_fin_deseada
        self.cliente = cliente
        self.vehiculo = vehiculo
        self.estado = estado  # "Pendiente", "Confirmada", "Cancelada", "Convertida"

        # Relaciones
        cliente.agregar_reserva(self)
        if vehiculo and vehiculo.estado == "Disponible":
            vehiculo.agregar_reserva(self)
            vehiculo.estado = "Reservado"
        
    # Representación legible
    def __repr__(self):
        return f"Reserva {self.id_reserva} - Cliente {self.cliente.nombre} {self.cliente.apellido}"

    def a_dict(self):
        return {
            "id_reserva": self.id_reserva,
            "fecha_reserva": self.fecha_reserva.isoformat() if self.fecha_reserva else None,
            "fecha_inicio_deseada": self.fecha_inicio_deseada.isoformat() if self.fecha_inicio_deseada else None,
            "fecha_fin_deseada": self.fecha_fin_deseada.isoformat() if self.fecha_fin_deseada else None,
            "estado": self.estado,
            "id_cliente": self.cliente.id_cliente if self.cliente else None,
            "patente": self.vehiculo.patente if self.vehiculo else None,
            "cliente": self.cliente.a_dict() if hasattr(self.cliente, "a_dict") else None,
            "vehiculo": self.vehiculo.a_dict() if self.vehiculo and hasattr(self.vehiculo, "a_dict") else None
        }