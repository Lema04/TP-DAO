'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Multa {
  id_multa: number
  id_alquiler: number
  descripcion: string
  monto: number
  fecha: string
}

export default function MultasView() {
  const [multas, setMultas] = useState<Multa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchMultas()
  }, [])

  const fetchMultas = async () => {
    try {
      const response = await fetch('http://localhost:5000/multas')
      const data = await response.json()
      setMultas(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las multas',
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
            placeholder="Buscar multas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Registrar Multa
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : multas.length > 0 ? (
          multas.map((multa) => (
            <Card key={multa.id_multa} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold">Multa #{multa.id_multa}</h3>
                    <p className="text-sm text-muted-foreground">{multa.descripcion}</p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Alquiler: </span>
                        <span className="font-medium">#{multa.id_alquiler}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha: </span>
                        <span className="font-medium">{new Date(multa.fecha).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Monto</p>
                    <p className="text-2xl font-bold text-destructive">${multa.monto}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No se encontraron multas</p>
        )}
      </div>
    </div>
  )
}
