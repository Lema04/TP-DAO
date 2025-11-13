'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Alquiler {
  id_alquiler: number
  id_cliente: number
  patente: string
  id_empleado: number
  fecha_inicio: string
  fecha_fin: string
  monto_total: number
}

export default function AlquileresView() {
  const [alquileres, setAlquileres] = useState<Alquiler[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchAlquileres()
  }, [])

  const fetchAlquileres = async () => {
    try {
      const response = await fetch('http://localhost:5000/alquileres')
      const data = await response.json()
      setAlquileres(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los alquileres',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alquileres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Alquiler
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : alquileres.length > 0 ? (
          alquileres.map((alquiler) => (
            <Card key={alquiler.id_alquiler} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID Alquiler</p>
                    <p className="font-semibold">{alquiler.id_alquiler}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patente</p>
                    <p className="font-semibold">{alquiler.patente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Inicio</p>
                    <p className="font-semibold">{new Date(alquiler.fecha_inicio).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monto Total</p>
                    <p className="text-lg font-bold text-primary">${alquiler.monto_total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No se encontraron alquileres</p>
        )}
      </div>
    </div>
  )
}
