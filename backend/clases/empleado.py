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
        ## no se como hacer lo de la fk que se relaciona con la pk

        self.alquileres: List[Alquiler] = []

    def agregar_alquiler(self, alquiler: Alquiler):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)