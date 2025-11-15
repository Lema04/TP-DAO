# --- Archivo: servicios/usuario_service.py ---

from clases.usuario import Usuario
from Crud.usuario_crud import UsuarioCRUD
# Importamos las excepciones
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
            # 1. Validar datos crudos
            campos_obligatorios = ['nombre_usuario', 'contraseña', 'rol']
            for campo in campos_obligatorios:
                if not datos.get(campo):
                    raise DatosInvalidosError(f"El campo '{campo}' es obligatorio.")

            # 2. El DAO ya levanta ValueError si el usuario existe
            
            # 3. Crear el objeto
            usuario = Usuario(
                id_usuario=None,
                nombre_usuario=datos.get('nombre_usuario').strip(),
                contraseña=datos.get('contraseña').strip(), # (En una app real, aquí se hashearía)
                rol=datos.get('rol').strip(),
                id_cliente=datos.get('id_cliente'),
                id_empleado=datos.get('id_empleado'),
            )

            # 4. Guardar y retornar el objeto recién creado
            nuevo_id = self.dao.crear_usuario(usuario)
            return self.dao.buscar_por_id(nuevo_id)

        except ValueError as e:
            # Captura el error de "usuario duplicado" del DAO
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
            # 1. Buscamos el objeto
            usuario = self.buscar_usuario(id_usuario) # Levanta 404 si no existe

            # 2. Actualizamos campos (¡Sin setattr!)
            if 'nombre_usuario' in nuevos_datos:
                usuario.nombre_usuario = nuevos_datos['nombre_usuario'].strip()
            if 'contraseña' in nuevos_datos:
                # (Aquí se hashearía la nueva contraseña)
                usuario.contraseña = nuevos_datos['contraseña'].strip()
            if 'rol' in nuevos_datos:
                usuario.rol = nuevos_datos['rol'].strip()
            if 'id_cliente' in nuevos_datos:
                usuario.id_cliente = nuevos_datos.get('id_cliente')
            if 'id_empleado' in nuevos_datos:
                usuario.id_empleado = nuevos_datos.get('id_empleado')

            # 3. Guardamos
            self.dao.actualizar_usuario(usuario)
            return usuario

        except ValueError as e:
            raise DatosInvalidosError(str(e))
        except Exception as e:
            if isinstance(e, ErrorDeAplicacion): raise e
            raise ErrorDeAplicacion(f"Error al actualizar usuario: {e}")

    def eliminar_usuario(self, id_usuario: int):
        """ Elimina un usuario. Retorna True. """
        self.buscar_usuario(id_usuario) # Asegura que existe (levanta 404)
        try:
            self.dao.eliminar_usuario(id_usuario)
            return True
        except Exception as e:
            # Podría fallar por FK (si el usuario es un empleado, etc.)
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
            
            # Lógica de POO: el objeto se valida a sí mismo
            if not usuario or not usuario.check_password(contraseña):
                 raise DatosInvalidosError("Nombre de usuario o contraseña incorrectos.")
            
            # ¡Éxito! Devolvemos un diccionario limpio (no un objeto)
            return {
                "mensaje": "Autenticación exitosa.",
                "rol": usuario.rol,
                "id_cliente": usuario.id_cliente, 
                "id_empleado": usuario.id_empleado,
                "id_usuario": usuario.id_usuario
            }
        except Exception as e:
            if isinstance(e, DatosInvalidosError): raise e
            raise ErrorDeAplicacion(f"Error en la autenticación: {e}")