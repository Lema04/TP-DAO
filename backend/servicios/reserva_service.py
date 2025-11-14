from datetime import date

from clases.reserva import Reserva
from Crud.reserva_crud import ReservaCRUD
from Crud.cliente_crud import ClienteCRUD
from Crud.vehiculo_crud import VehiculoCRUD

class ReservaService:
    def __init__(self):
        self.reserva_dao = ReservaCRUD()
        self.cliente_dao = ClienteCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    # Crear una nueva reserva
    def crear_reserva(self, datos):
        """
        datos: dict con claves
        { 'id_cliente', 'patente' (opcional), 
          'fecha_inicio_deseada', 'fecha_fin_deseada' }
        """
        try:
            cliente = self.cliente_dao.buscar_por_id(datos.get('id_cliente'))
            if not cliente:
                raise ValueError("Cliente no encontrado.")
            
            vehiculo = None
            if datos.get('patente'):
                vehiculo = self.vehiculo_dao.buscar_por_id(datos.get('patente'))
                if not vehiculo:
                    raise ValueError("Vehículo no encontrado.")

            reserva = Reserva(
                id_reserva=None,
                fecha_reserva=date.today(),
                fecha_inicio_deseada=date.fromisoformat(datos.get('fecha_inicio_deseada')),
                fecha_fin_deseada=date.fromisoformat(datos.get('fecha_fin_deseada')),
                cliente=cliente,
                vehiculo=vehiculo
            )
            
            nuevo_id = self.reserva_dao.crear_reserva(reserva)
            return {"estado": "ok", "mensaje": f"Reserva creada con ID {nuevo_id}."}
        
        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear reserva: {e}"}
        
    def listar_reservas(self):
        try:
            reservas = self.reserva_dao.listar_reservas()
            return {"estado": "ok", "data": reservas}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar reservas: {e}"}
    
    def buscar_reserva(self, id_reserva):
        try:
            reserva = self.reserva_dao.buscar_por_id(id_reserva)
            if reserva:
                return {"estado": "ok", "data": reserva}
            else:
                return {"estado": "error", "mensaje": "Reserva no encontrada."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar reserva: {e}"}
        
    def actualizar_reserva(self, id_reserva, datos):
        try:
            reserva = self.reserva_dao.buscar_por_id(id_reserva)
            if not reserva:
                return {"estado": "error", "mensaje": "Reserva no encontrada."}
            reserva.fecha_inicio_deseada = date.fromisoformat(datos.get("fecha_inicio_deseada", reserva.fecha_inicio_desesada.isoformat()))
            reserva.fecha_fin_deseada = date.fromisoformat(datos.get("fecha_fin_deseada", reserva.fecha_fin_deseada.isoformat()))
            reserva.vehiculo = self.vehiculo_dao.buscar_por_id(datos.get("patente")) if datos.get("patente") else reserva.vehiculo
            self.reserva_dao.actualizar_reserva(reserva)
            return {"estado": "ok", "mensaje": "Reserva actualizada correctamente."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar reserva: {e}"}
        
    def eliminar_reserva(self, id_reserva):
        try:
            reserva = self.reserva_dao.buscar_por_id(id_reserva)
            if not reserva:
                return {"estado": "error", "mensaje": "Reserva no encontrada."}
            self.reserva_dao.eliminar_reserva(id_reserva)
            return {"estado": "ok", "mensaje": "Reserva eliminada correctamente."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al eliminar reserva: {e}"}