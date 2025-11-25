from datetime import date
from clases.reserva import Reserva
from Crud.reserva_crud import ReservaCRUD

from servicios.cliente_service import ClienteService
from servicios.vehiculo_service import VehiculoService
from servicios.alquiler_service import AlquilerService

from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError,
    ErrorDeLogicaDeNegocio
)

class ReservaService:
    def __init__(self):
        self.reserva_dao = ReservaCRUD()
        self.cliente_service = ClienteService()
        self.vehiculo_service = VehiculoService()
        self.alquiler_service = AlquilerService()

    def crear_reserva(self, datos):
        """
        Crea una nueva reserva.
        Retorna: El objeto Reserva recién creado.
        """
        try:
            id_cliente = datos.get('id_cliente')
            if not id_cliente:
                raise DatosInvalidosError("El 'id_cliente' es obligatorio.")
            cliente = self.cliente_service.buscar_cliente(id_cliente)

            fecha_inicio_str = datos.get('fecha_inicio_deseada')
            fecha_fin_str = datos.get('fecha_fin_deseada')
            if not fecha_inicio_str or not fecha_fin_str:
                raise DatosInvalidosError("Las 'fecha_inicio_deseada' y 'fecha_fin_deseada' son obligatorias.")
            
            vehiculo = None
            patente = datos.get('patente')
            if patente:
                vehiculo = self.vehiculo_service.buscar_vehiculo(patente)

                if not vehiculo:
                    raise RecursoNoEncontradoError(f"Vehículo con patente {patente} no encontrado")

                if vehiculo.estado == "Mantenimiento":
                    raise ErrorDeLogicaDeNegocio(f"El vehículo {patente} está en mantenimiento.")
                
                conflictos_reserva = self.reserva_dao.buscar_conflictos(patente, fecha_inicio_str, fecha_fin_str)
                if conflictos_reserva:
                    fechas = [f"{r.fecha_inicio_deseada} a {r.fecha_fin_deseada}" for r in conflictos_reserva]
                    raise ErrorDeLogicaDeNegocio(f"El vehículo ya está reservado en las fechas: {', '.join(fechas)}")

                conflictos_alquiler = self.alquiler_service.alquiler_dao.buscar_conflictos(patente, fecha_inicio_str, fecha_fin_str)
                if conflictos_alquiler:
                    fechas = [f"{a.fecha_inicio} a {a.fecha_fin}" for a in conflictos_alquiler]
                    raise ErrorDeLogicaDeNegocio(f"El vehículo está alquilado en las fechas: {', '.join(fechas)}")

            reserva = Reserva(
                id_reserva=None,
                fecha_reserva=date.today(),
                fecha_inicio_deseada=date.fromisoformat(fecha_inicio_str),
                fecha_fin_deseada=date.fromisoformat(fecha_fin_str),
                cliente=cliente,
                vehiculo=vehiculo
            )

            self.vehiculo_service.actualizar_vehiculo(vehiculo.patente, {"estado": "Reservado"})
            
            nuevo_id = self.reserva_dao.crear_reserva(reserva)
            return self.reserva_dao.buscar_por_id(nuevo_id)

        except (ValueError, TypeError) as e: 
            raise DatosInvalidosError(f"Datos inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al crear reserva: {e}")

    def listar_reservas(self):
        """ Retorna: Una lista de objetos Reserva. """
        try:
            return self.reserva_dao.listar_reservas()
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al listar reservas: {e}")

    def buscar_reserva(self, id_reserva):
        """
        Busca una reserva por ID.
        Retorna: El objeto Reserva.
        Levanta: RecursoNoEncontradoError.
        """
        reserva = self.reserva_dao.buscar_por_id(id_reserva)
        if not reserva:
            raise RecursoNoEncontradoError(f"Reserva con ID {id_reserva} no encontrada.")
        return reserva
            
    def actualizar_reserva(self, id_reserva, datos):
        """
        Actualiza una reserva.
        Retorna: El objeto Reserva actualizado.
        """
        try:
            reserva = self.buscar_reserva(id_reserva)

            if 'fecha_inicio_deseada' in datos:
                reserva.fecha_inicio_deseada = date.fromisoformat(datos['fecha_inicio_deseada'])
            if 'fecha_fin_deseada' in datos:
                reserva.fecha_fin_deseada = date.fromisoformat(datos['fecha_fin_deseada'])
            if 'patente' in datos:
                patente = datos.get('patente')
                if patente:
                    reserva.vehiculo = self.vehiculo_service.buscar_vehiculo(patente)
                else:
                    reserva.vehiculo = None

            if reserva.fecha_inicio_deseada > reserva.fecha_fin_deseada:
                raise DatosInvalidosError("La fecha de inicio no puede ser posterior a la de fin.")

            self.reserva_dao.actualizar_reserva(reserva)
            return reserva

        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar reserva: {e}")

    def eliminar_reserva(self, id_reserva):
        """ Elimina una reserva. Retorna True. """
        self.buscar_reserva(id_reserva) 
        try:
            self.reserva_dao.eliminar_reserva(id_reserva)
            return True
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al eliminar reserva: {e}")
        
    def iniciar_alquiler(self, id_reserva, datos):
        """
        Inicia el alquiler a partir de una reserva (supervisor confirms reservation).
        Retorna: El objeto Alquiler creado.
        """
        try:
            reserva = self.buscar_reserva(id_reserva)
            if reserva.estado != "Pendiente":
                raise DatosInvalidosError(f"La reserva ya ha sido {reserva.estado.lower()}.")
            
            empleado_id = datos.get("id_empleado")
            if not empleado_id:
                raise DatosInvalidosError("El 'id_empleado' es obligatorio para iniciar un alquiler.")
            
            costo_total = float(datos.get("costo_total", 0.0))
            alquiler = self.alquiler_service.crear_alquiler_desde_reserva(
                reserva, empleado_id, costo_total
            )
            reserva.estado = "Convertida"
            self.reserva_dao.actualizar_reserva(reserva)
            return alquiler
        
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al iniciar alquiler desde reserva: {e}")
        