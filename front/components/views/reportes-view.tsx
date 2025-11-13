'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Download, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ReportesView() {
  const [clienteId, setClienteId] = useState('')
  const [anio, setAnio] = useState(new Date().getFullYear().toString())
  const { toast } = useToast()

  const generarReporte = async (endpoint: string, params: Record<string, string> = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `http://localhost:5000/reportes/${endpoint}${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      toast({
        title: 'Reporte Generado',
        description: data.mensaje || 'El reporte se ha generado exitosamente',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Reporte Alquileres por Cliente */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Alquileres por Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Genera un reporte detallado de todos los alquileres de un cliente específico
            </p>
            <Input
              type="number"
              placeholder="ID del cliente"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            />
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                if (clienteId) {
                  generarReporte(`alquileres_por_cliente/${clienteId}`)
                } else {
                  toast({
                    title: 'Error',
                    description: 'Por favor ingrese un ID de cliente',
                    variant: 'destructive',
                  })
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte PDF
            </Button>
          </CardContent>
        </Card>

        {/* Reporte Vehículos Más Alquilados */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Vehículos Más Alquilados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Genera un reporte de los 5 vehículos más alquilados
            </p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-12"
              onClick={() => generarReporte('vehiculos_mas_alquilados')}
            >
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte PDF
            </Button>
          </CardContent>
        </Card>

        {/* Reporte Facturación Mensual */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Facturación Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Genera un gráfico de barras con la facturación mensual del año
            </p>
            <Input
              type="number"
              placeholder="Año (ej: 2025)"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => generarReporte('facturacion_mensual', { anio })}
            >
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte PDF
            </Button>
          </CardContent>
        </Card>

        {/* Reporte Alquileres por Período */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Alquileres por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Genera un reporte de alquileres por mes o trimestre
            </p>
            <Input
              type="number"
              placeholder="Año (ej: 2025)"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => generarReporte('alquileres_por_periodo', { frecuencia: 'M', anio })}
              >
                Mensual
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => generarReporte('alquileres_por_periodo', { frecuencia: 'Q', anio })}
              >
                Trimestral
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
