# --- Archivo: servicios/multa_service.py ---

from datetime import date
from clases.multa import MultaDano
from Crud.multa_crud import MultaCRUD
from servicios.alquiler_service import AlquilerService # ¡Usamos el servicio!
from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError
)

class MultaService:
    def __init__(self):
        self.multa_dao = MultaCRUD()
        # El servicio de Multa "usa un" servicio de Alquiler
        self.alquiler_service = AlquilerService() 

    def crear_multa(self, datos):
        """
        Crea una nueva multa por daño.
        Retorna: El objeto MultaDano recién creado.
        """
        try:
            # 1. ¡FORMA CORRECTA! Le pedimos el objeto Alquiler al AlquilerService.
            id_alquiler = datos.get('id_alquiler')
            if not id_alquiler:
                raise DatosInvalidosError("El 'id_alquiler' es obligatorio.")
            
            # El AlquilerService ya sabe cómo "ensamblar" un Alquiler
            # y levanta RecursoNoEncontradoError si no existe.
            alquiler_obj = self.alquiler_service.buscar_alquiler(id_alquiler)

            # 2. Validamos los datos crudos del JSON
            monto_raw = datos.get('monto')
            fecha_str = datos.get('fecha_incidente')
            if monto_raw is None or not fecha_str:
                raise DatosInvalidosError("El 'monto' y 'fecha_incidente' son obligatorios.")

            # 3. Creamos el objeto Multa (esto valida la lógica interna)
            multa = MultaDano(
                id_multa=None, # Es autoincremental
                descripcion=datos.get('descripcion', '').strip(),
                monto=float(monto_raw),
                fecha_incidente=date.fromisoformat(fecha_str),
                alquiler=alquiler_obj # ¡Pasamos el objeto completo!
            )
            
            # 4. Guardamos y retornamos el objeto recién creado
            nuevo_id = self.multa_dao.crear_multa(multa)
            return self.multa_dao.buscar_por_id(nuevo_id)
        
        except (ValueError, TypeError) as e:
            # Captura errores de float(), fromisoformat(), o del __init__
            raise DatosInvalidosError(f"Datos inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al crear multa: {e}")
    
    def buscar_multa(self, id_multa: int):
        """
        Busca una multa por su ID.
        Retorna: El objeto MultaDano.
        Levanta: RecursoNoEncontradoError.
        """
        multa = self.multa_dao.buscar_por_id(id_multa)
        if not multa:
            raise RecursoNoEncontradoError(f"Multa con ID {id_multa} no encontrada.")
        return multa

    def buscar_multas_por_id_cliente(self, id_cliente: int):
        """ Retorna: Una lista de objetos MultaDano. """
        try:
            # (Podríamos validar que el cliente exista primero)
            return self.multa_dao.buscar_por_id_cliente(id_cliente)
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al buscar multas por cliente: {e}")
    
    def buscar_multas_por_patente(self, patente: str):
        """ Retorna: Una lista de objetos MultaDano. """
        try:
            # (Podríamos validar que el vehículo exista primero)
            return self.multa_dao.buscar_por_patente(patente)
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al buscar multas por patente: {e}")
            
    def actualizar_multa(self, id_multa: int, datos):
        """
        Actualiza una multa.
        Retorna: El objeto MultaDano actualizado.
        """
        try:
            # 1. Buscamos el objeto existente
            multa = self.buscar_multa(id_multa)

            # 2. Actualizamos campos
            if 'descripcion' in datos:
                multa.descripcion = datos['descripcion']
            if 'monto' in datos:
                monto_raw = datos.get('monto')
                if monto_raw is None:
                    raise DatosInvalidosError("El 'monto' no puede ser nulo.")
                multa.monto = float(monto_raw)
            if 'fecha_incidente' in datos:
                multa.fecha_incidente = date.fromisoformat(datos['fecha_incidente'])

            # 3. Guardamos
            self.multa_dao.actualizar_multa(multa)
            return multa

        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar multa: {e}")

    def eliminar_multa(self, id_multa: int):
        """ Elimina una multa. Retorna True. """
        # 1. Aseguramos que existe (levanta 404 si no)
        self.buscar_multa(id_multa) 
        try:
            self.multa_dao.eliminar_multa(id_multa)
            return True
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al eliminar multa: {e}")