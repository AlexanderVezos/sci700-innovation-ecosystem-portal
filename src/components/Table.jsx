function Table() {
  return (
    <table className="bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.25)] w-full max-w-2xl border-separate border-spacing-0 overflow-hidden">
      <thead>
        <tr className="bg-slate-50">
          <th className="p-4 text-left font-semibold text-slate-500">Name</th>
          <th className="p-4 text-left font-semibold text-slate-500">Role</th>
          <th className="p-4 text-left font-semibold text-slate-500">Status</th>
        </tr>
      </thead>
      <tbody>
        {["Alice", "Bob", "Carol"].map((name, i) => (
          <tr key={i} className="border-t border-slate-100">
            <td className="p-4 text-sm text-slate-700">{name}</td>
            <td className="p-4 text-sm text-slate-500">Founder</td>
            <td className="p-4 text-sm text-slate-500">Active</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
