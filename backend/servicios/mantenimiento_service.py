# --- Archivo: servicios/mantenimiento_service.py ---

from Crud.mantenimiento_crud import MantenimientoCRUD
from clases.mantenimiento import Mantenimiento
from servicios.vehiculo_service import VehiculoService # Usamos el servicio de Vehiculo
from datetime import date
from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError
)

class MantenimientoService:
    def __init__(self):
        self.dao = MantenimientoCRUD()
        # El servicio de Mantenimiento usa el servicio de Vehiculo
        self.vehiculo_service = VehiculoService()

    def crear_mantenimiento(self, datos):
        """
        Crea un nuevo mantenimiento.
        'datos' es un JSON crudo del controlador.
        """
        try:
            # 1. Validar y obtener el Vehiculo (Objeto Compuesto)
            patente = datos.get("patente")
            if not patente:
                raise DatosInvalidosError("La 'patente' del vehículo es obligatoria.")
            # Usamos el servicio para buscarlo (este ya levanta RecursoNoEncontradoError)
            vehiculo = self.vehiculo_service.buscar_vehiculo(patente)
            
            # 2. Validar y convertir datos crudos
            fecha_inicio_str = datos.get("fecha_inicio")
            fecha_fin_str = datos.get("fecha_fin")
            costo_raw = datos.get("costo")
            
            if not fecha_inicio_str or not fecha_fin_str or costo_raw is None:
                raise DatosInvalidosError("Las 'fecha_inicio', 'fecha_fin' y 'costo' son obligatorios.")

            fecha_inicio = date.fromisoformat(fecha_inicio_str)
            fecha_fin = date.fromisoformat(fecha_fin_str)
            costo = float(costo_raw)

            # 3. Crear el objeto Mantenimiento (aquí se valida la lógica de fechas)
            mantenimiento = Mantenimiento(
                id_mantenimiento=None, # El ID es autoincremental
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                tipo_servicio=datos.get("tipo_servicio", ""),
                costo=costo,
                vehiculo=vehiculo # Pasamos el objeto completo
            )

            # 4. Guardar y retornar el objeto recién creado
            nuevo_id = self.dao.crear_mantenimiento(mantenimiento)
            return self.dao.buscar_por_id(nuevo_id)

        except (ValueError, TypeError) as e: 
            # Captura errores de fromisoformat(), float(), o del __init__
            raise DatosInvalidosError(f"Datos inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al crear mantenimiento: {e}")

    # --- MÉTODOS ADICIONALES (FALTANTES) ---

    def listar_mantenimientos(self):
        """ Retorna: Una lista de objetos Mantenimiento. """
        try:
            return self.dao.listar_mantenimientos()
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al listar mantenimientos: {e}")

    def buscar_mantenimiento(self, id_mantenimiento):
        """
        Busca un mantenimiento por ID.
        Retorna: El objeto Mantenimiento.
        Levanta: RecursoNoEncontradoError.
        """
        mantenimiento = self.dao.buscar_por_id(id_mantenimiento)
        if not mantenimiento:
            raise RecursoNoEncontradoError(f"Mantenimiento con ID {id_mantenimiento} no encontrado.")
        return mantenimiento
    
    def buscar_por_vehiculo(self, patente):
        """
        Busca mantenimientos por patente.
        Retorna: Una lista de objetos Mantenimiento.
        Levanta: RecursoNoEncontradoError (si el vehículo no existe).
        """
        # 1. Validamos que el vehículo exista primero
        self.vehiculo_service.buscar_vehiculo(patente)
        # 2. Si existe, buscamos sus mantenimientos
        return self.dao.buscar_por_patente(patente)

    def actualizar_mantenimiento(self, id_mantenimiento, datos):
        """
        Actualiza un mantenimiento.
        Retorna: El objeto Mantenimiento actualizado.
        """
        try:
            # 1. Buscamos el objeto existente
            mantenimiento = self.buscar_mantenimiento(id_mantenimiento)

            # 2. Actualizamos campos (sin 'setattr')
            if 'fecha_inicio' in datos:
                mantenimiento.fecha_inicio = date.fromisoformat(datos['fecha_inicio'])
            if 'fecha_fin' in datos:
                mantenimiento.fecha_fin = date.fromisoformat(datos['fecha_fin'])
            if 'tipo_servicio' in datos:
                mantenimiento.tipo_servicio = datos['tipo_servicio']
            if 'costo' in datos:
                mantenimiento.costo = float(datos['costo'])
            
            # (Validación de fechas en el __init__ se puede re-chequear aquí)
            if mantenimiento.fecha_inicio > mantenimiento.fecha_fin:
                raise DatosInvalidosError("La fecha de inicio no puede ser posterior a la de fin.")

            # 3. Guardamos
            self.dao.actualizar_mantenimiento(mantenimiento)
            return mantenimiento

        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar mantenimiento: {e}")

    def eliminar_mantenimiento(self, id_mantenimiento):
        """
        Elimina un mantenimiento.
        Retorna: True si fue exitoso.
        """
        self.buscar_mantenimiento(id_mantenimiento) # Asegura que existe
        try:
            self.dao.eliminar_mantenimiento(id_mantenimiento)
            return True
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al eliminar mantenimiento: {e}")