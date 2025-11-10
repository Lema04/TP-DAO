# servicios/vehiculo_crud.py

from ..servicios import ORMBase
from ..clases.vehiculo import Vehiculo

class VehiculoCRUD(ORMBase):
    tabla = "VEHICULO"
    campos = ["marca", "modelo", "anio", "precio_diario", "estado"]
    # La clave primaria es 'patente', no 'id_...'
    clave_primaria = "patente"

    def __init__(self):
        super().__init__()

    def crear_vehiculo(self, vehiculo: Vehiculo):
        # Como la 'patente' no es autoincremental, la pasamos
        # como parte de los valores de inserción.
        # Debemos SOBREESCRIBIR el método 'insertar' de ORMBase
        
        # Valores: todos los campos + la clave primaria (patente)
        campos_totales = self.campos + [self.clave_primaria]
        valores = [
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.anio,
            vehiculo.precio_diario,
            vehiculo.estado,
            vehiculo.patente # Se añade la patente al final
        ]
        
        placeholders = ",".join(["?"] * len(valores))
        sql = f"INSERT INTO {self.tabla} ({','.join(campos_totales)}) VALUES ({placeholders})"
        
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, valores)
            conn.commit()
            # No retornamos lastrowid, retornamos la patente que ya conocemos
            return vehiculo.patente 

    def listar_vehiculos(self):
        return self.obtener_todos()

    def buscar_por_id(self, patente: str):
        # El 'id_valor' ahora es la patente
        fila = self.obtener_por_id(patente)
        if fila:
            # Re-hidratamos el objeto Vehiculo
            # El ORMBase.obtener_por_id devuelve (pk, campo1, campo2, ...)
            # El __init__ de Vehiculo espera (patente, marca, modelo, anio, precio, estado)
            # ¡Hay que reordenarlos!
            
            # fila = (patente, marca, modelo, anio, precio, estado)
            # El __init__ espera (patente, marca, modelo, anio, precio, estado)
            # Perfecto, fila[0] es la patente, fila[1:] son los campos
            return Vehiculo(
                patente=fila[0],
                marca=fila[1],
                modelo=fila[2],
                anio=fila[3],
                precio_diario=fila[4],
                estado=fila[5]
            )
        return None

    def actualizar_vehiculo(self, vehiculo: Vehiculo):
        valores = [
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.anio,
            vehiculo.precio_diario,
            vehiculo.estado
        ]
        # El 'id_valor' es la patente
        self.actualizar(vehiculo.patente, valores)

    def eliminar_vehiculo(self, patente: str):
        # El 'id_valor' es la patente
        self.eliminar(patente)