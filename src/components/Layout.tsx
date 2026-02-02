import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#071A36] text-white p-6 space-y-4">

        <h2 className="text-2xl font-bold mb-6">Zist Admin</h2>

        <nav className="space-y-2">
          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/dashboard">Dashboard</Link>

          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/new-application">New Application</Link>
          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/applications">Applications</Link>

          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/beneficiaries">Beneficiaries</Link>

          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/payments">Payments</Link>

          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/donors">Donors</Link>
          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/trust-documents">Trust Documents</Link>
          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/bot-minutes">BOT Minutes</Link>
          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/bank-documents">Bank Documents</Link>
          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/other-documents">Other Documents</Link>

          {/* USERS TAB FIXED */}
          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/users">Users</Link>

          <Link className="block py-2 px-3 hover:bg-[#0A234A] rounded" to="/import-data">Import Data</Link>

          <button className="mt-6 w-full bg-red-600 py-2 rounded">Logout</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
