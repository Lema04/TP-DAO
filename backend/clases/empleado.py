from typing import List, Optional
import re
from alquiler import Alquiler

class Empleado:
    def __init__(self, id_empleado: int, nombre: str, apellido: str,
                 dni: str, puesto: str, id_supervisor: Optional[int] = None):
        self.id_empleado = id_empleado
        self.nombre = nombre
        self.apellido = apellido
        self.dni = dni
        self.puesto = puesto
        # supuestamente es esto lo de la fk
        self.id_supervisor = id_supervisor
        ## no se como hacer lo de la fk que se relaciona con la pk

        self.alquileres: List[Alquiler] = []
    
    # --- Getter/Setter para apellido ---
    @property
    def apellido(self):
        return self._apellido

    @apellido.setter
    def apellido(self, valor: str):
        if not valor or not valor.strip():
            raise ValueError("El apellido no puede estar vacío.")
        self._apellido = valor.strip()

    # --- Getter/Setter para dni ---
    @property
    def dni(self):
        return self._dni

    @dni.setter
    def dni(self, valor: str):
        # Mismo regex que tenías en el CRUD
        if not re.fullmatch(r"\d{7,8}", valor):
            raise ValueError("DNI inválido. Debe contener 7 u 8 dígitos numéricos.")
        self._dni = valor

    # --- Getter/Setter para puesto ---
    @property
    def puesto(self):
        return self._puesto

    @puesto.setter
    def puesto(self, valor: str):
        if not valor or not valor.strip():
            raise ValueError("El puesto no puede estar vacío.")
        self._puesto = valor.strip()

    def agregar_alquiler(self, alquiler: Alquiler):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)