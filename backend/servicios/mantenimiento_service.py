from Crud.mantenimiento_crud import MantenimientoCRUD
from clases.mantenimiento import Mantenimiento
from servicios.vehiculo_service import VehiculoService

from datetime import date
from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError
)

class MantenimientoService:
    def __init__(self):
        self.dao = MantenimientoCRUD()
        self.vehiculo_service = VehiculoService()

    def crear_mantenimiento(self, datos):
        """
        Crea un nuevo mantenimiento.
        'datos' es un JSON crudo del controlador.
        """
        try:
            patente = datos.get("patente")
            if not patente:
                raise DatosInvalidosError("La 'patente' del vehículo es obligatoria.")
            
            vehiculo = self.vehiculo_service.buscar_vehiculo(patente)

            if vehiculo.estado == "Alquilado":
                raise DatosInvalidosError("No se puede realizar mantenimiento mientras el vehículo esté alquilado.")
            
            fecha_inicio_str = datos.get("fecha_inicio")
            fecha_fin_str = datos.get("fecha_fin")
            costo_raw = datos.get("costo")
            
            if not fecha_inicio_str or not fecha_fin_str or costo_raw is None:
                raise DatosInvalidosError("Las 'fecha_inicio', 'fecha_fin' y 'costo' son obligatorios.")

            fecha_inicio = date.fromisoformat(fecha_inicio_str)
            fecha_fin = date.fromisoformat(fecha_fin_str)
            costo = float(costo_raw)

            if vehiculo.estado == "Reservado":
                reserva = vehiculo.reservas[-1]
                if reserva.fecha_inicio_deseada <= fecha_fin or reserva.fecha_fin_deseada >= fecha_inicio:
                    raise DatosInvalidosError("No se puede realizar mantenimiento mientras el vehículo está alquilado")

            mantenimiento = Mantenimiento(
                id_mantenimiento=None,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                tipo_servicio=datos.get("tipo_servicio", ""),
                costo=costo,
                vehiculo=vehiculo,
                estado="En curso"
            )

            self.vehiculo_service.actualizar_vehiculo(vehiculo.patente, {"estado": "Mantenimiento"})

            nuevo_id = self.dao.crear_mantenimiento(mantenimiento)
            vehiculo.agregar_mantenimiento(mantenimiento)
            return self.dao.buscar_por_id(nuevo_id)

        except (ValueError, TypeError) as e: 
            raise DatosInvalidosError(f"Datos inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al crear mantenimiento: {e}")

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
        vehiculo = self.vehiculo_service.buscar_vehiculo(patente)
        if not vehiculo:
            raise RecursoNoEncontradoError(f"Vehículo con patente {patente} no encontrado.")
        return self.dao.buscar_por_patente(patente)

    def actualizar_mantenimiento(self, id_mantenimiento, datos):
        """
        Actualiza un mantenimiento.
        Retorna: El objeto Mantenimiento actualizado.
        """
        try:
            mantenimiento = self.buscar_mantenimiento(id_mantenimiento)
            if not mantenimiento:
                raise RecursoNoEncontradoError(f"Mantenimiento con ID {id_mantenimiento} no encontrado.")

            if 'fecha_inicio' in datos:
                mantenimiento.fecha_inicio = date.fromisoformat(datos['fecha_inicio'])
            if 'fecha_fin' in datos:
                mantenimiento.fecha_fin = date.fromisoformat(datos['fecha_fin'])
            if 'tipo_servicio' in datos:
                mantenimiento.tipo_servicio = datos['tipo_servicio']
            if 'costo' in datos:
                mantenimiento.costo = float(datos['costo'])
            
            if mantenimiento.fecha_inicio > mantenimiento.fecha_fin:
                raise DatosInvalidosError("La fecha de inicio no puede ser posterior a la de fin.")

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
        self.buscar_mantenimiento(id_mantenimiento)
        try:
            self.dao.eliminar_mantenimiento(id_mantenimiento)
            return True
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al eliminar mantenimiento: {e}")