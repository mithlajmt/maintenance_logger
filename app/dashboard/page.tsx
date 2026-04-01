import DashboardTable from "@/components/DashboardTable";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0; // Disable static caching so dashboard reflects instant DB updates

export default async function DashboardPage() {
  const { data: issues, error } = await supabase
    .from("maintenance_issues")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-red-500 max-w-lg border border-red-100">
          <h2 className="font-bold text-xl mb-2 text-red-600">Database Connection Error</h2>
          <p className="text-sm text-gray-600 mb-4">
            Could not load the dashboard data. Please ensure you have created the `maintenance_issues` table in Supabase according to the schema.
          </p>
          <pre className="p-4 bg-red-50 text-xs text-red-800 rounded-lg overflow-x-auto border border-red-100">
            {error.message}
          </pre>
          <Link href="/" className="mt-6 inline-block bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-black">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition mb-3 group p-1 -ml-1 rounded-lg hover:bg-white">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Submit Portal
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Maintenance Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Track and manage facility issues across all integrated properties.
            </p>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-6 md:gap-8 shrink-0">
             <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Open</p>
                <p className="text-2xl font-black text-gray-900">
                  {issues?.filter(i => i.status === 'Open').length || 0}
                </p>
             </div>
             <div className="w-px h-10 bg-gray-100 hidden sm:block"></div>
             <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">In Progress</p>
                <p className="text-2xl font-black text-blue-600">
                  {issues?.filter(i => i.status === 'In Progress').length || 0}
                </p>
             </div>
             <div className="w-px h-10 bg-gray-100 hidden sm:block"></div>
             <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Resolved</p>
                <p className="text-2xl font-black text-green-500">
                  {issues?.filter(i => i.status === 'Resolved').length || 0}
                </p>
             </div>
          </div>
        </div>

        <DashboardTable initialIssues={issues || []} />
      </div>
    </div>
  );
}
