# --- Archivo: servicios/empleado_service.py ---

from Crud.empleado_crud import EmpleadoCRUD
from clases.empleado import Empleado
# Importamos las excepciones genéricas que ya definimos
from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError
)

class EmpleadoService:
    def __init__(self):
        self.dao = EmpleadoCRUD()

    def crear_empleado(self, datos):
        """
        Crea un nuevo empleado.
        Retorna: El objeto Empleado recién creado.
        Levanta: DatosInvalidosError, ErrorDeAplicacion.
        """
        try:
            id_supervisor = datos.get('id_supervisor')
            empleado = Empleado(
                id_empleado=None,
                nombre=datos.get('nombre'),
                apellido=datos.get('apellido'),
                dni=datos.get('dni'),
                puesto=datos.get('puesto'),
                # Maneja el caso de que id_supervisor sea '' (string vacío) o None
                id_supervisor=int(id_supervisor) if id_supervisor else None 
            )
            
            # El DAO (crear_empleado) ya maneja la validación de DNI duplicado
            nuevo_id = self.dao.crear_empleado(empleado)
            
            # Retornamos el objeto completo
            return self.dao.buscar_por_id(nuevo_id)
        
        except (ValueError, TypeError) as e: 
            # Captura errores de int(), o del DAO (DNI duplicado)
            raise DatosInvalidosError(f"Datos inválidos: {e}")
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al crear empleado: {e}")

    def listar_empleados(self):
        """ Retorna: Una lista de objetos Empleado. """
        try:
            return self.dao.listar_empleados()
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al listar empleados: {e}")

    def buscar_empleado(self, id_empleado):
        """
        Busca un empleado por ID.
        Retorna: El objeto Empleado.
        Levanta: RecursoNoEncontradoError.
        """
        empleado = self.dao.buscar_por_id(id_empleado)
        if not empleado:
            raise RecursoNoEncontradoError(f"Empleado con ID {id_empleado} no encontrado.")
        return empleado

    def actualizar_empleado(self, id_empleado, nuevos_datos):
        """
        Actualiza un empleado.
        Retorna: El objeto Empleado actualizado.
        Levanta: RecursoNoEncontradoError, DatosInvalidosError.
        """
        try:
            # 1. Usamos nuestro propio método para buscar (y validar existencia)
            empleado = self.buscar_empleado(id_empleado)

            # 2. ¡NO USAR setattr! Actualizamos campos controlados.
            if 'nombre' in nuevos_datos:
                empleado.nombre = nuevos_datos['nombre'].strip()
            if 'apellido' in nuevos_datos:
                empleado.apellido = nuevos_datos['apellido'].strip()
            if 'dni' in nuevos_datos:
                empleado.dni = nuevos_datos['dni'].strip()
            if 'puesto' in nuevos_datos:
                empleado.puesto = nuevos_datos['puesto'].strip()
            if 'id_supervisor' in nuevos_datos:
                id_sup = nuevos_datos.get('id_supervisor')
                empleado.id_supervisor = int(id_sup) if id_sup else None

            # 3. Guardamos el objeto modificado
            # (El DAO podría levantar un error de DNI duplicado aquí)
            self.dao.actualizar_empleado(empleado)
            return empleado # Retornamos el objeto actualizado
        
        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar empleado: {e}")

    def eliminar_empleado(self, id_empleado):
        """
        Elimina un empleado.
        Retorna: True si fue exitoso.
        Levanta: RecursoNoEncontradoError.
        """
        try:
            # 1. Verificamos que exista
            self.buscar_empleado(id_empleado) 
            
            # 2. Eliminamos
            self.dao.eliminar_empleado(id_empleado)
            return True
        except Exception as e:
            # (El DAO podría levantar un error de FK si el empleado es supervisor o está en un alquiler)
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al eliminar empleado: {e}")