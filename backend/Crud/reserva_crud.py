from servicios.orm_base import ORMBase
from clases.reserva import Reserva

class ReservaCRUD(ORMBase):
    tabla = "RESERVA"
    campos = ["patente", "id_cliente", "fecha_reserva", 
              "fecha_inicio_deseada", "fecha_fin_deseada"]
    clave_primaria = "id_reserva"

    def __init__(self):
        super().__init__()

    def crear_reserva(self, reserva: Reserva):
        valores = [
            reserva.vehiculo.patente if reserva.vehiculo else None,
            reserva.cliente.id_cliente,
            reserva.fecha_reserva,
            reserva.fecha_inicio_deseada,
            reserva.fecha_fin_deseada
        ]
        return self.insertar(valores)