from orm_base import ORMBase
from clases.reserva import Reserva

class ReservaCRUD(ORMBase):
    tabla = "RESERVA"
    campos = ["patente", "id_cliente", "fecha_reserva", 
              "fecha_inicio_deseada", "fecha_fin_deseada"]
    clave_primaria = "id_reserva"

    def __init__(self):
        super().__init__()

    # Crear una nueva reserva
    def crear_reserva(self, reserva: Reserva):
        valores = [
            reserva.vehiculo.patente if reserva.vehiculo else None,
            reserva.cliente.id_cliente,
            reserva.fecha_reserva,
            reserva.fecha_inicio_deseada,
            reserva.fecha_fin_deseada
        ]
        return self.insertar(valores)
    
    def listar_reservas(self):
        return self.obtener_todos()
    
    def buscar_por_id(self, id_reserva):
        return self.obtener_por_id(id_reserva)
    
    def buscar_por_cliente(self, id_cliente):
        condicion = f"id_cliente = {id_cliente}"
        return self.obtener_por_condicion(condicion)
    
    def actualizar_reserva(self, reserva: Reserva):
        valores = [
            reserva.vehiculo.patente if reserva.vehiculo else None,
            reserva.cliente.id_cliente,
            reserva.fecha_reserva,
            reserva.fecha_inicio_deseada,
            reserva.fecha_fin_deseada
        ]
        self.actualizar(reserva.id_reserva, valores)

    def eliminar_reserva(self, id_reserva):
        self.eliminar(id_reserva)