from orm_base import ORMBase
from clases.mantenimiento import Mantenimiento

class MantenimientoCRUD(ORMBase):
    tabla = "MANTENIMIENTO"
    campos = ["patente", "fecha_inicio", "fecha_fin", "tipo_servicio", "costo"]
    clave_primaria = "id_mantenimiento"

    def __init__(self):
        super().__init__()

    # Crear un nuevo mantenimiento
    def crear_mantenimiento(self, mantenimiento: Mantenimiento):
        valores = [
            mantenimiento.vehiculo.patente,
            mantenimiento.fecha_inicio,
            mantenimiento.fecha_fin,
            mantenimiento.tipo_servicio,
            mantenimiento.costo
        ]
        placeholders = ",".join(["?"] * len(valores))
        sql = f"INSERT INTO {self.tabla} ({','.join(self.campos)}) VALUES ({placeholders})"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, valores)
            conn.commit()
            return mantenimiento.id_mantenimiento