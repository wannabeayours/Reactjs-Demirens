import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const AddVisitorModal = ({
  open,
  onOpenChange,
  initialName = '',
  title = 'Visitor',
  confirmLabel = 'Save',
  onConfirm,
  // Capacity-related (optional)
  isCapacityConfigured = false,
  maxCapacity = 0,
  currentOccupancy = 0,
  currentVisitorsCount = 0,
  mode = 'add', // 'add' | 'edit'
}) => {
  const [name, setName] = useState(initialName || '')

  useEffect(() => {
    setName(initialName || '')
  }, [initialName])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange?.(false)
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  const handleConfirm = () => {
    const trimmed = String(name || '').trim()
    if (!trimmed) {
      toast.error('Visitor name is required')
      return
    }
    try {
      onConfirm?.(trimmed)
      onOpenChange?.(false)
    } catch (e) {
      console.error('Failed confirming visitor name', e)
      toast.error('Failed to save visitor')
    }
  }

  // Capacity preview and controls
  const isAddAction = String(confirmLabel || '').toLowerCase().includes('add') && mode === 'add'
  const currentTotal = Number(currentOccupancy || 0) + Number(currentVisitorsCount || 0)
  const remainingNow = Math.max(0, Number(maxCapacity || 0) - currentTotal)
  const previewTotal = currentTotal + (String(name || '').trim() ? 1 : 0)
  const capacityReached = Boolean(isAddAction && isCapacityConfigured && currentTotal >= Number(maxCapacity || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-50 w-[98vw] sm:max-w-[900px] md:max-w-[1000px] bg-background border border-border rounded-xl shadow-2xl p-6 text-base md:text-lg">
        <div className="mb-3">
          <Label className="text-base">{title}</Label>
          <p className="text-base md:text-lg text-muted-foreground">Enter the visitor's full name.</p>
          {isCapacityConfigured ? (
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Capacity: {currentTotal} / {maxCapacity}. Remaining: {remainingNow}.
              {isAddAction && String(name || '').trim() && (
                <> After adding: {previewTotal} / {maxCapacity}.</>
              )}
            </p>
          ) : (
            <p className="text-sm md:text-base text-muted-foreground mt-1">No capacity configured.</p>
          )}
        </div>
        <Input className="bg-muted/30 border-border text-base" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter visitor name" />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirm}
            variant={capacityReached ? 'destructive' : undefined}
            disabled={!String(name || '').trim() || capacityReached}
            title={capacityReached ? 'Capacity reached' : undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddVisitorModal
