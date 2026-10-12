"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Plus,
  Instagram,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatDateIST, formatDateTimeIST } from "@/lib/utils";

export default function ContentCalendarPage() {
  const [items, setItems] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Create post state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formClientId, setFormClientId] = useState("");
  const [formDate, setFormDate] = useState("2026-10-18T11:00");
  const [formType, setFormType] = useState("REEL");
  const [formTopic, setFormTopic] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [formHashtags, setFormHashtags] = useState("#marketing #growth #arvian");

  useEffect(() => {
    fetchCalendar();
    fetchClients();
  }, [selectedClient, selectedStatus]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClient !== "ALL") params.append("clientId", selectedClient);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);

      const res = await fetch(`/api/content-calendar?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data.clients || []);
      if (data.clients?.length > 0) {
        setFormClientId(data.clients[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formClientId,
          publishDate: formDate,
          postType: formType,
          topic: formTopic,
          caption: formCaption,
          hashtags: formHashtags,
          status: "IDEA",
        }),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setFormTopic("");
        setFormCaption("");
        fetchCalendar();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceStatus = async (item: any) => {
    const statusFlow = [
      "IDEA",
      "BRIEF_PENDING",
      "DESIGN_IN_PROGRESS",
      "INTERNAL_REVIEW",
      "CLIENT_APPROVAL_PENDING",
      "APPROVED",
      "SCHEDULED",
      "PUBLISHED",
    ];
    const currentIndex = statusFlow.indexOf(item.status);
    const nextStatus = currentIndex >= 0 && currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : "PUBLISHED";

    try {
      await fetch("/api/content-calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      });
      fetchCalendar();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-pink-600" />
            Agency Content Calendar (Instagram & Social Media)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan, review copy & creatives, obtain client approval, and schedule social media publications
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm transition"
        >
          <Plus size={16} />
          <span>Schedule Post</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-700 font-semibold"
          >
            <option value="ALL">All Client Accounts</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName} ({c.instagramHandle || c.customId})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-700"
          >
            <option value="ALL">All Content Statuses</option>
            <option value="IDEA">Idea</option>
            <option value="DESIGN_IN_PROGRESS">Design In Progress</option>
            <option value="CLIENT_APPROVAL_PENDING">Client Approval Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Viewing <strong>{items.length}</strong> scheduled publications for October 2026
        </div>
      </div>

      {/* Calendar List View */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading social calendar...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <CalendarDays size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">No scheduled posts found</h3>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Schedule Post&quot; to plan your first piece of client content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-pink-300 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Clock size={12} className="text-pink-600" />
                    {formatDateIST(item.publishDate)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                    {item.postType}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-xs font-bold text-purple-700 block truncate">
                    {item.client?.businessName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{item.topic}</h3>
                </div>

                {item.caption && (
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {item.caption}
                  </p>
                )}

                {item.hashtags && (
                  <p className="mt-1 text-[11px] text-blue-600 font-mono truncate">{item.hashtags}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {item.status.replace(/_/g, " ")}
                </span>

                <button
                  onClick={() => handleAdvanceStatus(item)}
                  className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold rounded text-[11px] transition"
                  title="Move to next stage in approval workflow"
                >
                  Advance →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE POST MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Schedule Instagram Publication</h3>
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Client Account *</label>
                <select
                  required
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.instagramHandle || c.customId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Publish Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Post Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="REEL">Instagram Reel (9:16)</option>
                    <option value="CAROUSEL">Educational Carousel</option>
                    <option value="POST">Single Static Post</option>
                    <option value="STORY">Story / Poll</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Content Topic / Hook *</label>
                <input
                  type="text"
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. 3 Common Mistakes Killing Your Conversion Rate"
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Caption Draft</label>
                <textarea
                  rows={3}
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="Draft caption copy with call to action..."
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Hashtags</label>
                <input
                  type="text"
                  value={formHashtags}
                  onChange={(e) => setFormHashtags(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg"
                >
                  Schedule Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
