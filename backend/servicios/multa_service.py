from datetime import date

from clases.multa import MultaDano
from Crud.multa_crud import MultaCRUD
from Crud.alquiler_crud import AlquilerCRUD 
from servicios.alquiler_service import AlquilerService

class MultaService:
    def __init__(self):
        self.multa_dao = MultaCRUD()
        self.alquiler_dao = AlquilerCRUD()
        self.alquiler_service = AlquilerService() 

    def crear_multa(self, datos):
        """
        datos: dict con claves
        { 'id_alquiler', 'descripcion', 'monto', 'fecha_incidente' }
        """
        try:
            # Para crear una Multa, necesito el objeto Alquiler.
            # Pero el __init__ de Alquiler es complejo...
            # Simplificación: El __init__ de MultaDano SÍ espera un objeto Alquiler.
            # Debemos ensamblarlo.
            
            # 1. Buscamos la fila simple del alquiler
            id_alquiler = datos.get('id_alquiler')
            fila_alquiler_simple = self.alquiler_dao.buscar_por_id_simple(id_alquiler)
            if not fila_alquiler_simple:
                 raise ValueError("Alquiler no encontrado.")
            
            # 2. Ensamblamos el objeto Alquiler completo
            # (fila_simple[0]=id_alquiler, fila_simple[5]=id_empleado, fila_simple[6]=patente, fila_simple[7]=id_cliente)
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