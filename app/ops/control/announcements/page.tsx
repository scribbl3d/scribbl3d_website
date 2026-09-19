"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnnouncementContent } from "@/components/announcement-content";
import { announcementIcons, announcementSchema, isSafeAnnouncementLink, type Announcement, type AnnouncementInput } from "@/lib/announcements";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const emptyForm: AnnouncementInput = { text: "", icon: "truck", linkLabel: null, linkUrl: null, isActive: false, sortOrder: 0 };

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState<AnnouncementInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const messageRef = useRef<HTMLInputElement>(null);
  const hasPreview = !!form.text.trim() || !!(form.linkLabel?.trim() && form.linkUrl && isSafeAnnouncementLink(form.linkUrl.trim()));

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch("/api/announcements?admin=true", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load announcements");
      setAnnouncements(data);
      setError(null);
      return true;
    } catch (error) {
      setLoadError(true);
      setError(error instanceof Error ? error.message : "Unable to load announcements");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const mutate = async (url: string, method: string, data?: AnnouncementInput) => {
    setBusy(true);
    setError(null);
    setStatus("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(data ? { body: JSON.stringify(data) } : {}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save changes");
      const refreshed = await load();
      setStatus(refreshed ? "Changes saved. The storefront refreshes announcements within a minute or when visitors return to the tab." : "Changes saved, but the list could not be reloaded. Please retry loading announcements.");
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save changes");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = announcementSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const saved = await mutate(editingId ? `/api/announcements/${editingId}` : "/api/announcements", editingId ? "PATCH" : "POST", parsed.data);
    if (saved) resetForm();
  };

  const edit = ({ id, ...data }: Announcement) => {
    setEditingId(id);
    setForm(data);
    setError(null);
    setStatus("");
    messageRef.current?.focus();
    messageRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
  };

  const toggle = async ({ id, ...data }: Announcement) => {
    const saved = await mutate(`/api/announcements/${id}`, "PATCH", { ...data, isActive: !data.isActive });
    if (saved && editingId === id) setForm((current) => ({ ...current, isActive: !data.isActive }));
  };

  const remove = async (announcement: Announcement) => {
    if (!window.confirm(`Delete this announcement?\n\n${announcement.text || announcement.linkLabel}`)) return;
    if (await mutate(`/api/announcements/${announcement.id}`, "DELETE")) {
      if (editingId === announcement.id) resetForm();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-10 pt-20">
      <Link href="/ops/control" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to dashboard</Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Announcements</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Manage the slim bar above your storefront navbar. Published messages rotate every 4 seconds in automatic newest-first order; drafts remain private. The bar is hidden when nothing is published.</p>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {status && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{status}</p>}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5"><CardTitle className="text-base">{editingId ? "Edit announcement" : "New announcement"}</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
          <form onSubmit={save} className="space-y-3">
            <fieldset disabled={busy || loading || loadError} className="space-y-3 disabled:opacity-60">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="announcement-message" className="leading-4">Message (optional)</Label>
                    <span id="message-count" className="text-xs tabular-nums text-slate-500">{form.text.length}/160</span>
                  </div>
                  <Input ref={messageRef} id="announcement-message" value={form.text} maxLength={160} onChange={(event) => setForm({ ...form, text: event.target.value })} placeholder="Enter announcement text" aria-describedby="message-help message-count" className="h-10 sm:h-9" />
                  <p id="message-help" className="sr-only">Use text only, one link only, or text followed by one inline link.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="announcement-icon" className="block leading-4">Icon</Label>
                  <select id="announcement-icon" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value as AnnouncementInput["icon"] })} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm capitalize sm:h-9">
                    {announcementIcons.map((icon) => <option key={icon} value={icon}>{icon === "none" ? "No icon" : icon}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor="announcement-link-label">Link text (optional)</Label>
                  <Input id="announcement-link-label" value={form.linkLabel || ""} maxLength={32} onChange={(event) => setForm({ ...form, linkLabel: event.target.value })} placeholder="Shop now" aria-describedby="link-help" className="h-10 sm:h-9" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor="announcement-link-url">Link destination (optional)</Label>
                  <Input id="announcement-link-url" value={form.linkUrl || ""} maxLength={2048} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} placeholder="/prebuilt-products or https://…" aria-describedby="link-help" className="h-10 sm:h-9" />
                </div>
              </div>
              <p id="link-help" className="text-xs text-slate-500">Add both link fields, or leave both empty.</p>
            </fieldset>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Preview</p>
              <div className="rounded-md bg-[#080e1c] px-3 py-2 font-manrope text-white">
                {hasPreview ? <AnnouncementContent announcement={form} interactive={false} /> : <p className="py-1 text-center text-xs text-slate-400">Your announcement preview will appear here.</p>}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.isActive} disabled={busy || loading || loadError} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-blue-600" />Publish on storefront
              </label>
              <div className="flex flex-wrap gap-2">
                {editingId && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={resetForm}>Cancel editing</Button>}
                <Button type="submit" size="sm" disabled={busy || loading || loadError}>{busy ? "Saving…" : editingId ? "Save changes" : form.isActive ? "Create & publish" : "Save draft"}</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Saved announcements <span className="text-base font-normal text-slate-500">({announcements.filter((item) => item.isActive).length} published)</span></CardTitle></CardHeader>
        <CardContent>
          {loading ? <p role="status" className="py-6 text-sm text-slate-500">Loading announcements…</p> : loadError ? (
            <div className="space-y-3 py-6 text-sm text-slate-600">
              <p>Announcements could not be loaded. Resolve the error above, then try again.</p>
              <Button type="button" variant="outline" onClick={() => void load()}>Retry loading</Button>
            </div>
          ) : !announcements.length ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center">
              <Plus aria-hidden="true" className="mx-auto mb-3 h-6 w-6 text-slate-400" />
              <p className="font-medium">No announcements yet</p>
              <p className="mt-1 text-sm text-slate-500">Create your first message above. Nothing is shown to customers until you publish.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2.5 py-1 font-medium ${announcement.isActive ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}`}>{announcement.isActive ? "Published" : "Draft"}</span>
                      <span className="text-slate-500">{announcement.icon === "none" ? "No icon" : announcement.icon}</span>
                    </div>
                    <p className="break-words font-medium [overflow-wrap:anywhere]">{announcement.text || announcement.linkLabel}</p>
                    {announcement.linkUrl && <p className="break-all text-sm text-slate-500">{announcement.linkLabel} → {announcement.linkUrl}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void toggle(announcement)}>{announcement.isActive ? "Unpublish" : "Publish"}</Button>
                    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => edit(announcement)} aria-label={`Edit ${announcement.text || announcement.linkLabel}`}><Pencil aria-hidden="true" className="mr-1 h-3.5 w-3.5" />Edit</Button>
                    <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void remove(announcement)} aria-label={`Delete ${announcement.text || announcement.linkLabel}`}><Trash2 aria-hidden="true" className="h-4 w-4 text-red-600" /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
