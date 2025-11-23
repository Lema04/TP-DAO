from clases.usuario import Usuario
from Crud.usuario_crud import UsuarioCRUD

from servicios.excepciones import (
    ErrorDeAplicacion, 
    RecursoNoEncontradoError, 
    DatosInvalidosError
)

class UsuarioService:
    def __init__(self):
        self.dao = UsuarioCRUD()

    def crear_usuario(self, datos: dict):
        """
        Crea un nuevo usuario.
        Retorna: El objeto Usuario recién creado.
        """
        try:
            campos_obligatorios = ['nombre_usuario', 'contraseña', 'rol']
            for campo in campos_obligatorios:
                if not datos.get(campo):
                    raise DatosInvalidosError(f"El campo '{campo}' es obligatorio.")

            usuario = Usuario(
                id_usuario=None,
                nombre_usuario=datos.get('nombre_usuario').strip(),
                contraseña=datos.get('contraseña').strip(),
                rol=datos.get('rol').strip(),
                id_cliente=datos.get('id_cliente'),
                id_empleado=datos.get('id_empleado'),
            )

            nuevo_id = self.dao.crear_usuario(usuario)
            return self.dao.buscar_por_id(nuevo_id)

        except ValueError as e:
            raise DatosInvalidosError(str(e))
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al crear usuario: {e}")

    def listar_usuarios(self):
        """ Retorna: Una lista de objetos Usuario. """
        try:
            return self.dao.listar_usuarios()
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al listar usuarios: {e}")

    def buscar_usuario(self, id_usuario: int):
        """
        Busca un usuario por ID.
        Retorna: El objeto Usuario.
        Levanta: RecursoNoEncontradoError.
        """
        usuario = self.dao.buscar_por_id(id_usuario)
        if not usuario:
            raise RecursoNoEncontradoError(f"Usuario con ID {id_usuario} no encontrado.")
        return usuario
    
    def actualizar_usuario(self, id_usuario: int, nuevos_datos: dict):
        """
        Actualiza un usuario.
        Retorna: El objeto Usuario actualizado.
        """
        try:
            usuario = self.buscar_usuario(id_usuario)
            if 'nombre_usuario' in nuevos_datos:
                usuario.nombre_usuario = nuevos_datos['nombre_usuario'].strip()
            if 'contraseña' in nuevos_datos:
                usuario.contraseña = nuevos_datos['contraseña'].strip()
            if 'rol' in nuevos_datos:
                usuario.rol = nuevos_datos['rol'].strip()
            if 'id_cliente' in nuevos_datos:
                usuario.id_cliente = nuevos_datos.get('id_cliente')
            if 'id_empleado' in nuevos_datos:
                usuario.id_empleado = nuevos_datos.get('id_empleado')

            self.dao.actualizar_usuario(usuario)
            return usuario

        except ValueError as e:
            raise DatosInvalidosError(str(e))
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar usuario: {e}")

    def eliminar_usuario(self, id_usuario: int):
        """ Elimina un usuario. Retorna True. """
        self.buscar_usuario(id_usuario)
        try:
            self.dao.eliminar_usuario(id_usuario)
            return True
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al eliminar usuario: {e}")

    def autenticar_usuario(self, datos: dict):
        """
        Autentica un usuario.
        Retorna: Un diccionario con datos de sesión (¡no el objeto Usuario!).
        Levanta: DatosInvalidosError.
        """
        try:
            nombre_usuario = datos.get("nombre_usuario", "").strip()
            contraseña = datos.get("contraseña", "").strip()
            
            usuario = self.dao.buscar_por_nombre(nombre_usuario)
            
            if not usuario or not usuario.check_password(contraseña):
                 raise DatosInvalidosError("Nombre de usuario o contraseña incorrectos.")
            
            return {
                "mensaje": "Autenticación exitosa.",
                "rol": usuario.rol,
                "nombre_usuario": usuario.nombre_usuario,
                "id_cliente": usuario.id_cliente, 
                "id_empleado": usuario.id_empleado,
                "id_usuario": usuario.id_usuario
            }
        except Exception as e:
            if isinstance(e, DatosInvalidosError): raise e
            raise ErrorDeAplicacion(f"Error en la autenticación: {e}")