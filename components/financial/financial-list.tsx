"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { FinancialTransaction } from "@/lib/types/database"

type TransactionWithRelations = FinancialTransaction & {
  clients?: {
    id: string
    name: string
  } | null
  processes?: {
    id: string
    title: string
    process_number: string
  } | null
}

export function FinancialList({ transactions }: { transactions: TransactionWithRelations[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600">Nenhuma transação registrada ainda.</p>
        <Link href="/dashboard/financial/new">
          <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">Criar primeira transação</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-200">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{transaction.title}</h3>
              <Badge
                variant={transaction.type === "income" ? "default" : "secondary"}
                className={transaction.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
              >
                {transaction.type === "income" ? "Receita" : "Despesa"}
              </Badge>
              <Badge
                variant={
                  transaction.status === "paid"
                    ? "default"
                    : transaction.status === "overdue"
                      ? "destructive"
                      : "secondary"
                }
                className={
                  transaction.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : transaction.status === "overdue"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }
              >
                {transaction.status === "paid"
                  ? "Pago"
                  : transaction.status === "overdue"
                    ? "Atrasado"
                    : transaction.status === "pending"
                      ? "Pendente"
                      : "Cancelado"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {Number(transaction.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              {transaction.due_date && (
                <>
                  <span>•</span>
                  <span>Vencimento: {new Date(transaction.due_date).toLocaleDateString("pt-BR")}</span>
                </>
              )}
              {transaction.clients && (
                <>
                  <span>•</span>
                  <span>Cliente: {transaction.clients.name}</span>
                </>
              )}
              {transaction.category && (
                <>
                  <span>•</span>
                  <span>{transaction.category}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {transaction.status === "pending" && (
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Link href={`/dashboard/financial/${transaction.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
