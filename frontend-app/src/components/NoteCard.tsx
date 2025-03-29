import { useState } from "react"
import { Button } from "@/components/ui/button"
import { completeNote, deleteNote, updateNote } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NoteCard({ note, onAction }: { note: any, onAction: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(note.title)
  const [editedContent, setEditedContent] = useState(note.content)

  async function handleUpdate() {
    await updateNote(note.id, editedTitle, editedContent)
    setIsEditing(false)
    onAction()
  }

  return (
    <div className="border p-4 rounded-xl shadow space-y-2">
      {isEditing ? (
        <div className="space-y-2">
          <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
          <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleUpdate}>Simpan</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-semibold">{note.title}</h3>
          <p>{note.content}</p>
          <div className="flex gap-2">
            {!note.completed && (
              <Button onClick={async () => { await completeNote(note.id); onAction() }}>
                Tandai Selesai
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={async () => { await deleteNote(note.id); onAction() }}>
              Hapus
            </Button>
          </div>
          {note.completed && <span className="text-green-600 font-semibold">✅ Selesai</span>}
        </>
      )}
    </div>
  )
}
