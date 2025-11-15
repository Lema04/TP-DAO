# --- Archivo: servicios/vehiculo_service.py ---

from Crud.vehiculo_crud import VehiculoCRUD
from clases.vehiculo import Vehiculo
# Importamos las excepciones que usaremos
from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError
)

class VehiculoService:
    def __init__(self):
        self.dao = VehiculoCRUD()

    def crear_vehiculo(self, datos):
        """
        Crea un nuevo vehículo.
        Retorna: El objeto Vehiculo recién creado.
        Levanta: DatosInvalidosError, ErrorDeAplicacion.
        """
        try:
            # La validación de la patente ocurre aquí, en el constructor
            vehiculo = Vehiculo(
                patente=datos.get('patente'),
                marca=datos.get('marca'),
                modelo=datos.get('modelo'),
                anio=int(datos.get('anio')),
                precio_diario=float(datos.get('precio_diario')),
                estado=datos.get('estado', 'Disponible')
            )
            
            # El DAO retorna la patente
            patente_creada = self.dao.crear_vehiculo(vehiculo)
            
            # Retornamos el objeto completo
            return self.dao.buscar_por_id(patente_creada)
        
        except (ValueError, TypeError) as e: 
            # Captura errores del __init__ (patente mal) o de int()/float()
            raise DatosInvalidosError(f"Datos inválidos: {e}")
        except Exception as e:
            # Captura errores del DAO (ej. patente duplicada)
            raise ErrorDeAplicacion(f"Error al crear vehículo: {e}")

    def buscar_vehiculo(self, patente: str):
        """
        Busca un vehículo por patente.
        Retorna: El objeto Vehiculo.
        Levanta: RecursoNoEncontradoError.
        """
        if not patente:
            raise DatosInvalidosError("La patente no puede estar vacía.")
            
        vehiculo = self.dao.buscar_por_id(patente.strip().upper())
        
        if not vehiculo:
            raise RecursoNoEncontradoError(f"Vehículo con patente {patente} no encontrado.")
        
        return vehiculo

    def listar_vehiculos(self):
        """ Retorna: Una lista de objetos Vehiculo. """
        try:
            return self.dao.listar_vehiculos()
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al listar vehículos: {e}")

    def actualizar_vehiculo(self, patente, nuevos_datos):
        """
        Actualiza un vehículo.
        Retorna: El objeto Vehiculo actualizado.
        Levanta: RecursoNoEncontradoError, DatosInvalidosError.
        """
        try:
            # 1. Usamos nuestro propio método para buscar (y validar existencia)
            vehiculo = self.buscar_vehiculo(patente)

            # 2. ¡NO USAR setattr! Actualizamos campos controlados.
            # Esto respeta el Encapsulamiento.
            if 'marca' in nuevos_datos:
                vehiculo.marca = nuevos_datos['marca'].strip()
            if 'modelo' in nuevos_datos:
                vehiculo.modelo = nuevos_datos['modelo'].strip()
            if 'anio' in nuevos_datos:
                vehiculo.anio = int(nuevos_datos['anio'])
            if 'precio_diario' in nuevos_datos:
                vehiculo.precio_diario = float(nuevos_datos['precio_diario'])
            if 'estado' in nuevos_datos:
                vehiculo.estado = nuevos_datos['estado'].strip()

            # 3. Guardamos el objeto modificado
            self.dao.actualizar_vehiculo(vehiculo)
            return vehiculo # Retornamos el objeto actualizado
        
        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar vehículo: {e}")

    def eliminar_vehiculo(self, patente):
        """
        Elimina un vehículo.
        Retorna: True si fue exitoso.
        Levanta: RecursoNoEncontradoError.
        """
        try:
            # 1. Verificamos que exista
            self.buscar_vehiculo(patente) 
            
            # 2. Eliminamos
            self.dao.eliminar_vehiculo(patente)
            return True
        except Exception as e:
            # (El DAO podría levantar un error de FK si el auto está en un alquiler)
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al eliminar vehículo: {e}")