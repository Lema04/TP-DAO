'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Empleado {
  id_empleado: number
  nombre: string
  apellido: string
  cargo: string
  salario: number
}

export default function EmpleadosView() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchEmpleados()
  }, [])

  const fetchEmpleados = async () => {
    try {
      const response = await fetch('http://localhost:5000/empleados')
      const data = await response.json()
      setEmpleados(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los empleados',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredEmpleados = empleados.filter((e) =>
    `${e.nombre} ${e.apellido} ${e.cargo}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Empleado
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : filteredEmpleados.length > 0 ? (
          filteredEmpleados.map((empleado) => (
            <Card key={empleado.id_empleado} className="bg-card border-border">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    {empleado.nombre} {empleado.apellido}
                  </h3>
                  <p className="text-sm text-primary">{empleado.cargo}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Salario</p>
                  <p className="text-lg font-bold">${empleado.salario.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="mr-2 h-3 w-3" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-destructive">
                    <Trash2 className="mr-2 h-3 w-3" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No se encontraron empleados</p>
        )}
      </div>
    </div>
  )
}
