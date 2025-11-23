from orm_base import ORMBase
from clases.vehiculo import Vehiculo

class VehiculoCRUD(ORMBase):
    tabla = "VEHICULO"
    campos = ["marca", "modelo", "anio", "precio_diario", "estado"]
    clave_primaria = "patente"

    def __init__(self):
        super().__init__()

    def _build_vehiculo(self, tupla):
        """
        Método privado para "ensamblar" un objeto Vehiculo desde una tupla.
        """
        if not tupla:
            return None
        
        try:
            return Vehiculo(
                patente=tupla[0],
                marca=tupla[1],
                modelo=tupla[2],
                anio=int(tupla[3]),
                precio_diario=float(tupla[4]),
                estado=tupla[5]
            )
        except Exception as e:
            print(f"Error al ensamblar Vehiculo desde tupla {tupla}: {e}")
            return None

    def crear_vehiculo(self, vehiculo: Vehiculo):
        try:
            with self.conexion.conectar() as conn:
                cursor = conn.cursor()
                sql = f"""
                    INSERT INTO {self.tabla} (patente, marca, modelo, anio, precio_diario, estado) 
                    VALUES (?, ?, ?, ?, ?, ?)
                """
                valores = (
                    vehiculo.patente,
                    vehiculo.marca,
                    vehiculo.modelo,
                    vehiculo.anio,
                    vehiculo.precio_diario,
                    vehiculo.estado
                )
                cursor.execute(sql, valores)
                conn.commit()
                return vehiculo.patente
        except Exception as e:
            raise ValueError(f"Error al insertar vehículo (patente duplicada?): {e}")

    def listar_vehiculos(self):
        """ Retorna una LISTA DE OBJETOS Vehiculo. """
        tuplas = self.obtener_todos() 
        return [self._build_vehiculo(t) for t in tuplas if self._build_vehiculo(t)]

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