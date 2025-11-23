from typing import List, TYPE_CHECKING
import re

if TYPE_CHECKING:
    from .alquiler import Alquiler
    from .reserva import Reserva


class Cliente:
    def __init__(self, id_cliente: int, nombre: str, apellido: str, dni: str,
                 direccion: str, telefono: str, email: str, validar=True):
        """
        validar=True: se usa al crear o actualizar un cliente
        validar=False: se usa al cargar datos desde la BD
        """

        self.id_cliente = id_cliente

        if validar:
            self.nombre = nombre
            self.apellido = apellido
            self.dni = dni
            self.direccion = direccion
            self.telefono = telefono
            self.email = email
        else:
            # Carga directa SIN validaciones (cuando viene de la BD)
            self._nombre = nombre
            self._apellido = apellido
            self._dni = dni
            self._direccion = direccion if direccion else ""
            self._telefono = telefono if telefono else ""
            self._email = email if email else ""

        # Relaciones
        self.reservas: List["Reserva"] = []
        self.alquileres: List["Alquiler"] = []

    # ---------------------------
    # DNI
    # ---------------------------
    @property
    def dni(self):
        return self._dni
    
    @dni.setter
    def dni(self, valor):
        valor = valor.strip()

        if not re.fullmatch(r"\d{7,8}", valor):
            raise ValueError("El DNI ingresado no es válido. Debe contener solo números y entre 7 y 8 dígitos.")
        
        self._dni = valor

    # ---------------------------
    # Email
    # ---------------------------
    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, valor):
        valor = valor.strip().lower()

        if not re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", valor):
            raise ValueError(
                "El email ingresado no es válido. Verifique el formato, por ejemplo: usuario@dominio.com"
            )
        
        self._email = valor

    # ---------------------------
    # Teléfono
    # ---------------------------
    @property
    def telefono(self):
        return self._telefono
    
    @telefono.setter
    def telefono(self, valor):
        valor = valor.strip()

        if not re.fullmatch(r"\d{7,15}", valor):
            raise ValueError(
                "El número de teléfono no es válido. Debe contener solo números y entre 7 y 15 dígitos."
            )
        
        self._telefono = valor

    # ---------------------------
    # Nombre
    # ---------------------------
    @property
    def nombre(self):
        return self._nombre
    
    @nombre.setter
    def nombre(self, valor):
        valor = valor.strip()

        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,100}", valor):
            raise ValueError(
                "El nombre ingresado no es válido. Solo puede contener letras y hasta 100 caracteres."
            )
        
        self._nombre = valor

    # ---------------------------
    # Apellido
    # ---------------------------
    @property
    def apellido(self):
        return self._apellido
    
    @apellido.setter
    def apellido(self, valor):
        valor = valor.strip()

        if not re.fullmatch(r"[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,100}", valor):
            raise ValueError(
                "El apellido ingresado no es válido. Solo puede contener letras y hasta 100 caracteres."
            )
        
        self._apellido = valor

    # ---------------------------
    # Dirección (opcional)
    # ---------------------------
    @property
    def direccion(self):
        return self._direccion

    @direccion.setter
    def direccion(self, valor):
        if valor is None or valor.strip() == "":
            self._direccion = ""
            return

        valor = valor.strip()

        patron = r"[A-Za-zÁÉÍÓÚáéíóúÑñ\s\.\-]{2,100}\s+\d{1,6}"

        if not re.fullmatch(patron, valor):
            raise ValueError(
                "La dirección ingresada no es válida. Debe incluir nombre de calle y número, por ejemplo: 'San Martín 123'."
            )

        self._direccion = valor

    def agregar_reserva(self, reserva: "Reserva"):
        if reserva not in self.reservas:
            self.reservas.append(reserva)

    def agregar_alquiler(self, alquiler: "Alquiler"):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)

    def __repr__(self):
        return f"Cliente {self.id_cliente} - {self.nombre} {self.apellido}"

    def a_dict(self):
        return {
            "id_cliente": self.id_cliente,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "dni": self.dni,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "email": self.email
        }
