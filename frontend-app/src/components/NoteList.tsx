'use client'

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { fetchNotes } from "@/lib/api"
import NoteFormWagmi from "../components/NoteFormWagmi"
import NoteCardEthers from "../components/NoteCardEthers" // gunakan versi wagmi/ethers hybrid

export default function NoteList() {
  const { address, isConnected } = useAccount()
  const [notes, setNotes] = useState<any[]>([])

  async function loadNotes() {
    if (!address) return
    const data = await fetchNotes(address)
    setNotes(data.notes)
  }

  useEffect(() => {
    if (address) loadNotes()
  }, [address])

  if (!isConnected) return <p>🔐 Silakan login dengan wallet Anda</p>

  return (
    <div className="space-y-4">
      <NoteFormWagmi onNoteAdded={loadNotes} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCardEthers key={note.id} note={note} onAction={loadNotes} userAddress={address} />
        ))}
      </div>
    </div>
  )
}
