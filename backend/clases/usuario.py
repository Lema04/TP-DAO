import re

class Usuario:
    def __init__(self, id_usuario: int, nombre_usuario: str, contraseña: str,
        rol: str, id_cliente: int = None, id_empleado: int = None):
        
        # Validaciones iniciales
        if not nombre_usuario:
            raise ValueError("El nombre de usuario es obligatorio.")
        if not contraseña:
            raise ValueError("La contraseña es obligatoria.")
        if rol not in ("cliente", "atencion", "supervisor"):
            raise ValueError("El rol debe ser 'cliente', 'atencion' o 'supervisor'.")
        if rol == "cliente" and id_cliente is None:
            raise ValueError("Un usuario con rol 'cliente' debe tener asignado un id_cliente.")
        if rol in ("empleado", "gerente") and id_empleado is None:
            raise ValueError(f"Un usuario con rol '{rol}' debe tener asignado un id_empleado.")

        self.id_usuario = id_usuario
        self.nombre_usuario = nombre_usuario.strip()
        self.contraseña = contraseña.strip()
        self.rol = rol.strip().lower()
        self.id_cliente = id_cliente
        self.id_empleado = id_empleado

    # Propiedades con validación
    @property
    def nombre_usuario(self):
        return self._nombre_usuario

    @nombre_usuario.setter
    def nombre_usuario(self, valor):
        if not re.fullmatch(r"^[A-Za-z0-9_.-]{4,20}$", valor):
            raise ValueError("El nombre de usuario debe tener entre 4 y 20 caracteres alfanuméricos o símbolos ._-")
        self._nombre_usuario = valor

    @property
    def contraseña(self):
        return self._contraseña

    @contraseña.setter
    def contraseña(self, valor):
        if len(valor) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")
        self._contraseña = valor

    # Representación legible
    def __repr__(self):
        return f"Usuario {self.id_usuario} - {self.nombre_usuario} ({self.rol})"
