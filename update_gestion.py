import re

# Read the file
with open('frontend/src/components/GestionReservas.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Update date validation
content = content.replace(
    '        // Retorna true si hoy es igual o posterior al inicio\r\n        return hoy >= fechaInicio;',
    '        // Retorna true SOLO si hoy es EXACTAMENTE igual a la fecha de inicio\r\n        return hoy.getTime() === fechaInicio.getTime();'
)

# Change 2: Update warning message  
content = content.replace(
    'La fecha de inicio es posterior a hoy.',
    'La conversión solo está disponible el día de inicio de la reserva.'
)

# Change 3: Add separate buttons
old_buttons = '''                                            {res.estado === 'Pendiente' && (
                                                /* CAMBIO CLAVE: El botón se llama "Gestionar" o "Ver" 
                                                   y siempre está habilitado para permitir entrar y cancelar.
                                                   La validación de "Convertir" se hace ADENTRO.
                                                */
                                                <button 
                                                    className="btn-edit-red" 
                                                    style={{ backgroundColor: '#3182ce', marginRight: '5px' }} // Azul para indicar gestión general
                                                    onClick={() => handleAbrirConversion(res)} 
                                                    title="Gestionar Reserva (Convertir o Cancelar)"
                                                >
                                                    Gestionar
                                                </button>
                                            )}'''

new_buttons = '''                                            {res.estado === 'Pendiente' && (
                                                <>
                                                    <button 
                                                        className="btn-delete-red" 
                                                        style={{ marginRight: '5px' }} 
                                                        onClick={() => handleEliminar(res.id_reserva)} 
                                                        title="Cancelar Reserva"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    
                                                    <button 
                                                        className="btn-edit-red" 
                                                        style={{ 
                                                            backgroundColor: checkEsFechaValida(res.fecha_inicio_deseada) ? '#3182ce' : '#a0aec0',
                                                            cursor: checkEsFechaValida(res.fecha_inicio_deseada) ? 'pointer' : 'not-allowed',
                                                            opacity: checkEsFechaValida(res.fecha_inicio_deseada) ? 1 : 0.6
                                                        }} 
                                                        onClick={() => handleAbrirConversion(res)} 
                                                        disabled={!checkEsFechaValida(res.fecha_inicio_deseada)}
                                                        title={checkEsFechaValida(res.fecha_inicio_deseada) 
                                                            ? "Gestionar Reserva (Convertir a Alquiler)" 
                                                            : "Solo disponible el día de inicio de la reserva"}
                                                    >
                                                        Gestionar
                                                    </button>
                                                </>
                                            )}'''

content = content.replace(old_buttons, new_buttons)

# Write the file
with open('frontend/src/components/GestionReservas.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully')
