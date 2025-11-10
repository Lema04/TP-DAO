# servicios/alquiler_service.py

from datetime import date
from ..clases.alquiler import Alquiler
from ..Crud import AlquilerCRUD
from ..Crud import ClienteCRUD
from ..Crud import EmpleadoCRUD
from ..Crud import VehiculoCRUD

class AlquilerService:
    def __init__(self):
        self.alquiler_dao = AlquilerCRUD()
        # El Servicio de Alquiler NECESITA los DAOs de sus dependencias
        self.cliente_dao = ClienteCRUD()
        self.empleado_dao = EmpleadoCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    def crear_alquiler(self, datos):
        """
        datos: dict con claves
        { 'id_cliente', 'patente', 'id_empleado', 
          'fecha_inicio', 'fecha_fin', 'costo_total' }
        """
        try:
            # 1. Buscar los objetos completos
            cliente = self.cliente_dao.buscar_por_id(datos.get('id_cliente'))
            if not cliente:
                raise ValueError("Cliente no encontrado.")
                
            vehiculo = self.vehiculo_dao.buscar_por_id(datos.get('patente'))
            if not vehiculo:
                raise ValueError("Vehículo no encontrado.")
                
            empleado = self.empleado_dao.buscar_por_id(datos.get('id_empleado'))
            if not empleado:
                raise ValueError("Empleado no encontrado.")

            # 2. Crear el objeto Alquiler (aquí se validan fechas y costo)
            alquiler = Alquiler(
                id_alquiler=None,
                fecha_inicio=date.fromisoformat(datos.get('fecha_inicio')),
                fecha_fin=date.fromisoformat(datos.get('fecha_fin')),
                costo_total=float(datos.get('costo_total', 0.0)),
                fecha_registro=date.today(),
                cliente=cliente,
                empleado=empleado,
                vehiculo=vehiculo
            )
            
            # 3. Guardar el alquiler (el CRUD extraerá los IDs)
            nuevo_id = self.alquiler_dao.crear_alquiler(alquiler)
            
            # Opcional: Actualizar el estado del vehículo
            vehiculo.marcar_no_disponible()
            self.vehiculo_dao.actualizar_vehiculo(vehiculo)
            
            return {"estado": "ok", "mensaje": f"Alquiler creado con ID {nuevo_id}."}
        
        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear alquiler: {e}"}

    def listar_alquileres(self):
        try:
            # Esto devuelve una lista de tuplas con los IDs,
            # lo cual es rápido y está bien para una API.
            alquileres = self.alquiler_dao.listar_alquileres()
            return {"estado": "ok", "data": alquileres}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar alquileres: {e}"}