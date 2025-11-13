'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Vehiculo {
  patente: string
  marca: string
  modelo: string
  anio: number
  color: string
  precio_por_dia: number
  disponible: boolean
}

export default function VehiculosView() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchVehiculos()
  }, [])

  const fetchVehiculos = async () => {
    try {
      const response = await fetch('http://localhost:5000/vehiculos')
      const data = await response.json()
      setVehiculos(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los vehículos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredVehiculos = vehiculos.filter((v) =>
    `${v.marca} ${v.modelo} ${v.patente}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar vehículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Vehículo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : filteredVehiculos.length > 0 ? (
          filteredVehiculos.map((vehiculo) => (
            <Card key={vehiculo.patente} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-balance">
                    {vehiculo.marca} {vehiculo.modelo}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      vehiculo.disponible
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {vehiculo.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Patente</p>
                    <p className="font-medium">{vehiculo.patente}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Año</p>
                    <p className="font-medium">{vehiculo.anio}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Color</p>
                    <p className="font-medium">{vehiculo.color}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Precio/día</p>
                    <p className="font-medium text-primary">${vehiculo.precio_por_dia}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
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
          <p className="text-muted-foreground">No se encontraron vehículos</p>
        )}
      </div>
    </div>
  )
}
