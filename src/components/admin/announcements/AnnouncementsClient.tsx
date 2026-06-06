"use client"

import { useState, useTransition, useRef, type ComponentType } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, X, Globe, Lock, Trash2, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createNotice, deleteNotice } from "@/actions/notices"

const MotionDiv = motion.div as ComponentType<any>

type Notice = {
  id: string
  title: string
  description: string
  targetAudience: string
  createdAt: Date
  creator: { name: string | null }
}

type Props = {
  notices: Notice[]
}

export default function AnnouncementsClient({ notices: initialNotices }: Props) {
  const [notices, setNotices] = useState(initialNotices)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const filtered = notices.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createNotice(formData)
      if (result.success) {
        setShowModal(false)
        formRef.current?.reset()
        // Refresh optimistically — revalidatePath handles DB side
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Public Announcements</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage public-facing website announcements</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/25">
          <Plus size={15} /> New Announcement
        </button>
      </div>

      <div className="flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 max-w-md">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search announcements…"
          className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1" />
        {search && <button onClick={() => setSearch("")}><X size={13} className="text-slate-500" /></button>}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          No announcements yet. Create the first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <div key={a.id} className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col group">
              <div className="flex justify-between items-start mb-3">
                <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                  a.targetAudience === "Public" ? "bg-emerald-500/10 text-emerald-400" : "bg-violet-500/10 text-violet-400")}>
                  {a.targetAudience === "Public" ? <Globe size={11} /> : <Lock size={11} />}
                  {a.targetAudience}
                </span>
                <button onClick={() => handleDelete(a.id)} disabled={isPending}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{a.title}</h3>
              <p className="text-slate-400 text-sm mb-4 flex-1">{a.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div>
                  <p className="text-xs text-slate-500">Posted: {new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
                  {a.creator.name && <p className="text-xs text-slate-600">by {a.creator.name}</p>}
                </div>
                <button className="text-amber-400 text-xs font-semibold flex items-center gap-1 hover:text-amber-300">
                  <Share2 size={12} /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-800 border border-white/10 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-white font-bold">New Announcement</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400"><X size={15} /></button>
              </div>
              <form ref={formRef} action={handleCreate}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Title</label>
                    <input name="title" required placeholder="Announcement Title"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Audience</label>
                    <select name="targetAudience" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
                      <option className="bg-slate-800">Public</option>
                      <option className="bg-slate-800">Students</option>
                      <option className="bg-slate-800">Faculty</option>
                      <option className="bg-slate-800">Internal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">Content</label>
                    <textarea name="description" rows={4} required placeholder="Description..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none" />
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-white/5">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={isPending}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold disabled:opacity-70">
                    {isPending ? "Posting…" : "Post"}
                  </button>
                </div>
              </form>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
