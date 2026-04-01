import IssueForm from "@/components/IssueForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="border-b border-gray-200 pb-6 mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase mb-1">
              Facilities Management
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Log an Issue
            </h1>
          </div>
          <Link href="/dashboard" className="flex items-baseline gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition group p-2 rounded-lg hover:bg-indigo-50">
            View Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform relative top-0.5" />
          </Link>
        </div>

        <IssueForm />
      </div>
    </div>
  );
}
