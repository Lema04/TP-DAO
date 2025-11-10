# servicios/multa_crud.py

from ..servicios import ORMBase
from ..clases.multa import MultaDano

class MultaCRUD(ORMBase):
    tabla = "MULTA_DANO"
    campos = ["id_alquiler", "descripcion", "monto", "fecha_incidente"]
    clave_primaria = "id_multa"

    def __init__(self):
        super().__init__()

    def crear_multa(self, multa: MultaDano):
        valores = [
            multa.alquiler.id_alquiler,
            multa.descripcion,
            multa.monto,
            multa.fecha_incidente
        ]
        return self.insertar(valores)