from typing import List, Optional

from alquiler import Alquiler

class Empleado:
    def __init__(self, id_empleado: int, nombre: str, apellido: str,
                 dni: str, puesto: str, id_supervisor: Optional[int] = None):
        self.id_empleado = id_empleado
        self.nombre = nombre
        self.apellido = apellido
        self.dni = dni
        self.puesto = puesto
        self.id_supervisor = id_supervisor  # referencia a otro empleado (opcional)

        self.alquileres: List['Alquiler'] = []