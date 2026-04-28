import type { Transaction } from "@/lib/api";

type TransactionTableProps = {
  transactions: Transaction[];
};

export default function TransactionTable({ transactions }: TransactionTableProps) {
  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-outline bg-surface p-4 text-sm text-on-surface-variant">
        No transactions found yet.
      </div>
    );
  }

  return (
    <div className="editorial-shadow overflow-x-auto rounded-xl border border-outline bg-surface">
      <table className="min-w-full text-left text-sm text-on-surface">
        <thead className="border-b border-outline bg-background text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
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
            <tr key={txn.id} className="border-t border-outline">
              <td className="px-3 py-2">{txn.txn_date}</td>
              <td className="px-3 py-2">{txn.description}</td>
              <td className="px-3 py-2">{txn.account_name}</td>
              <td className="px-3 py-2 font-medium">{txn.amount.toFixed(2)}</td>
              <td className="px-3 py-2">{txn.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
