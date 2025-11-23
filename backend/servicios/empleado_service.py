# --- Archivo: servicios/empleado_service.py ---

from Crud.empleado_crud import EmpleadoCRUD
from clases.empleado import Empleado
from servicios.usuario_service import UsuarioService
from Crud.usuario_crud import UsuarioCRUD
from servicios.excepciones import (
    ErrorDeAplicacion,
    RecursoNoEncontradoError,
    DatosInvalidosError
)
import unicodedata

def normalizar_texto(texto):
    """
    Convierte el texto a minúsculas y elimina tildes.
    """
    if not texto:
        return ""
    texto = texto.lower()
    return ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    )

class EmpleadoService:
    def __init__(self):
        self.dao = EmpleadoCRUD()
        self.usuario_dao = UsuarioCRUD()
        self.servicio_usuario = UsuarioService()

    # -------------------------------------------------------------------
    # CREAR EMPLEADO + USUARIO AUTOMÁTICO
    # -------------------------------------------------------------------
    def crear_empleado(self, datos):
        try:
            id_supervisor = int(datos.get('id_supervisor')) if datos.get('id_supervisor') else None
            if id_supervisor is not None:
                supervisor = self.dao.buscar_por_id(id_supervisor)
                if not supervisor:
                    raise DatosInvalidosError(f"El supervisor con ID {id_supervisor} no existe.")
                elif supervisor.puesto.lower() != 'supervisor':
                    raise DatosInvalidosError(f"El empleado con ID {id_supervisor} no es un supervisor.")

            empleado = Empleado(
                id_empleado=None,
                nombre=datos.get('nombre'),
                apellido=datos.get('apellido'),
                dni=datos.get('dni'),
                puesto=datos.get('puesto'),
                id_supervisor=id_supervisor
            )

            nuevo_id = self.dao.crear_empleado(empleado)
            empleado_creado = self.dao.buscar_por_id(nuevo_id)

            # --- CREAR USUARIO AUTOMÁTICO ---
            puesto_lower = empleado_creado.puesto.lower().replace("ó", "o").replace("á", "a")
            rol_usuario = "atencion" if puesto_lower == "atencion" else "supervisor"

            nombre_usuario_base = (
                f"{empleado_creado.nombre.lower()}.{empleado_creado.apellido.lower()}.{empleado_creado.id_empleado}"
            )
            nombre_usuario = nombre_usuario_base
            contador = 1

            while True:
                try:
                    usuario_datos = {
                        "nombre_usuario": nombre_usuario,
                        "contraseña": "123456",
                        "rol": rol_usuario,
                        "id_empleado": empleado_creado.id_empleado
                    }

                    self.servicio_usuario.crear_usuario(usuario_datos)
                    break

                except DatosInvalidosError:
                    contador += 1
                    nombre_usuario = f"{nombre_usuario_base}{contador}"

            return empleado_creado

        except Exception as e:
            raise ErrorDeAplicacion(f"Error al crear empleado: {e}")

    def listar_empleados(self):
        try:
            return self.dao.listar_empleados()
        except Exception as e:
            raise ErrorDeAplicacion(f"Error al listar empleados: {e}")
    
    def buscar_empleado(self, id_empleado):
        empleado = self.dao.buscar_por_id(id_empleado)
        if not empleado:
            raise RecursoNoEncontradoError(f"Empleado con ID {id_empleado} no encontrado.")
        return empleado

    # -------------------------------------------------------------------
    # ACTUALIZAR EMPLEADO + ACTUALIZAR USUARIO AUTOMÁTICAMENTE
    # -------------------------------------------------------------------
    def actualizar_empleado(self, id_empleado, nuevos_datos):
        """
        Actualiza los datos de un empleado y sincroniza el rol del usuario
        asociado si el puesto cambia. Solo el rol del usuario se actualiza desde
        la gestión de empleados.
        """
        try:
            # 1️⃣ Buscar empleado existente
            empleado = self.buscar_empleado(id_empleado)

            # Guardar puesto antiguo para detectar cambios
            puesto_viejo = empleado.puesto

            # 2️⃣ Actualizar campos del empleado
            if 'nombre' in nuevos_datos:
                empleado.nombre = nuevos_datos['nombre'].strip()
            if 'apellido' in nuevos_datos:
                empleado.apellido = nuevos_datos['apellido'].strip()
            if 'dni' in nuevos_datos:
                empleado.dni = nuevos_datos['dni'].strip()
            if 'puesto' in nuevos_datos:
                empleado.puesto = nuevos_datos['puesto'].strip()
            if 'id_supervisor' in nuevos_datos:
                id_sup = nuevos_datos.get('id_supervisor')
                empleado.id_supervisor = int(id_sup) if id_sup else None

            # 3️⃣ Guardar cambios en el empleado
            self.dao.actualizar_empleado(empleado)

            # 4️⃣ Actualizar solo el rol del usuario asociado si cambió el puesto
            if empleado.puesto != puesto_viejo:
                usuario = self.usuario_dao.buscar_por_empleado_id(id_empleado)
                if usuario:
                    puesto_normalizado = normalizar_texto(empleado.puesto)
                    usuario.rol = "atencion" if puesto_normalizado == "atencion" else "supervisor"
                    self.usuario_dao.actualizar_usuario(usuario)

            return empleado

        except Exception as e:
            raise ErrorDeAplicacion(f"Error al actualizar empleado: {e}")

    # -------------------------------------------------------------------
    # ELIMINAR EMPLEADO + USUARIO VINCULADO
    # -------------------------------------------------------------------
    def eliminar_empleado(self, id_empleado):
        try:
            empleado = self.buscar_empleado(id_empleado)

            usuario = self.usuario_dao.buscar_por_empleado_id(id_empleado)
            if usuario:
                self.usuario_dao.eliminar_usuario(usuario.id_usuario)

            self.dao.eliminar_empleado(id_empleado)
            return True

        except Exception as e:
            raise ErrorDeAplicacion(f"Error al eliminar empleado: {e}")