# --- Archivo: clases/vehiculo.py ---

import re
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .reserva import Reserva
    from .mantenimiento import Mantenimiento
    from .alquiler import Alquiler

class Vehiculo:
    def __init__(self, patente: str, marca: str, modelo: str, anio: int,
                 precio_diario: float, estado: str = "Disponible"):
        
        self.patente = patente  # Esto llama al setter
        self.marca = marca
        self.modelo = modelo
        self.anio = anio
        self.precio_diario = precio_diario
        self.estado = estado

        # Relaciones (Composición)
        self.reservas: List["Reserva"] = []
        self.alquileres: List["Alquiler"] = []
        self.mantenimientos: List["Mantenimiento"] = []

    # --- Propiedad 'patente' con validación ---
    @property
    def patente(self):
        return self._patente

    @patente.setter
    def patente(self, valor):
        if not valor or not valor.strip():
            raise ValueError("La patente no puede estar vacía.")
        valor = valor.strip().upper() # Estandarizamos a mayúsculas
        if not re.fullmatch(r"[A-Z0-9]{6,7}", valor):
            raise ValueError("Patente inválida. Debe contener 6 o 7 caracteres alfanuméricos.")
        self._patente = valor
    
    # --- Métodos de estado ---
    
    def marcar_no_disponible(self):
        self.estado = "No disponible"

    def marcar_disponible(self):
        self.estado = "Disponible"

    # --- Métodos de relación ---
    
    def agregar_reserva(self, reserva: "Reserva"):
        if reserva not in self.reservas:
            self.reservas.append(reserva)

    def agregar_alquiler(self, alquiler: "Alquiler"):
        if alquiler not in self.alquileres:
            self.alquileres.append(alquiler)

    def agregar_mantenimiento(self, mantenimiento: "Mantenimiento"):
        if mantenimiento not in self.mantenimientos:
            self.mantenimientos.append(mantenimiento)
    
    # --- Métodos Mágicos ---
    
    def __repr__(self):
        return f"Vehículo {self.patente} - {self.marca} {self.modelo} ({self.anio})"

    def a_dict(self):
        """ 
        Retorna una representación del vehículo en diccionario (serializable).
        """
        return {
            "patente": self.patente, # Llama al getter @property
            "marca": self.marca,
            "modelo": self.modelo,
            "anio": self.anio,
            "precio_diario": self.precio_diario,
            "estado": self.estado
        }