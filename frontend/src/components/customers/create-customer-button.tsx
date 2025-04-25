"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomerForm } from "./customer-form"

export function CreateCustomerButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Add Customer
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
} 