from typing import List, TYPE_CHECKING
from datetime import date

if TYPE_CHECKING:
    from .cliente import Cliente
    from .empleado import Empleado
    from .vehiculo import Vehiculo
    from .multa import MultaDano

class Alquiler:
    def __init__(self, id_alquiler: int, fecha_inicio: date, fecha_fin: date,
                 costo_total: float, fecha_registro: date,
                 cliente: "Cliente", empleado: "Empleado", vehiculo: "Vehiculo"):

        # Validaciones iniciales
        if cliente is None or empleado is None or vehiculo is None:
            raise ValueError("Un alquiler debe tener cliente, empleado y vehículo asociados.")
        if fecha_fin < fecha_inicio:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        if fecha_inicio < date.today() or fecha_fin < date.today():
            raise ValueError("La fecha debe ser posterior al dia de hoy")

        self.id_alquiler = id_alquiler
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.costo_total = costo_total
        self.fecha_registro = fecha_registro
        self.cliente = cliente
        self.empleado = empleado
        self.vehiculo = vehiculo

        # Relaciones
        self.multas: List["MultaDano"] = []
        cliente.agregar_alquiler(self)
        empleado.agregar_alquiler(self)
        vehiculo.agregar_alquiler(self)
        vehiculo.marcar_no_disponible()
    
    # Propiedades con validación
    @property
    def costo_total(self):
        return self._costo_total

    @costo_total.setter
    def costo_total(self, valor: float):
        if not isinstance(valor, (int, float)) or valor < 0:
            raise ValueError("El costo total no puede ser negativo.")
        self._costo_total = valor

    # Métodos de relación
    def agregar_multa(self, multa: "MultaDano"):
        if multa not in self.multas:
            self.multas.append(multa)
    
    # Representación legible
    def __repr__(self):
        return f"Alquiler {self.id_alquiler} - Cliente {self.cliente.nombre} {self.cliente.apellido} - Vehículo {self.vehiculo.patente}"
    

#     En lugar de que el controlador (app.py) intente adivinar cómo desarmar tu objeto, le pedimos al objeto que lo haga él mismo.

# Esto es un principio clave de Encapsulamiento (Capítulo 8) . El objeto Cliente es el único que debe saber cómo representarse a sí mismo en un formato de diccionario.
    
    def a_dict(self):
        """ Retorna una representación del alquiler en diccionario. """
        return {
            "id_alquiler": self.id_alquiler,
            "fecha_inicio": self.fecha_inicio.isoformat(),
            "fecha_fin": self.fecha_fin.isoformat(),
            "costo_total": self.costo_total,
            "fecha_registro": self.fecha_registro.isoformat(),
            
            # Delega la serialización a los objetos que "compone"
            "cliente": self.cliente.a_dict(),
            "empleado": self.empleado.a_dict(),
            "vehiculo": self.vehiculo.a_dict()
        }