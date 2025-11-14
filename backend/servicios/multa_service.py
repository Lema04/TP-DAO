from datetime import date

from clases.multa import MultaDano
from clases.alquiler import Alquiler
from Crud.multa_crud import MultaCRUD
from Crud.alquiler_crud import AlquilerCRUD 
from servicios.alquiler_service import AlquilerService

class MultaService:
    def __init__(self):
        self.multa_dao = MultaCRUD()
        self.alquiler_dao = AlquilerCRUD()
        self.alquiler_service = AlquilerService() 

    # Crear una nueva multa por daño
    def crear_multa(self, datos):
        """
        datos: dict con claves
        { 'id_alquiler', 'descripcion', 'monto', 'fecha_incidente' }
        """
        try:
            # 1. Buscamos la fila simple del alquiler
            id_alquiler = datos.get('id_alquiler')
            fila_alquiler_simple = self.alquiler_dao.buscar_por_id(id_alquiler)
            if not fila_alquiler_simple:
                 raise ValueError("Alquiler no encontrado.")
            
            # 2. Ensamblamos el objeto Alquiler completo
            cliente = self.alquiler_service.cliente_dao.buscar_por_id(fila_alquiler_simple[7])
            empleado = self.alquiler_service.empleado_dao.buscar_por_id(fila_alquiler_simple[5])
            vehiculo = self.alquiler_service.vehiculo_dao.buscar_por_id(fila_alquiler_simple[6])

            alquiler_obj = Alquiler(
                id_alquiler=fila_alquiler_simple[0],
                fecha_inicio=fila_alquiler_simple[1],
                fecha_fin=fila_alquiler_simple[2],
                costo_total=fila_alquiler_simple[3],
                fecha_registro=fila_alquiler_simple[4],
                empleado=empleado,
                vehiculo=vehiculo,
                cliente=cliente
            )

            # 3. Ahora sí, creamos la Multa
            multa = MultaDano(
                id_multa=None,
                descripcion=datos.get('descripcion', '').strip(),
                monto=float(datos.get('monto', 0.0)),
                fecha_incidente=date.fromisoformat(datos.get('fecha_incidente')),
                alquiler=alquiler_obj
            )
            
            nuevo_id = self.multa_dao.crear_multa(multa)
            return {"estado": "ok", "mensaje": f"Multa creada con ID {nuevo_id}."}
        
        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear multa: {e}"}
    
    # Buscar multas por daño existentes por el ID de un cliente
    def buscar_multas_por_id_cliente(self, id_cliente: int):
        try:
            multas = self.multa_dao.buscar_por_id_cliente(id_cliente)
            return {"estado": "ok", "data": multas}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar multas: {e}"}
    
    # Buscar multas por daño existentes por la patente de un vehículo
    def buscar_multas_por_patente(self, patente: str):
        try:
            multas = self.multa_dao.buscar_por_patente(patente)
            return {"estado": "ok", "data": multas}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar multas: {e}"}
        
    # def actualizar_multa(self, id_multa: int, datos):
    #     try:
    #         multa = self.multa_dao.obtener_por_id(id_multa)
    #         if not multa:
    #             return {"estado": "error", "mensaje": "Multa no encontrada."}
            
    def eliminar_multa(self, id_multa: int):
        try:
            multa = self.multa_dao.obtener_por_id(id_multa)
            if not multa:
                return {"estado": "error", "mensaje": "Multa no encontrada."}
            self.multa_dao.eliminar(id_multa)
            return {"estado": "ok", "mensaje": "Multa eliminada correctamente."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al eliminar multa: {e}"}