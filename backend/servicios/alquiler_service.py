from datetime import date
from clases.alquiler import Alquiler
from Crud.alquiler_crud import AlquilerCRUD
from Crud.cliente_crud import ClienteCRUD
from Crud.empleado_crud import EmpleadoCRUD
from Crud.vehiculo_crud import VehiculoCRUD
from Crud.reserva_crud import ReservaCRUD

from .excepciones import RecursoNoEncontradoError, DatosInvalidosError, ErrorDeLogicaDeNegocio, ErrorDeAplicacion

class AlquilerService:
    def __init__(self):
        self.alquiler_dao = AlquilerCRUD()
        self.cliente_dao = ClienteCRUD()
        self.empleado_dao = EmpleadoCRUD()
        self.vehiculo_dao = VehiculoCRUD()
        self.reserva_dao = ReservaCRUD()

    def crear_alquiler(self, datos):
        """
        Crea un nuevo alquiler.
        Retorna: El objeto Alquiler recién creado.
        Levanta: DatosInvalidosError, RecursoNoEncontradoError, ErrorDeLogicaDeNegocio.
        """
        try:
            id_cliente = datos.get('id_cliente')
            cliente = self.cliente_dao.buscar_por_id(id_cliente)
            if not cliente:
                raise RecursoNoEncontradoError(f"Cliente con ID {id_cliente} no encontrado.")
            
            patente = datos.get('patente')
            vehiculo = self.vehiculo_dao.buscar_por_id(patente)
            if not vehiculo:
                raise RecursoNoEncontradoError(f"Vehículo con patente {patente} no encontrado.")
            
            if vehiculo.estado == 'Mantenimiento':
                 raise ErrorDeLogicaDeNegocio(f"El vehículo {patente} está en mantenimiento.")
            
            fecha_inicio_str = datos.get('fecha_inicio')
            fecha_fin_str = datos.get('fecha_fin')
            
            if not fecha_inicio_str or not fecha_fin_str:
                 raise DatosInvalidosError("Las fechas de inicio y fin son obligatorias.")

            conflictos_alquiler = self.alquiler_dao.buscar_conflictos(patente, fecha_inicio_str, fecha_fin_str)
            if conflictos_alquiler:
                fechas = [f"{a.fecha_inicio} a {a.fecha_fin}" for a in conflictos_alquiler]
                raise ErrorDeLogicaDeNegocio(f"El vehículo ya está alquilado en las fechas: {', '.join(fechas)}")

            conflictos_reserva = self.reserva_dao.buscar_conflictos(patente, fecha_inicio_str, fecha_fin_str)
            if conflictos_reserva:
                fechas = [f"{r.fecha_inicio_deseada} a {r.fecha_fin_deseada}" for r in conflictos_reserva]
                raise ErrorDeLogicaDeNegocio(f"El vehículo está reservado en las fechas: {', '.join(fechas)}")

            id_empleado = datos.get('id_empleado')
            empleado = self.empleado_dao.buscar_por_id(id_empleado)
            if not empleado:
                raise RecursoNoEncontradoError(f"Empleado con ID {id_empleado} no encontrado.")

            fecha_inicio = date.fromisoformat(datos.get('fecha_inicio'))
            fecha_fin = date.fromisoformat(datos.get('fecha_fin'))
            if fecha_inicio < date.today() or fecha_fin < date.today():
                raise ValueError("La fecha debe ser posterior al dia de hoy")
            
            alquiler = Alquiler(
                id_alquiler=None,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                costo_total=float(datos.get('costo_total', 0.0)),
                fecha_registro=date.today(),
                cliente=cliente,
                empleado=empleado,
                vehiculo=vehiculo
            )
            
            nuevo_id = self.alquiler_dao.crear_alquiler(alquiler)
            vehiculo.marcar_no_disponible()
            self.vehiculo_dao.actualizar_vehiculo(vehiculo)
            
            return self.alquiler_dao.buscar_por_id(nuevo_id)
        
        except (ValueError, TypeError, KeyError) as e:
            raise DatosInvalidosError(f"Datos de entrada inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion):
                raise e
            raise ErrorDeAplicacion(f"Error al crear alquiler: {e}")

    def buscar_alquiler(self, id_alquiler):
        """
        Busca un alquiler por su ID.
        Retorna: El objeto Alquiler.
        Levanta: RecursoNoEncontradoError si no existe.
        """
        try:
            alquiler = self.alquiler_dao.buscar_por_id(id_alquiler)
            if not alquiler:
                raise RecursoNoEncontradoError(f"Alquiler con ID {id_alquiler} no encontrado.")
            return alquiler
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al buscar alquiler: {e}")

    def listar_alquileres(self):
        """ Retorna: Una lista de objetos Alquiler. """
        try:
            return self.alquiler_dao.listar_alquileres()
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al listar alquileres: {e}")

    def buscar_por_cliente(self, id_cliente):
        """ Retorna: Una lista de alquileres para un cliente. """
        try:
            return self.alquiler_dao.buscar_por_cliente(id_cliente)
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al buscar alquileres por cliente: {e}")

    def actualizar_alquiler(self, id_alquiler, datos):
        """
        Actualiza un alquiler.
        Retorna: El objeto Alquiler actualizado.
        Levanta: RecursoNoEncontradoError, DatosInvalidosError.
        """
        try:
            alquiler = self.buscar_alquiler(id_alquiler) 

            if 'fecha_inicio' in datos:
                alquiler.fecha_inicio = date.fromisoformat(datos['fecha_inicio'])
            if 'fecha_fin' in datos:
                alquiler.fecha_fin = date.fromisoformat(datos['fecha_fin'])
            if 'costo_total' in datos:
                alquiler.costo_total = float(datos['costo_total'])
            
            self.alquiler_dao.actualizar_alquiler(alquiler)
            return alquiler
        
        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar alquiler: {e}")
    
    def finalizar_alquiler(self, id_alquiler):
        """
        Finaliza un alquiler y libera el vehículo.
        Retorna: El objeto Alquiler finalizado.
        """
        try:
            alquiler = self.buscar_alquiler(id_alquiler)
            alquiler.finalizar()
            vehiculo = alquiler.vehiculo
            vehiculo.marcar_disponible()
            self.vehiculo_dao.actualizar_vehiculo(vehiculo)
            self.alquiler_dao.actualizar_alquiler(alquiler)
            return alquiler
            
        except ValueError as e:
             raise DatosInvalidosError(f"Error al finalizar alquiler: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al finalizar alquiler: {e}")

    def eliminar_alquiler(self, id_alquiler):
        """
        Elimina un alquiler.
        Retorna: True si fue exitoso.
        Levanta: RecursoNoEncontradoError.
        """
        try:
            alquiler = self.buscar_alquiler(id_alquiler) 
            vehiculo = alquiler.vehiculo
            vehiculo.marcar_disponible()
            self.vehiculo_dao.actualizar_vehiculo(vehiculo)
            self.alquiler_dao.eliminar_alquiler(id_alquiler)
            return True

        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al eliminar alquiler: {e}")
        
    
    def crear_alquiler_desde_reserva(self, reserva, empleado_id, costo_total):
        """
        Crea un alquiler a partir de una reserva.
        Retorna: El objeto Alquiler recién creado.
        Levanta: DatosInvalidosError, RecursoNoEncontradoError, ErrorDeLogicaDeNegocio.
        """

        try:
            empleado = self.empleado_dao.buscar_por_id(empleado_id)
            if not empleado:
                raise RecursoNoEncontradoError(f"Empleado con ID {empleado_id} no encontrado.")
            
            if not reserva.vehiculo:
                raise DatosInvalidosError("La reserva no tiene un vehículo asignado.")
            
            patente = reserva.vehiculo.patente
            vehiculo = self.vehiculo_dao.buscar_por_id(patente)
            if not vehiculo:
                raise RecursoNoEncontradoError(f"Vehículo con patente {patente} no encontrado.")
            
            if vehiculo.estado == "Mantenimiento":
                raise ErrorDeLogicaDeNegocio(f"El vehículo {patente} está en mantenimiento.")
            
            cliente_id = reserva.cliente.id_cliente
            cliente = self.cliente_dao.buscar_por_id(cliente_id)
            if not cliente:
                raise RecursoNoEncontradoError(f"Cliente con ID {cliente_id} no encontrado.")

            alquiler = Alquiler(
                id_alquiler=None,
                fecha_fin=reserva.fecha_fin_deseada,
                fecha_inicio=reserva.fecha_inicio_deseada,
                costo_total=costo_total,
                fecha_registro=date.today(),
                cliente=cliente,
                empleado=empleado,
                vehiculo=vehiculo,
                estado="En Curso"
            )
            nuevo_id = self.alquiler_dao.crear_alquiler(alquiler)
            vehiculo.estado = "Alquilado"
            self.vehiculo_dao.actualizar_vehiculo(vehiculo)
            return self.alquiler_dao.buscar_por_id(nuevo_id)
        
        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de entrada inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion):
                raise e
            raise ErrorDeAplicacion(f"Error al crear alquiler desde reserva: {e}")
        
    def obtener_anios_disponibles(self):
        """ Retorna la lista de años con actividad para filtros de reportes. """
        try:
            anios = self.alquiler_dao.obtener_anios_con_alquileres()
            # Si no hay datos, devolvemos al menos el año actual para que el select no explote
            if not anios:
                return [str(date.today().year)]
            return anios
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al obtener años disponibles: {e}")