from clases.usuario import Usuario
from Crud.usuario_crud import UsuarioCRUD

class UsuarioService:
    def __init__(self):
        self.dao = UsuarioCRUD()

    # Crear un nuevo usuario
    def crear_usuario(self, datos: dict):
        try:
            campos_obligatorios = ['nombre_usuario', 'contraseña', 'rol']
            for campo in campos_obligatorios:
                if not datos.get(campo):
                    raise ValueError(f"El campo '{campo}' es obligatorio.")

            usuario = Usuario(
                id_usuario=None,
                nombre_usuario=datos.get('nombre_usuario', '').strip(),
                contraseña=datos.get('contraseña', '').strip(),
                rol=datos.get('rol', '').strip(),
                id_cliente=datos.get('id_cliente'),
                id_empleado=datos.get('id_empleado'),
            )

            existente = self.dao.buscar_por_nombre(usuario.nombre_usuario)
            if existente:
                return {"estado": "error", "mensaje": "Ya existe un usuario con ese nombre."}

            nuevo_id = self.dao.crear_usuario(usuario)
            return {"estado": "ok", "mensaje": f"Usuario creado con ID {nuevo_id}."}

        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear usuario: {e}"}

    # Listar todos los usuarios existentes
    def listar_usuarios(self):
        try:
            usuarios = self.dao.listar_usuarios()
            return {"estado": "ok", "data": usuarios}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar usuarios: {e}"}

    # Buscar un usuario existente por su ID
    def buscar_usuario(self, id_usuario: int):
        try:
            usuario = self.dao.buscar_por_id(id_usuario)
            if usuario:
                return {"estado": "ok", "data": usuario}
            return {"estado": "error", "mensaje": "Usuario no encontrado."}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar usuario: {e}"}

    # Actualizar los datos de un usuario existente
    def actualizar_usuario(self, id_usuario: int, nuevos_datos: dict):
        try:
            usuario = self.dao.buscar_por_id(id_usuario)
            if not usuario:
                return {"estado": "error", "mensaje": "Usuario no encontrado."}

            for clave, valor in nuevos_datos.items():
                if hasattr(usuario, clave) and valor is not None:
                    setattr(usuario, clave, valor.strip() if isinstance(valor, str) else valor)

            self.dao.actualizar_usuario(usuario)
            return {"estado": "ok", "mensaje": "Usuario actualizado correctamente."}

        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al actualizar usuario: {e}"}

    # Eliminar un usuario existente por su ID
    def eliminar_usuario(self, id_usuario: int):
        try:
            usuario = self.dao.buscar_por_id(id_usuario)
            if not usuario:
                return {"estado": "error", "mensaje": "Usuario no encontrado."}
            self.dao.eliminar_usuario(id_usuario)
            return {"estado": "ok", "mensaje": "Usuario eliminado correctamente."}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al eliminar usuario: {e}"}
