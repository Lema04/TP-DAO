# servicios/empleado_service.py

from Crud.empleado_crud import EmpleadoCRUD
from clases.empleado import Empleado

class EmpleadoService:
    def __init__(self):
        self.dao = EmpleadoCRUD()

    def crear_empleado(self, datos):
        """
        datos: dict con claves
        { 'nombre', 'apellido', 'dni', 'puesto', 'id_supervisor' }
        """
        try:
            empleado = Empleado(
                id_empleado=None,
                nombre=datos.get('nombre', '').strip(),
                apellido=datos.get('apellido', '').strip(),
                dni=datos.get('dni', '').strip(),
                puesto=datos.get('puesto', '').strip(),
                id_supervisor=datos.get('id_supervisor') 
            )
            
            nuevo_id = self.dao.crear_empleado(empleado)
            return {"estado": "ok", "mensaje": f"Empleado creado con ID {nuevo_id}."}
        
        except ValueError as e: 
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear empleado: {e}"}

    def listar_empleados(self):
        try:
            empleados = self.dao.listar_empleados()
            return {"estado": "ok", "data": empleados}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar empleados: {e}"}

    def actualizar_empleado(self, id_empleado, nuevos_datos):
        try:
            empleado = self.dao.buscar_por_id(id_empleado)
            if not empleado:
                return {"estado": "error", "mensaje": "Empleado no encontrado."}

            for clave, valor in nuevos_datos.items():
                if hasattr(empleado, clave):
                    # Aquí se disparan los setters (@property) y se valida
                    setattr(empleado, clave, valor) 

            self.dao.actualizar_empleado(empleado)
            return {"estado": "ok", "mensaje": "Empleado actualizado."}
        
        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al actualizar empleado: {e}"}

    def eliminar_empleado(self, id_empleado):
        try:
            self.dao.eliminar_empleado(id_empleado)
            return {"estado": "ok", "mensaje": "Empleado eliminado."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al eliminar empleado: {e}"}