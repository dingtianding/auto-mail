"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Dialog({ open, onClose, children }: DialogProps) {
  if (!open) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        {children}
      </div>
    </>
  )
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  )
} 