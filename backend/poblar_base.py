from datetime import date, timedelta
import random

from servicios.cliente_service import ClienteService
from servicios.empleado_service import EmpleadoService
from servicios.vehiculo_service import VehiculoService
from servicios.alquiler_service import AlquilerService

def generar_datos_prueba_avanzados():
    cliente_svc = ClienteService()
    empleado_svc = EmpleadoService()
    vehiculo_svc = VehiculoService()
    alquiler_svc = AlquilerService()

    # --- CLIENTES ---
    clientes = [
        {"nombre": "María", "apellido": "González", "dni": "40123457", "direccion": "Calle Falsa 123", "telefono": "12345679", "email": "maria@example.com"},
        {"nombre": "Juan", "apellido": "Ramírez", "dni": "40123458", "direccion": "Calle Falsa 124", "telefono": "12345680", "email": "juan@example.com"},
        {"nombre": "Ana", "apellido": "Fernández", "dni": "40123459", "direccion": "Calle Falsa 125", "telefono": "12345681", "email": "ana@example.com"},
    ]
    # Evitamos duplicar cliente 1 (Agustín)
    for c in clientes:
        print(cliente_svc.crear_cliente(c))

    # --- EMPLEADOS ---
    empleados = [
        {"nombre": "Carlos", "apellido": "Lopez", "dni": "11223344", "puesto": "Atención", "id_supervisor": None},
        {"nombre": "Lucia", "apellido": "Martinez", "dni": "44332211", "puesto": "Supervisor", "id_supervisor": None},
        {"nombre": "Pedro", "apellido": "Gómez", "dni": "55667788", "puesto": "Atención", "id_supervisor": 2},
    ]
    for e in empleados:
        print(empleado_svc.crear_empleado(e))

    # --- VEHÍCULOS ---
    vehiculos = [
        {"patente": "AAA111", "marca": "Toyota", "modelo": "Corolla", "anio": 2020, "precio_diario": 50.0},
        {"patente": "BBB222", "marca": "Ford", "modelo": "Fiesta", "anio": 2019, "precio_diario": 40.0},
        {"patente": "CCC333", "marca": "Honda", "modelo": "Civic", "anio": 2021, "precio_diario": 60.0},
        {"patente": "DDD444", "marca": "Chevrolet", "modelo": "Onix", "anio": 2022, "precio_diario": 55.0},
        {"patente": "EEE555", "marca": "Volkswagen", "modelo": "Golf", "anio": 2018, "precio_diario": 45.0},
    ]
    for v in vehiculos:
        print(vehiculo_svc.crear_vehiculo(v))

    # --- ALQUILERES ALEATORIOS ---
    todos_clientes = [1, 2, 3, 4]  # IDs de clientes (1=Agustín, 2,3,4 creados)
    todos_empleados = [1, 2, 3]
    todas_patentes = ["AAA111", "BBB222", "CCC333", "DDD444", "EEE555"]

    # Generamos 20 alquileres distribuidos entre los clientes y vehículos
    base_fecha = date(2025, 1, 1)
    for i in range(20):
        cliente_id = random.choice(todos_clientes)
        empleado_id = random.choice(todos_empleados)
        patente = random.choice(todas_patentes)

        duracion = random.randint(1, 5)  # alquiler de 1 a 5 días
        inicio = base_fecha + timedelta(days=random.randint(0, 300))
        fin = inicio + timedelta(days=duracion)
        precio_diario = random.choice([40.0, 45.0, 50.0, 55.0, 60.0])
        costo_total = duracion * precio_diario

        alquiler_datos = {
            "id_cliente": cliente_id,
            "id_empleado": empleado_id,
            "patente": patente,
            "fecha_inicio": inicio.isoformat(),
            "fecha_fin": fin.isoformat(),
            "costo_total": costo_total
        }
        print(alquiler_svc.crear_alquiler(alquiler_datos))

if __name__ == "__main__":
    generar_datos_prueba_avanzados()