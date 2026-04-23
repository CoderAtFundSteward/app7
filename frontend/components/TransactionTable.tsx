import type { Transaction } from "@/lib/api";

type TransactionTableProps = {
  transactions: Transaction[];
};

export default function TransactionTable({ transactions }: TransactionTableProps) {
  if (!transactions.length) {
    return (
      <div className="rounded border bg-white p-4 text-sm text-slate-600">
        No transactions found yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2">Account</th>
            <th className="px-3 py-2">Amount</th>
            <th className="px-3 py-2">Currency</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id} className="border-t">
              <td className="px-3 py-2">{txn.txn_date}</td>
              <td className="px-3 py-2">{txn.description}</td>
              <td className="px-3 py-2">{txn.account_name}</td>
              <td className="px-3 py-2">{txn.amount.toFixed(2)}</td>
              <td className="px-3 py-2">{txn.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
