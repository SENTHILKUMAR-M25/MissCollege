"use client"

import { useState, useTransition, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, FileText, Bell, Users, X, Trash2, Edit2, CheckCircle2 } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { createNotice, deleteNotice } from "@/actions/notices"

type Notice = {
  id: string
  title: string
  description: string
  targetAudience: string
  createdAt: Date
  updatedAt: Date
  creator: { name: string | null }
}

type Props = {
  notices: Notice[]
}

const audiences = ["All", "Students", "Faculty", "Public", "Internal"]

export default function NoticesClient({ notices: initialNotices }: Props) {
  const [notices, setNotices] = useState(initialNotices)
  const [search, setSearch] = useState("")
  const [audience, setAudience] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const activeCount = notices.length

  const filtered = notices.filter((n) =>
    (audience === "All" || n.targetAudience === audience) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createNotice(formData)
      if (result.success) {
        setShowModal(false)
        formRef.current?.reset()
        window.location.reload()
      }
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNotice(id)
      setNotices((prev) => prev.filter((n) => n.id !== id))
    })
  }

  const audienceColors: Record<string, string> = {
    Public: "text-emerald-400 bg-emerald-500/10",
    Students: "text-blue-400 bg-blue-500/10",
    Faculty: "text-violet-400 bg-violet-500/10",
    Internal: "text-amber-400 bg-amber-500/10",
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Notices & Announcements</h2>
          <p className="text-slate-400 text-sm mt-0.5">{activeCount} active notices across the campus</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/25">
          <Plus size={15} /> Create Notice
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notices by title or content…"
            className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-slate-500" /></button>}
        </div>
        <select value={audience} onChange={(e) => setAudience(e.target.value)}
          className="bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none">
          {audiences.map((a) => <option key={a} className="bg-slate-800">Audience: {a}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          {notices.length === 0 ? "No notices yet. Create the first one!" : "No notices match your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((notice, idx) => (
              <motion.div key={notice.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="group relative bg-slate-800/50 border border-white/5 rounded-2xl p-5 hover:bg-slate-800 transition-colors flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    audienceColors[notice.targetAudience] ?? "text-slate-400 bg-slate-500/10")}>
                    {notice.targetAudience}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(notice.id)} disabled={isPending}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-400 transition-all disabled:opacity-50">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-2 text-white">{notice.title}</h3>
                <p className="text-sm line-clamp-3 mb-4 flex-1 text-slate-300">{notice.description}</p>
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-y-2 gap-x-4 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1.5"><Users size={13} /> {notice.targetAudience}</div>
                </div>
                <div className="mt-3 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest">
                  <span>Posted: {new Date(notice.createdAt).toLocaleDateString("en-IN")}</span>
                  {notice.creator.name && <span>By: {notice.creator.name}</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-800 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <h2 className="text-white font-bold">Create New Notice</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400"><X size={15} /></button>
              </div>
              <form ref={formRef} action={handleCreate}>
                <div className="p-6 space-y-5 overflow-y-auto">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Notice Title</label>
                    <input name="title" required placeholder="Enter notice title..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Target Audience</label>
                    <select name="targetAudience"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50">
                      {["All", "Students", "Faculty", "Public", "Internal"].map((a) => (
                        <option key={a} className="bg-slate-800">{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Content</label>
                    <textarea name="description" rows={6} required placeholder="Write notice content here..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-white/5 shrink-0">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={isPending}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 flex justify-center items-center gap-2 disabled:opacity-70">
                    <CheckCircle2 size={16} /> {isPending ? "Creating…" : "Create Notice"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
