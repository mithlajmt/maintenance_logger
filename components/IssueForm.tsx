"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { UploadCloud, X, CheckCircle2 } from "lucide-react";

const PROPERTIES = ["Sunrise Apartments", "Oasis Tower", "Grand Plaza", "Pinecrest Complex", "Lakeside Residences"];
const CATEGORIES = ["Plumbing", "Electrical", "AC/HVAC", "Furniture", "Cleaning", "Other"];
const URGENCIES = ["Low", "Medium", "High"];

export default function IssueForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    property_name: "",
    category: "",
    urgency: "",
    description: "",
    file: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.property_name) newErrors.property_name = "Please select a property";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.urgency) newErrors.urgency = "Please select an urgency level";
    if (!form.description.trim()) newErrors.description = "Please describe the issue";
    return newErrors;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrors((prev) => ({ ...prev, file: "" }));

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: "Photo must be under 5MB" }));
        e.target.value = "";
        return;
      }
      setForm((prev) => ({ ...prev, file }));
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setForm((prev) => ({ ...prev, file: null }));
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    // Generate simple readable ticket number
    const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketNum = `MNT-${uniqueId}`;

    try {
      let photoUrl = null;
      if (form.file) {
        const fileName = `${ticketNum}-${form.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
        const { error: uploadError } = await supabase.storage
          .from("maintenance-photos")
          .upload(fileName, form.file);

        if (uploadError && !uploadError.message.includes("Bucket not found")) {
           throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("maintenance-photos")
          .getPublicUrl(fileName);
        photoUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.from("maintenance_issues").insert([
        {
          ticket_number: ticketNum,
          property_name: form.property_name,
          category: form.category,
          urgency: form.urgency,
          description: form.description,
          photo_url: photoUrl,
          status: "Open"
        }
      ]);

      if (dbError) throw dbError;

      setSubmittedTicket(ticketNum);
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err.message || "Failed to submit issue. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-auto">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Logged!</h2>
        <p className="text-gray-500 mb-6">
          Your maintenance request has been submitted successfully to the management team.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Your Ticket Number</p>
          <p className="text-2xl font-mono text-indigo-600 font-bold">{submittedTicket}</p>
        </div>
        <button
          onClick={() => {
            setSubmittedTicket(null);
            setForm({ property_name: "", category: "", urgency: "", description: "", file: null });
            setFilePreview(null);
          }}
          className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition shadow-sm"
        >
          Submit Another Issue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 max-w-xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Name <span className="text-red-400">*</span>
        </label>
        <select
          value={form.property_name}
          onChange={(e) => {
            setForm({ ...form, property_name: e.target.value });
            if (errors.property_name) setErrors({ ...errors, property_name: "" });
          }}
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${errors.property_name ? "border-red-400 bg-red-50 text-red-900" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"}`}
        >
          <option value="">Select Property</option>
          {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {errors.property_name && <p className="text-xs text-red-500 mt-1.5">{errors.property_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Issue Category <span className="text-red-400">*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => {
            setForm({ ...form, category: e.target.value });
            if (errors.category) setErrors({ ...errors, category: "" });
          }}
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${errors.category ? "border-red-400 bg-red-50 text-red-900" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"}`}
        >
          <option value="">Select Category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1.5">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Urgency Level <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {URGENCIES.map((u) => {
            const isSelected = form.urgency === u;
            const colors = {
               Low: isSelected ? "border-green-500 bg-green-50 text-green-700 font-medium" : "border-gray-200 text-gray-600 hover:border-green-200 hover:bg-green-50/50",
               Medium: isSelected ? "border-yellow-500 bg-yellow-50 text-yellow-700 font-medium" : "border-gray-200 text-gray-600 hover:border-yellow-200 hover:bg-yellow-50/50",
               High: isSelected ? "border-red-500 bg-red-50 text-red-700 font-medium" : "border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50/50"
            }[u as "Low" | "Medium" | "High"];

            return (
              <label key={u} className={`cursor-pointer rounded-xl border text-center py-2.5 text-sm transition-all duration-200 select-none ${colors}`}>
                <input
                  type="radio"
                  name="urgency"
                  value={u}
                  checked={isSelected}
                  onChange={(e) => {
                    setForm({ ...form, urgency: e.target.value });
                    if (errors.urgency) setErrors({ ...errors, urgency: "" });
                  }}
                  className="hidden"
                />
                {u}
              </label>
            );
          })}
        </div>
        {errors.urgency && <p className="text-xs text-red-500 mt-1.5">{errors.urgency}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            if (errors.description) setErrors({ ...errors, description: "" });
          }}
          placeholder="Please describe the issue in detail..."
          rows={4}
          className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition resize-none ${errors.description ? "border-red-400 bg-red-50 text-red-900" : "border-gray-200 bg-gray-50 text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"}`}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1.5">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo Evidence <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        
        {filePreview ? (
          <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-100 group">
             <img src={filePreview} alt="Preview" className="w-full h-48 object-cover" />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button
                  type="button"
                  onClick={removeFile}
                  className="bg-white text-red-600 font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 shadow-lg transform transition active:scale-95"
                >
                  <X size={18} /> Remove Photo
                </button>
             </div>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
          >
            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Click to upload photo</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {errors.file && <p className="text-xs text-red-500 mt-1.5">{errors.file}</p>}
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? "Logging Issue..." : "Submit Maintenance Ticket"}
      </button>
    </form>
  );
}
