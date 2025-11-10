from typing import List, TYPE_CHECKING
import re

if TYPE_CHECKING:
    from .alquiler import Alquiler
    from .reserva import Reserva

    # # --- VALIDACIONES ---
    # def validar_datos(self, cliente: Cliente):
    #     # DNI: solo números, 7 u 8 dígitos
    #     if not re.fullmatch(r"\d{7,8}", cliente.dni):
    #         raise ValueError("DNI inválido. Debe contener 7 u 8 dígitos numéricos.")

    #     # Email: formato simple válido
    #     if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", cliente.email):
    #         raise ValueError("Email inválido.")

    #     # Teléfono: solo números (7 a 15 dígitos)
    #     if not re.fullmatch(r"\d{7,15}", cliente.telefono):
    #         raise ValueError("Teléfono inválido. Solo números, 7 a 15 dígitos.")
class Cliente:
    def __init__(self, id_cliente: int, nombre: str, apellido: str, dni: str,
                 direccion: str, telefono: str, email: str):
        self.id_cliente = id_cliente
        self.nombre = nombre
        self.apellido = apellido
        self.dni = dni
        self.direccion = direccion
        self.telefono = telefono
        self.email = email

        # Relaciones
        self.reservas: List["Reserva"] = []
        self.alquileres: List["Alquiler"] = []

    # El guion bajo (_) en self._dni se usa por convención
    # para crear un atributo "interno" o "privado" que almacene
    # el valor real, y así evitar un bucle de recursión infinito.
    @property
    def dni(self):
        return self._dni
    
    @dni.setter
    def dni(self,valor):
        if not re.fullmatch(r"\d{7,8}", valor):
            raise ValueError("DNI inválido. Debe contener 7 u 8 dígitos numéricos.")
        self._dni = valor

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, valor):
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", valor):
            raise ValueError("Email inválido.")
        self._email = valor

    @property
    def telefono(self):
        return self._telefono
    
    @telefono.setter
    def telefono(self,valor):
        if not re.fullmatch(r"\d{7,15}", valor):
            raise ValueError("Teléfono inválido. Solo números, 7 a 15 dígitos.")
        self._telefono = valor

    def agregar_reserva(self, reserva: "Reserva"):
        if reserva not in self.reservas:
            self.reservas.append(reserva)

    def agregar_alquiler(self, alquiler: "Alquiler"):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)

    # para cdo se hace un print, ver
    # def __repr__(self):
    #     return f"Cliente({self.nombre} {self.apellido})"
