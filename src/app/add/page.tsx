"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Shield, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AddPersonPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    location: "",
    headline: "",
    avatarUrl: "",
    linkedInUrl: "",
    instagramUrl: "",
    summary: "",
    interestsStr: "",
    hobbiesStr: "",
    communicationStyle: "Thoughtful, direct, and collaborative dialogue",
    intellectualPassionsStr: "",
    lifestyleValuesStr: "Authenticity, Continuous Learning, Emotional Maturity",
    dealbreakersStr: "Dishonesty, Cynicism, Lack of curiosity",
    relationshipIntent: "partnership" as const,
    socialBattery: "ambivert" as const,
    spontaneityLevel: "medium" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.role.trim()) errs.role = "Role is required";
    if (!formData.company.trim()) errs.company = "Company / Institution is required";
    if (!formData.location.trim()) errs.location = "Location is required";

    if (!formData.linkedInUrl.trim()) {
      errs.linkedInUrl = "Official LinkedIn profile URL is required";
    } else if (!formData.linkedInUrl.includes("linkedin.com")) {
      errs.linkedInUrl = "Must be a valid LinkedIn profile URL (https://www.linkedin.com/in/...)";
    }

    if (!formData.instagramUrl.trim()) {
      errs.instagramUrl = "Public Instagram profile URL is required";
    } else if (!formData.instagramUrl.includes("instagram.com")) {
      errs.instagramUrl = "Must be a valid Instagram profile URL (https://www.instagram.com/...)";
    }

    if (formData.summary.trim().length < 10) {
      errs.summary = "Summary must be at least 10 characters";
    }

    const interests = formData.interestsStr.split(",").map((s) => s.trim()).filter(Boolean);
    if (interests.length < 2) {
      errs.interestsStr = "Please provide at least 2 comma-separated interests";
    }

    const hobbies = formData.hobbiesStr.split(",").map((s) => s.trim()).filter(Boolean);
    if (hobbies.length < 2) {
      errs.hobbiesStr = "Please provide at least 2 comma-separated hobbies";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const interests = formData.interestsStr.split(",").map((s) => s.trim()).filter(Boolean);
      const hobbies = formData.hobbiesStr.split(",").map((s) => s.trim()).filter(Boolean);
      const intellectualPassions = formData.intellectualPassionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const lifestyleValues = formData.lifestyleValuesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const dealbreakers = formData.dealbreakersStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        role: formData.role,
        headline: formData.headline || `${formData.role} at ${formData.company}`,
        company: formData.company,
        location: formData.location,
        avatarUrl: formData.avatarUrl || undefined,
        linkedInUrl: formData.linkedInUrl,
        instagramUrl: formData.instagramUrl,
        summary: formData.summary,
        interests,
        hobbies,
        communicationStyle: formData.communicationStyle,
        intellectualPassions: intellectualPassions.length > 0 ? intellectualPassions : undefined,
        lifestyleValues: lifestyleValues.length > 0 ? lifestyleValues : undefined,
        dealbreakers: dealbreakers.length > 0 ? dealbreakers : undefined,
        relationshipIntent: formData.relationshipIntent,
        socialBattery: formData.socialBattery,
        spontaneityLevel: formData.spontaneityLevel,
      };

      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create profile");
      }

      // Successfully created, route to their profile page
      router.push(`/person/${json.data.id}`);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back button & Header */}
      <div>
        <Link
          href="/directory"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to People Directory</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3E5AB]">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-serif">
              Add Verified Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ingest a real individual with official LinkedIn & Instagram sources to instantiate an autonomous agent.
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-luxury rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Section 1: Core Identity */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4">
            1. Core Professional Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Ilya Sutskever"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Role / Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Co-Founder & Chief Scientist"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.role && <p className="text-[11px] text-rose-400 mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company / Organization *
              </label>
              <input
                type="text"
                placeholder="e.g. Safe Superintelligence Inc."
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.company && <p className="text-[11px] text-rose-400 mt-1">{errors.company}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Palo Alto, California, USA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.location && <p className="text-[11px] text-rose-400 mt-1">{errors.location}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Official Evidence Sources */}
        <div className="pt-4 border-t border-[#1E232E]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              2. Official Public URLs (Mandatory Evidence)
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#D4AF37]" /> Verified Sources Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official LinkedIn URL *
              </label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/username"
                value={formData.linkedInUrl}
                onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.linkedInUrl && <p className="text-[11px] text-rose-400 mt-1">{errors.linkedInUrl}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Public Instagram URL *
              </label>
              <input
                type="url"
                placeholder="https://www.instagram.com/handle"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.instagramUrl && <p className="text-[11px] text-rose-400 mt-1">{errors.instagramUrl}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Avatar Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* Section 3: Summary & Structured Signals */}
        <div className="pt-4 border-t border-[#1E232E]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4">
            3. Summary, Interests & Hobbies
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bio / Summary *
              </label>
              <textarea
                rows={3}
                placeholder="Overview of background, intellectual focus, and life philosophy..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.summary && <p className="text-[11px] text-rose-400 mt-1">{errors.summary}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Interests (Comma-Separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deep Learning, Transformers, Epistemology"
                  value={formData.interestsStr}
                  onChange={(e) => setFormData({ ...formData, interestsStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.interestsStr && <p className="text-[11px] text-rose-400 mt-1">{errors.interestsStr}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hobbies (Comma-Separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nature Walks, Classical Music, Chess"
                  value={formData.hobbiesStr}
                  onChange={(e) => setFormData({ ...formData, hobbiesStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.hobbiesStr && <p className="text-[11px] text-rose-400 mt-1">{errors.hobbiesStr}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Preferences & Grounded Priorities */}
        <div className="pt-4 border-t border-[#1E232E]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4">
            4. Preferences, Dealbreakers & Intent
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Relationship Intent
              </label>
              <select
                value={formData.relationshipIntent}
                onChange={(e) => setFormData({ ...formData, relationshipIntent: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="partnership">Long-term Partnership</option>
                <option value="long-term">Long-term Relationship</option>
                <option value="exploratory">Exploratory / Intentional</option>
                <option value="casual">Casual Dating</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Social Battery
              </label>
              <select
                value={formData.socialBattery}
                onChange={(e) => setFormData({ ...formData, socialBattery: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="introvert">Introvert</option>
                <option value="ambivert">Ambivert</option>
                <option value="extrovert">Extrovert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Spontaneity Level
              </label>
              <select
                value={formData.spontaneityLevel}
                onChange={(e) => setFormData({ ...formData, spontaneityLevel: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="low">Low (Structured & Scheduled)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Spontaneous & Adventurous)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Core Lifestyle Values (Comma-Separated)
              </label>
              <input
                type="text"
                value={formData.lifestyleValuesStr}
                onChange={(e) => setFormData({ ...formData, lifestyleValuesStr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dealbreakers (Comma-Separated)
              </label>
              <input
                type="text"
                value={formData.dealbreakersStr}
                onChange={(e) => setFormData({ ...formData, dealbreakersStr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-[#1E232E] flex items-center justify-between">
          <Link
            href="/directory"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="gold-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Normalizing & Generating Agent...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile & Instantiate Agent</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
