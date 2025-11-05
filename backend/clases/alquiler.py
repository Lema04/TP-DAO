from typing import Optional, List
from datetime import date

from cliente import Cliente
from empleado import Empleado
from vehiculo import Vehiculo
from multa import MultaDano

class Alquiler:
    def __init__(self, id_alquiler: int, fecha_inicio: date, fecha_fin: date,
                 costo_total: float, fecha_registro: date,
                 id_empleado: int, patente: str, id_cliente: int):
        self.id_alquiler = id_alquiler
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.costo_total = costo_total
        self.fecha_registro = fecha_registro
        self.id_empleado = id_empleado
        self.patente = patente
        self.id_cliente = id_cliente

        # Relaciones
        self.cliente: Optional[Cliente] = None
        self.empleado: Optional[Empleado] = None
        self.vehiculo: Optional[Vehiculo] = None
        self.multas: List['MultaDano'] = []
