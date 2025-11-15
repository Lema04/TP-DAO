# --- Archivo: Crud/vehiculo_crud.py ---

from orm_base import ORMBase
from clases.vehiculo import Vehiculo # ¡Importamos la clase!

class VehiculoCRUD(ORMBase):
    tabla = "VEHICULO"
    campos = ["marca", "modelo", "anio", "precio_diario", "estado"]
    clave_primaria = "patente"

    def __init__(self):
        super().__init__()

    # --- ¡MEJOR PRÁCTICA: El Ensamblador! ---
    def _build_vehiculo(self, tupla):
        """
        Método privado para "ensamblar" un objeto Vehiculo desde una tupla.
        """
        if not tupla:
            return None
        
        # El ORMBase.obtener_... devuelve (pk, campo1, campo2, ...)
        # (patente, marca, modelo, anio, precio_diario, estado)
        try:
            return Vehiculo(
                patente=tupla[0],
                marca=tupla[1],
                modelo=tupla[2],
                anio=int(tupla[3]), # Aseguramos el tipo
                precio_diario=float(tupla[4]), # Aseguramos el tipo
                estado=tupla[5]
            )
        except Exception as e:
            print(f"Error al ensamblar Vehiculo desde tupla {tupla}: {e}")
            return None

    # --- ¡Polimorfismo / Sobreescritura! ---
    # Sobreescribimos 'crear_vehiculo' porque 'patente' no es autoincremental
    def crear_vehiculo(self, vehiculo: Vehiculo):
        
        # El ORMBase.insertar() es para claves autoincrementales.
        # Hacemos una inserción manual.
        try:
            with self.conexion.conectar() as conn:
                cursor = conn.cursor()
                sql = f"""
                    INSERT INTO {self.tabla} (patente, marca, modelo, anio, precio_diario, estado) 
                    VALUES (?, ?, ?, ?, ?, ?)
                """
                valores = (
                    vehiculo.patente, # Usamos el getter
                    vehiculo.marca,
                    vehiculo.modelo,
                    vehiculo.anio,
                    vehiculo.precio_diario,
                    vehiculo.estado
                )
                cursor.execute(sql, valores)
                conn.commit()
                return vehiculo.patente # Retornamos la patente como confirmación
        except Exception as e:
            # Podría fallar si la patente (PK) ya existe
            raise ValueError(f"Error al insertar vehículo (patente duplicada?): {e}")

    # --- ¡ARREGLADO! ---
    def listar_vehiculos(self):
        """ Retorna una LISTA DE OBJETOS Vehiculo. """
        tuplas = self.obtener_todos() 
        return [self._build_vehiculo(t) for t in tuplas if self._build_vehiculo(t)]

    # --- ¡ARREGLADO! ---
    def buscar_por_id(self, patente: str):
        """ Retorna UN OBJETO Vehiculo o None. """
        tupla = self.obtener_por_id(patente)
        return self._build_vehiculo(tupla)

    def actualizar_vehiculo(self, vehiculo: Vehiculo):
        valores = [
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.anio,
            vehiculo.precio_diario,
            vehiculo.estado
        ]
        self.actualizar(vehiculo.patente, valores)

    def eliminar_vehiculo(self, patente: str):
        self.eliminar(patente)