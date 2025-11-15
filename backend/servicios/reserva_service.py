# --- Archivo: servicios/reserva_service.py ---

from datetime import date
from clases.reserva import Reserva
from Crud.reserva_crud import ReservaCRUD
# ¡Usamos los SERVICIOS, no los DAOs!
from servicios.cliente_service import ClienteService
from servicios.vehiculo_service import VehiculoService
from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError
)

class ReservaService:
    def __init__(self):
        self.reserva_dao = ReservaCRUD()
        # El servicio de Reserva "usa" otros servicios
        self.cliente_service = ClienteService()
        self.vehiculo_service = VehiculoService()

    def crear_reserva(self, datos):
        """
        Crea una nueva reserva.
        Retorna: El objeto Reserva recién creado.
        """
        try:
            # 1. Validar Cliente (obligatorio)
            id_cliente = datos.get('id_cliente')
            if not id_cliente:
                raise DatosInvalidosError("El 'id_cliente' es obligatorio.")
            # El servicio ya levanta RecursoNoEncontradoError
            cliente = self.cliente_service.buscar_cliente(id_cliente)
            
            # 2. Validar Vehiculo (opcional)
            vehiculo = None
            patente = datos.get('patente')
            if patente:
                # El servicio ya levanta RecursoNoEncontradoError
                vehiculo = self.vehiculo_service.buscar_vehiculo(patente)
                # (Aquí iría la LÓGICA DE NEGOCIO:
                # Ej: chequear si 'vehiculo' está disponible en esas fechas)

            # 3. Validar y convertir datos crudos
            fecha_inicio_str = datos.get('fecha_inicio_deseada')
            fecha_fin_str = datos.get('fecha_fin_deseada')
            if not fecha_inicio_str or not fecha_fin_str:
                raise DatosInvalidosError("Las 'fecha_inicio_deseada' y 'fecha_fin_deseada' son obligatorias.")

            # 4. Crear el objeto Reserva (esto valida la lógica de fechas)
            reserva = Reserva(
                id_reserva=None, # Autoincremental
                fecha_reserva=date.today(),
                fecha_inicio_deseada=date.fromisoformat(fecha_inicio_str),
                fecha_fin_deseada=date.fromisoformat(fecha_fin_str),
                cliente=cliente,  # Pasamos el objeto Cliente
                vehiculo=vehiculo # Pasamos el objeto Vehiculo (o None)
            )
            
            # 5. Guardar y retornar el objeto recién creado
            nuevo_id = self.reserva_dao.crear_reserva(reserva)
            return self.reserva_dao.buscar_por_id(nuevo_id)

        except (ValueError, TypeError) as e: 
            # Captura errores de fromisoformat(), o del __init__
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
            # 1. Buscamos el objeto existente
            reserva = self.buscar_reserva(id_reserva)

            # 2. Actualizamos campos
            if 'fecha_inicio_deseada' in datos:
                reserva.fecha_inicio_deseada = date.fromisoformat(datos['fecha_inicio_deseada'])
            if 'fecha_fin_deseada' in datos:
                reserva.fecha_fin_deseada = date.fromisoformat(datos['fecha_fin_deseada'])
            
            # 3. Lógica para cambiar/asignar vehículo
            if 'patente' in datos:
                patente = datos.get('patente')
                if patente:
                    # El servicio ya levanta RecursoNoEncontradoError
                    reserva.vehiculo = self.vehiculo_service.buscar_vehiculo(patente)
                else:
                    reserva.vehiculo = None # Permite des-asignar un vehículo

            # 4. Re-validamos la lógica de fechas
            if reserva.fecha_inicio_deseada > reserva.fecha_fin_deseada:
                raise DatosInvalidosError("La fecha de inicio no puede ser posterior a la de fin.")

            # 5. Guardamos
            self.reserva_dao.actualizar_reserva(reserva)
            return reserva

        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar reserva: {e}")

    def eliminar_reserva(self, id_reserva):
        """ Elimina una reserva. Retorna True. """
        # 1. Aseguramos que existe
        self.buscar_reserva(id_reserva) 
        try:
            self.reserva_dao.eliminar_reserva(id_reserva)
            return True
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al eliminar reserva: {e}")