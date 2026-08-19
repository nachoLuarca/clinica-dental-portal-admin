import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCreateEspecialidad, useEspecialidades, useUpdateEspecialidad } from './hooks'
import type { Especialidad } from './types'

const especialidadSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  categorias: z.array(z.string()),
})

type EspecialidadFormValues = z.infer<typeof especialidadSchema>

interface EspecialidadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  especialidad?: Especialidad | null
}

const CATEGORIAS_DATALIST_ID = 'categorias-sugeridas'

export function EspecialidadFormDialog({ open, onOpenChange, especialidad }: EspecialidadFormDialogProps) {
  const isEditing = !!especialidad
  const { data: especialidades } = useEspecialidades()
  const createMutation = useCreateEspecialidad()
  const updateMutation = useUpdateEspecialidad()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [categoriaInput, setCategoriaInput] = useState('')

  // Sugerencias para el datalist: categorías ya usadas en cualquier especialidad del catálogo.
  const categoriaSuggestions = useMemo(() => {
    const set = new Set<string>()
    for (const esp of especialidades ?? []) {
      for (const cat of esp.categorias) set.add(cat.categoria)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [especialidades])

  const form = useForm<EspecialidadFormValues>({
    resolver: zodResolver(especialidadSchema),
    defaultValues: { nombre: '', categorias: [] },
  })

  useEffect(() => {
    if (open) {
      setCategoriaInput('')
      form.reset(
        especialidad
          ? { nombre: especialidad.nombre, categorias: especialidad.categorias.map((c) => c.categoria) }
          : { nombre: '', categorias: [] },
      )
    }
  }, [open, especialidad, form])

  const categorias = form.watch('categorias')

  function addCategoria() {
    const value = categoriaInput.trim()
    if (!value) return
    const current = form.getValues('categorias')
    if (current.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setCategoriaInput('')
      return
    }
    form.setValue('categorias', [...current, value], { shouldDirty: true })
    setCategoriaInput('')
  }

  function removeCategoria(value: string) {
    form.setValue(
      'categorias',
      form.getValues('categorias').filter((c) => c !== value),
      { shouldDirty: true },
    )
  }

  async function onSubmit(values: EspecialidadFormValues) {
    try {
      const payload = { nombre: values.nombre, categorias: values.categorias }
      if (isEditing && especialidad) {
        await updateMutation.mutateAsync({ id: especialidad.id, payload })
        toast.success('Especialidad actualizada correctamente.')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Especialidad creada correctamente.')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la especialidad.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar especialidad' : 'Nueva especialidad'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza el nombre y las categorías de tratamiento de esta especialidad.'
              : 'Registra una especialidad del catálogo de la clínica, asignable a profesionales.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ortodoncia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categorias"
              render={() => (
                <FormItem>
                  <FormLabel>Categorías de tratamiento</FormLabel>
                  <FormDescription>
                    Categorías de tratamiento que cubre esta especialidad. Escribe una y presiona «Agregar».
                  </FormDescription>
                  <div className="flex gap-2">
                    <Input
                      list={CATEGORIAS_DATALIST_ID}
                      placeholder="Ej: Endodoncia"
                      value={categoriaInput}
                      onChange={(event) => setCategoriaInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addCategoria()
                        }
                      }}
                    />
                    <datalist id={CATEGORIAS_DATALIST_ID}>
                      {categoriaSuggestions.map((sugerencia) => (
                        <option key={sugerencia} value={sugerencia} />
                      ))}
                    </datalist>
                    <Button type="button" variant="outline" onClick={addCategoria}>
                      <Plus className="size-4" />
                      Agregar
                    </Button>
                  </div>
                  {categorias.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {categorias.map((cat) => (
                        <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                          {cat}
                          <button
                            type="button"
                            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                            onClick={() => removeCategoria(cat)}
                          >
                            <X className="size-3" />
                            <span className="sr-only">Quitar {cat}</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear especialidad'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
