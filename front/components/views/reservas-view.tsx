'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Reserva {
  id_reserva: number
  id_cliente: number
  patente: string
  fecha_reserva: string
  estado: string
}

export default function ReservasView() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    try {
      const response = await fetch('http://localhost:5000/reservas')
      const data = await response.json()
      setReservas(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reservas',
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
            placeholder="Buscar reservas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : reservas.length > 0 ? (
          reservas.map((reserva) => (
            <Card key={reserva.id_reserva} className="bg-card border-border">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">Reserva #{reserva.id_reserva}</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {reserva.estado}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Patente</p>
                    <p className="font-medium">{reserva.patente}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha Reserva</p>
                    <p className="font-medium">{new Date(reserva.fecha_reserva).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No se encontraron reservas</p>
        )}
      </div>
    </div>
  )
}
