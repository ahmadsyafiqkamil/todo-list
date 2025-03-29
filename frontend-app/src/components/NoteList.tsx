'use client'

import { useEffect, useState } from "react"
import { fetchNotes } from "@/lib/api"
import NoteCard from "./NoteCard"
import NoteForm from "./NoteForm"

export default function NoteList() {
  const [notes, setNotes] = useState<any[]>([])

  async function loadNotes() {
    const data = await fetchNotes()
    setNotes(data.notes)
  }

  useEffect(() => {
    loadNotes()
  }, [])

  return (
    <div className="space-y-4">
      <NoteForm onNoteAdded={loadNotes} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onAction={loadNotes} />
        ))}
      </div>
    </div>
  )
}
