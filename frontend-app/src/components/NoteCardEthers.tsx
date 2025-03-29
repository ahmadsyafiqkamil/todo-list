'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useWalletClient } from "wagmi"

type NoteCardProps = {
  note: {
    id: number
    title: string
    content: string
    completed: boolean
  }
  onAction: () => void
  userAddress: string
}

export default function NoteCardEthers({ note, onAction, userAddress }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(note.title)
  const [editedContent, setEditedContent] = useState(note.content)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { data: walletClient } = useWalletClient()

  const sendTx = async (txData: any) => {
    if (!walletClient) throw new Error("Wallet not connected")
    return await walletClient.sendTransaction({
      account: walletClient.account || userAddress,
      to: txData.to,
      data: txData.data,
      gas: BigInt(txData.gas),
      gasPrice: BigInt(txData.gasPrice),
      nonce: BigInt(txData.nonce),
    })
  }

  async function handleUpdate() {
    if (!walletClient) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("http://localhost:8000/update-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: note.id,
          new_title: editedTitle,
          new_content: editedContent,
          sender: userAddress,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.detail || "Gagal membangun transaksi")

      const txHash = await sendTx(result.tx)
      console.log("Update Tx Hash:", txHash)

      setIsEditing(false)
      onAction()
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat update")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!walletClient) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:8000/delete-note/${note.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.detail || "Gagal membangun transaksi")

      const txHash = await sendTx(result.tx)
      console.log("Delete Tx Hash:", txHash)

      onAction()
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat hapus")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-4 rounded-xl shadow space-y-2">
      {error && <p className="text-red-600">{error}</p>}

      {isEditing ? (
        <>
          <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
          <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={loading}>Simpan</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>Batal</Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold">{note.title}</h3>
          <p>{note.content}</p>
          <div className="flex gap-2">
            {!note.completed && (
              <Button onClick={() => setIsEditing(true)} disabled={loading}>Edit</Button>
            )}
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>Hapus</Button>
          </div>
        </>
      )}
      {note.completed && <span className="text-green-600 font-medium">✅ Selesai</span>}
    </div>
  )
}
