from datetime import date

from clases.alquiler import Alquiler
from Crud.alquiler_crud import AlquilerCRUD
from Crud.cliente_crud import ClienteCRUD
from Crud.empleado_crud import EmpleadoCRUD
from Crud.vehiculo_crud import VehiculoCRUD

class AlquilerService:
    def __init__(self):
        self.alquiler_dao = AlquilerCRUD()
        self.cliente_dao = ClienteCRUD()
        self.empleado_dao = EmpleadoCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    # Crear un nuevo alquiler
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
        
    def buscar_alquiler(self, id_alquiler):
        try:
            alquiler = self.alquiler_dao.buscar_por_id(id_alquiler)
            if alquiler:
                return {"estado": "ok", "data": alquiler}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar alquiler: {e}"}
    
    # Listar todos los alquileres
    def listar_alquileres(self):
        try:
            alquileres = self.alquiler_dao.listar_alquileres()
            return {"estado": "ok", "data": alquileres}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar alquileres: {e}"}
    
    # Buscar alquileres por ID de cliente
    def buscar_por_cliente(self, id_cliente):
        try:
            alquileres = self.alquiler_dao.buscar_por_cliente(id_cliente)
            if not alquileres:
                return {"estado": "error", "mensaje": "No se encontraron alquileres para el cliente dado."}
            return {"estado": "ok", "data": alquileres}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar alquileres por cliente: {e}"}
        
    def actualizar_alquiler(self, id_alquiler, datos):
        try:
            alquiler = self.alquiler_dao.buscar_por_id(id_alquiler)
            if not alquiler:
                return {"estado": "error", "mensaje": "Alquiler no encontrado."}
            alquiler.fecha_inicio = date.fromisoformat(datos.get('fecha_inicio', alquiler.fecha_inicio.isoformat()))
            alquiler.fecha_fin = date.fromisoformat(datos.get('fecha_fin', alquiler.fecha_fin.isoformat()))
            alquiler.costo_total = float(datos.get('costo_total', alquiler.costo_total))
            self.alquiler_dao.actualizar_alquiler(alquiler)
            return {"estado": "ok", "mensaje": "Alquiler actualizado correctamente."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al actualizar alquiler: {e}"}
        
    def eliminar_alquiler(self, id_alquiler):
        try:
            alquiler = self.alquiler_dao.buscar_por_id(id_alquiler)
            if not alquiler:
                return {"estado": "error", "mensaje": "Alquiler no encontrado."}
            self.alquiler_dao.eliminar_alquiler(id_alquiler)
            return {"estado": "ok", "mensaje": "Alquiler eliminado correctamente."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al eliminar alquiler: {e}"}
            