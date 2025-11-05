from typing import Optional, List
from datetime import date

from cliente import Cliente
from empleado import Empleado
from vehiculo import Vehiculo
from multa import MultaDano

class Alquiler:
    def __init__(self, id_alquiler: int, fecha_inicio: date, fecha_fin: date,
                 costo_total: float, fecha_registro: date,
                 cliente: Cliente, empleado: Empleado, vehiculo: Vehiculo):

        if cliente is None or empleado is None or vehiculo is None:
            raise ValueError("Un alquiler debe tener cliente, empleado y vehículo asociados.")

        self.id_alquiler = id_alquiler
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.costo_total = costo_total
        self.fecha_registro = fecha_registro
        self.cliente = cliente
        self.empleado = empleado
        self.vehiculo = vehiculo
        self.multas: List[MultaDano] = []

        # Relaciones bidireccionales
        cliente.agregar_alquiler(self)
        empleado.agregar_alquiler(self)
        vehiculo.agregar_alquiler(self)
        vehiculo.marcar_no_disponible()

    def agregar_multa(self, multa: MultaDano):
        if multa not in self.multas:
            self.multas.append(multa)