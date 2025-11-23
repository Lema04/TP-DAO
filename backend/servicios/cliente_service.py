from clases.cliente import Cliente
from Crud.cliente_crud import ClienteCRUD
from servicios.usuario_service import UsuarioService
from Crud.usuario_crud import UsuarioCRUD

from .excepciones import ErrorDeCliente, ClienteNoEncontradoError, DatosInvalidosError

class ClienteService:
    def __init__(self):
        self.dao = ClienteCRUD()
        self.usuario_dao = UsuarioCRUD()
        self.servicio_usuario = UsuarioService()

    def crear_cliente(self, datos):
        """
        Crea un nuevo cliente y su usuario automáticamente.
        Retorna: El objeto Cliente recién creado.
        """
        try:
            if not datos.get('nombre') or not datos.get('dni'):
                raise DatosInvalidosError("El nombre y el DNI son obligatorios.")

            cliente = Cliente(
                id_cliente=None,
                nombre=datos.get('nombre', '').strip(),
                apellido=datos.get('apellido', '').strip(),
                dni=datos.get('dni', '').strip(),
                direccion=datos.get('direccion', '').strip(),
                telefono=datos.get('telefono', '').strip(),
                email=datos.get('email', '').strip()
            )
        
            nuevo_id = self.dao.crear_cliente(cliente)
            cliente_creado = self.dao.buscar_por_id(nuevo_id)

            # # --- CREACIÓN AUTOMÁTICA DEL USUARIO ---
            # nombre_usuario_base = f"{cliente_creado.nombre.lower()}.{cliente_creado.apellido.lower()}.{cliente_creado.id_cliente}"
            # nombre_usuario = nombre_usuario_base
            # contador = 1

            # # Evitar nombres duplicados
            # while True:
            #     try:
            #         usuario_datos = {
            #             "nombre_usuario": nombre_usuario,
            #             "contraseña": "123456",  # contraseña inicial por defecto
            #             "rol": "cliente",
            #             "id_cliente": cliente_creado.id_cliente
            #         }
            #         self.servicio_usuario.crear_usuario(usuario_datos)
            #         break
            #     except DatosInvalidosError:
            #         # Si ya existe, agregamos un número al final
            #         contador += 1
            #         nombre_usuario = f"{nombre_usuario_base}{contador}"

            return cliente_creado

        except ValueError as e:
            raise DatosInvalidosError(f"Datos inválidos: {e}")
        except Exception as e:
            raise ErrorDeCliente(f"Error al crear cliente: {e}")

    def listar_clientes(self):
        """
        Retorna: Una lista de objetos Cliente.
        Levanta: ErrorDeCliente si ocurre un error en la BDD.
        """
        try:
            return self.dao.listar_clientes()
        except Exception as e:
            raise ErrorDeCliente(f"Error al listar clientes: {e}")

    def buscar_cliente(self, id_cliente):
        """
        Retorna: El objeto Cliente encontrado.
        Levanta: ClienteNoEncontradoError si no existe.
                 ErrorDeCliente si ocurre un error en la BDD.
        """
        try:
            cliente = self.dao.buscar_por_id(id_cliente)
            if not cliente:
                raise ClienteNoEncontradoError(f"Cliente con ID {id_cliente} no encontrado.")
            return cliente
        
        except Exception as e:
            if isinstance(e, ErrorDeCliente):
                raise e
            raise ErrorDeCliente(f"Error al buscar cliente: {e}")

    def buscar_clientes(self, valor):
        """
        Retorna: Una lista de objetos Cliente que coincidan.
        Levanta: ErrorDeCliente si ocurre un error en la BDD.
        """
        try:
            resultados = self.dao.buscar_por_nombre_o_dni(valor)
            return resultados
        except Exception as e:
            raise ErrorDeCliente(f"Error en la búsqueda: {e}")

    def actualizar_cliente(self, id_cliente, nuevos_datos):
        """
        Actualiza un cliente existente.
        Retorna: El objeto Cliente actualizado.
        Levanta: ClienteNoEncontradoError si no existe.
                 DatosInvalidosError si los datos son incorrectos.
                 ErrorDeCliente si ocurre un error en la BDD.
        """
        try:
            cliente = self.buscar_cliente(id_cliente)

            if 'nombre' in nuevos_datos:
                cliente.nombre = nuevos_datos['nombre'].strip()
            if 'apellido' in nuevos_datos:
                cliente.apellido = nuevos_datos['apellido'].strip()
            if 'dni' in nuevos_datos:
                cliente.dni = nuevos_datos['dni'].strip()
            if 'direccion' in nuevos_datos:
                cliente.direccion = nuevos_datos['direccion'].strip()
            if 'telefono' in nuevos_datos:
                cliente.telefono = nuevos_datos['telefono'].strip()
            if 'email' in nuevos_datos:
                cliente.email = nuevos_datos['email'].strip()

            self.dao.actualizar_cliente(cliente)
            return cliente
        
        except (ValueError, KeyError) as e:
            raise DatosInvalidosError(f"Datos de actualización inválidos: {e}")
        except Exception as e:
            if isinstance(e, ErrorDeCliente):
                raise e
            raise ErrorDeCliente(f"Error al actualizar cliente: {e}")

    def eliminar_cliente(self, id_cliente):
        """
        Elimina un cliente y su usuario asociado.
        Retorna: True si fue exitoso.
        Levanta: ClienteNoEncontradoError si no existe.
                ErrorDeCliente si ocurre un error en la BDD.
        """
        try:
            cliente = self.buscar_cliente(id_cliente)
            if not cliente:
                raise ClienteNoEncontradoError(f"Cliente con ID {id_cliente} no encontrado.")

            usuario = self.usuario_dao.buscar_por_cliente_id(id_cliente)
            if usuario:
                self.usuario_dao.eliminar_usuario(usuario.id_usuario)

            self.dao.eliminar_cliente(id_cliente)
            return True

        except Exception as e:
            if isinstance(e, ErrorDeCliente):
                raise e
            raise ErrorDeCliente(f"Error al eliminar cliente: {e}")