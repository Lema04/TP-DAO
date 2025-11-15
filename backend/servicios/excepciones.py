# En un archivo, por ejemplo, "excepciones.py"
class ErrorDeCliente(Exception):
    """Excepción base para errores relacionados con Clientes."""

class ClienteNoEncontradoError(ErrorDeCliente):
    """Se levanta cuando un cliente no se encuentra en la BDD."""
    pass

class DatosInvalidosError(ErrorDeCliente, ValueError):
    """Se levanta cuando los datos de entrada para un cliente son inválidos."""
    pass

# --- En un archivo 'excepciones.py' ---

class ErrorDeAplicacion(Exception):
    """Excepción base para todos los errores de la aplicación."""
    pass

class RecursoNoEncontradoError(ErrorDeAplicacion):
    """Se levanta cuando un recurso (Cliente, Vehículo, etc.) no se encuentra."""
    pass

class DatosInvalidosError(ErrorDeAplicacion, ValueError):
    """Se levanta cuando los datos de entrada son inválidos (ej. DNI duplicado, formato de fecha mal)."""
    pass

class ErrorDeLogicaDeNegocio(ErrorDeAplicacion):
    """Se levanta cuando una acción viola una regla de negocio (ej. alquilar un auto no disponible)."""
    pass