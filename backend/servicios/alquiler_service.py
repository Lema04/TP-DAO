from datetime import date
from clases.alquiler import Alquiler
from Crud.alquiler_crud import AlquilerCRUD
from Crud.cliente_crud import ClienteCRUD
from Crud.empleado_crud import EmpleadoCRUD
from Crud.vehiculo_crud import VehiculoCRUD
# Importamos las excepciones
from .excepciones import RecursoNoEncontradoError, DatosInvalidosError, ErrorDeLogicaDeNegocio, ErrorDeAplicacion

class AlquilerService:
    def __init__(self):
        # Correcto. El servicio se "compone" de varios DAOs[cite: 365, 367].
        self.alquiler_dao = AlquilerCRUD()
        self.cliente_dao = ClienteCRUD()
        self.empleado_dao = EmpleadoCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    def crear_alquiler(self, datos):
        """
        Crea un nuevo alquiler.
        Retorna: El objeto Alquiler recién creado.
        Levanta: DatosInvalidosError, RecursoNoEncontradoError, ErrorDeLogicaDeNegocio.
        """
        try:
            # 1. Validar y buscar los objetos completos
            id_cliente = datos.get('id_cliente')
            cliente = self.cliente_dao.buscar_por_id(id_cliente)
            if not cliente:
                raise RecursoNoEncontradoError(f"Cliente con ID {id_cliente} no encontrado.")
            
            patente = datos.get('patente')
            vehiculo = self.vehiculo_dao.buscar_por_id(patente)
            if not vehiculo:
                raise RecursoNoEncontradoError(f"Vehículo con patente {patente} no encontrado.")
            
            # Lógica de negocio: ¿Está disponible el vehículo?
            if not vehiculo.disponible:
                 raise ErrorDeLogicaDeNegocio(f"El vehículo {patente} no está disponible.")

            id_empleado = datos.get('id_empleado')
            empleado = self.empleado_dao.buscar_por_id(id_empleado)
            if not empleado:
                raise RecursoNoEncontradoError(f"Empleado con ID {id_empleado} no encontrado.")

            # 2. Crear el objeto Alquiler (esto valida fechas y costo)
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
            
            # 3. Guardar el alquiler
            nuevo_id = self.alquiler_dao.crear_alquiler(alquiler)
            
            # 4. Lógica de negocio: Actualizar el estado del vehículo
            vehiculo.marcar_no_disponible() # (Asumo que tienes un método así)
            self.vehiculo_dao.actualizar_vehiculo(vehiculo)
            
            # 5. Retornar el objeto completo recién creado
            return self.alquiler_dao.buscar_por_id(nuevo_id)
        
        except (ValueError, TypeError, KeyError) as e:
            # Atrapa errores de formato de fecha, float, o datos faltantes
            raise DatosInvalidosError(f"Datos de entrada inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): # Dejar pasar nuestras excepciones
                raise e
            # Envolver excepciones inesperadas
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
            # Un cliente puede no tener alquileres, una lista vacía es un resultado válido.
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
            # 1. Usamos nuestro propio método para asegurar que existe
            alquiler = self.buscar_alquiler(id_alquiler) 

            # 2. Actualizamos los campos permitidos
            # Esto respeta el Encapsulamiento[cite: 212, 215], no dejamos que se cambie el cliente o el vehículo.
            if 'fecha_inicio' in datos:
                alquiler.fecha_inicio = date.fromisoformat(datos['fecha_inicio'])
            if 'fecha_fin' in datos:
                alquiler.fecha_fin = date.fromisoformat(datos['fecha_fin'])
            if 'costo_total' in datos:
                alquiler.costo_total = float(datos['costo_total'])
            
            # (Aquí podríamos re-validar la lógica de fechas si fuera necesario)

            # 3. Guardamos
            self.alquiler_dao.actualizar_alquiler(alquiler)
            return alquiler
        
        except (ValueError, TypeError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar alquiler: {e}")

    def eliminar_alquiler(self, id_alquiler):
        """
        Elimina un alquiler.
        Retorna: True si fue exitoso.
        Levanta: RecursoNoEncontradoError.
        """
        try:
            # 1. Aseguramos que existe
            alquiler = self.buscar_alquiler(id_alquiler) 

            # 2. Lógica de negocio: ¿Deberíamos volver a poner el auto "disponible"?
            # ¡SÍ! Si borramos el alquiler, el auto debe volver a estar disponible.
            vehiculo = alquiler.vehiculo
            vehiculo.marcar_disponible() # (Asumo que tienes este método)
            self.vehiculo_dao.actualizar_vehiculo(vehiculo)

            # 3. Ahora sí, eliminamos el alquiler
            self.alquiler_dao.eliminar_alquiler(id_alquiler)
            return True

        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al eliminar alquiler: {e}")