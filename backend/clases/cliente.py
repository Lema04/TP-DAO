from typing import List, TYPE_CHECKING
import re

if TYPE_CHECKING:
    from .alquiler import Alquiler
    from .reserva import Reserva

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

    # Propiedades con validación
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

    # Métodos de relación
    def agregar_reserva(self, reserva: "Reserva"):
        if reserva not in self.reservas:
            self.reservas.append(reserva)

    def agregar_alquiler(self, alquiler: "Alquiler"):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)

    # Representación legible
    def __repr__(self):
        return f"Cliente {self.id_cliente} - {self.nombre} {self.apellido})"
    
    def a_dict(self):
        """ Retorna una representación del cliente en diccionario. """
        return {
            "id_cliente": self.id_cliente,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "dni": self.dni,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "email": self.email
        }