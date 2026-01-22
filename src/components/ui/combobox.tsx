"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ── Command Components (Inline for simplicity) ──────────────────────────────
const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-950",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 text-right",
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      // Base styles - ensure clickable and visible text
      "relative flex cursor-pointer pointer-events-auto select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      // Text color - ensure it's dark and visible
      "text-gray-900",
      // Hover and selected states
      "hover:bg-[#7f2dfb]/10 hover:text-[#7f2dfb]",
      "aria-selected:bg-[#7f2dfb]/10 aria-selected:text-[#7f2dfb]",
      // Only disable if explicitly disabled
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

// ── Combobox Component ──────────────────────────────────────────────────────
// ── Combobox Component ──────────────────────────────────────────────────────
export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="combobox-list"
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white text-sm px-4 py-2.5 transition-all outline-none flex items-center justify-between text-gray-900 group hover:border-[#7f2dfb]/50",
            "focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <span className={cn(!value && "text-gray-500", "truncate flex items-center gap-2")}>
            {value ? (
              <>
                {selectedOption?.icon && <span className="text-gray-400 group-hover:text-[#7f2dfb] transition-colors">{selectedOption.icon}</span>}
                {selectedOption?.label}
              </>
            ) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onChange(option.value === value ? "" : option.value)
                  setOpen(false)
                }}
                className="group"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-[#7f2dfb]",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2 flex-1">
                  {option.icon && <span className="text-gray-400 group-data-[selected=true]:text-[#7f2dfb]">{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
