import { Customer } from "@/types/customer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CustomerListProps {
  customers: Customer[]
}

export function CustomerList({ customers }: CustomerListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.phone}</TableCell>
            <TableCell>{customer.address}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 