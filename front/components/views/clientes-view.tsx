'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Cliente {
  id_cliente: number
  nombre: string
  apellido: string
  dni: string
  direccion: string
  telefono: string
  email: string
}

export default function ClientesView() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:5000/clientes')
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClientes = clientes.filter((c) =>
    `${c.nombre} ${c.apellido} ${c.dni}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Cliente
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : filteredClientes.length > 0 ? (
          filteredClientes.map((cliente) => (
            <Card key={cliente.id_cliente} className="bg-card border-border">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">
                    {cliente.nombre} {cliente.apellido}
                  </h3>
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">DNI:</span>
                      {cliente.dni}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {cliente.telefono}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {cliente.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Dirección:</span>
                      {cliente.direccion}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No se encontraron clientes</p>
        )}
      </div>
    </div>
  )
}
