'use client'

import * as React from 'react'
import { ChevronDown, ShieldCheck, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterDropdownProps {
  label: string
  options: { label: string; value: string; icon?: React.ElementType }[]
  onSelect: (value: string) => void
  currentValue?: string
}

export function FilterDropdown({ label, options, onSelect, currentValue }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === currentValue)

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "inline-flex w-full min-w-[120px] justify-between items-center gap-x-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-on-surface border border-outline-variant hover:bg-slate-100 transition-all outline-none",
            isOpen && "ring-2 ring-primary/20 border-primary/30"
          )}
        >
          <span className="flex items-center gap-2">
            {selectedOption ? (
              <span className="text-primary">{selectedOption.label}</span>
            ) : (
              <span className="text-on-surface">Todos</span>
            )}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-on-surface-variant transition-transform", isOpen && "rotate-180")} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-48 origin-top-left rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-100 border border-outline-variant">
          <div className="py-1">
            <button
              onClick={() => {
                onSelect('')
                setIsOpen(false)
              }}
              className={cn(
                "flex w-full items-center px-4 py-2.5 text-xs transition-colors",
                !currentValue ? "bg-primary/5 text-primary font-bold" : "text-on-surface hover:bg-slate-50"
              )}
            >
              Todos
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-xs transition-colors border-t border-outline-variant/30",
                  currentValue === option.value ? "bg-primary/5 text-primary font-bold" : "text-on-surface hover:bg-slate-50"
                )}
              >
                {option.icon && <option.icon className={cn("w-4 h-4", currentValue === option.value ? "text-primary" : "text-on-surface-variant")} />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
