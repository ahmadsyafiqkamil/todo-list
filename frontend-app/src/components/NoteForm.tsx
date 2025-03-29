'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addNote } from "@/lib/api"

export default function NoteForm({ onNoteAdded }: { onNoteAdded: () => void }) {
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validasi input kosong
    if (!title.trim() || !note.trim()) {
      setError("Judul dan isi catatan tidak boleh kosong.")
      return
    }

    try {
      setLoading(true)
      setError("") // Reset error

      const result = await addNote(title, note)

      if (result?.message !== "Transaction successful") {
        throw new Error(result.detail || "Terjadi kesalahan saat menambahkan catatan.")
      }

      // Reset form
      setTitle("")
      setNote("")
      onNoteAdded()
    } catch (err: any) {
      setError(err.message || "Gagal mengirim catatan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <div className="text-red-600 font-medium">{error}</div>}

      <Input
        placeholder="Judul"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />

      <Textarea
        placeholder="Isi catatan"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={loading}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Mengirim..." : "Tambah Catatan"}
      </Button>
    </form>
  )
}
