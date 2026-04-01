"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Clock, CheckCircle2, Circle, FileText, Filter } from "lucide-react";

type Issue = {
  id: string;
  ticket_number: string;
  property_name: string;
  category: string;
  urgency: string;
  description: string;
  photo_url: string;
  status: string;
  created_at: string;
};

export default function DashboardTable({ initialIssues }: { initialIssues: Issue[] }) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [propertyFilter, setPropertyFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setIssues(issues.map(issue => issue.id === id ? { ...issue, status: newStatus } : issue));
    
    // Supabase DB update
    const { error } = await supabase
      .from("maintenance_issues")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      alert("Failed to update status: " + error.message);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (propertyFilter && issue.property_name !== propertyFilter) return false;
    if (urgencyFilter && issue.urgency !== urgencyFilter) return false;
    return true;
  });

  const getUrgencyBadge = (urgency: string) => {
    const map = {
      Low: "bg-green-100 text-green-800 border-green-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      High: "bg-red-100 text-red-800 border-red-200",
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold border ${map[urgency as keyof typeof map] || "bg-gray-100"}`;
  };

  const getStatusIcon = (status: string) => {
    if (status === "Resolved") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "In Progress") return <Clock className="w-4 h-4 text-blue-500" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  // Generate unique properties dynamically for the filter
  const uniqueProperties = Array.from(new Set(initialIssues.map(i => i.property_name)));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Top Filters Bar */}
      <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select 
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition min-w-[160px]"
          >
            <option value="">All Properties</option>
            {uniqueProperties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition min-w-[140px]"
          >
            <option value="">All Urgencies</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Wrapping the table to make it responsive on mobile */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Ticket</th>
              <th className="px-6 py-4">Issue Details</th>
              <th className="px-6 py-4">Urgency</th>
              <th className="px-6 py-4">Date Logged</th>
              <th className="px-6 py-4">Current Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No issues found matching your filters.</p>
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50/50 transition bg-white">
                  
                  {/* Ticket Number */}
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-md">
                      {issue.ticket_number}
                    </span>
                  </td>
                  
                  {/* Property & Category Combo */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{issue.property_name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{issue.category}</div>
                    {issue.photo_url && (
                      <a href={issue.photo_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 text-xs flex items-center gap-1 mt-1 font-medium w-fit">
                        📎 View Photo
                      </a>
                    )}
                  </td>
                  
                  {/* Colored Urgency Badge */}
                  <td className="px-6 py-4">
                    <span className={getUrgencyBadge(issue.urgency)}>{issue.urgency}</span>
                  </td>
                  
                  {/* Readable Timestamp */}
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(issue.created_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </td>
                  
                  {/* Interactive Status Mutator Dropdown */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 group">
                       {getStatusIcon(issue.status)}
                       <select
                         value={issue.status}
                         onChange={(e) => updateStatus(issue.id, e.target.value)}
                         className="bg-transparent border border-transparent group-hover:bg-gray-50 group-hover:border-gray-200 rounded px-1.5 -ml-1.5 py-1 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-100 transition font-medium text-gray-800 appearance-none"
                         title="Change status"
                       >
                         <option value="Open">Open</option>
                         <option value="In Progress">In Progress</option>
                         <option value="Resolved">Resolved</option>
                       </select>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
