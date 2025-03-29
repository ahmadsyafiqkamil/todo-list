'use client'

import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NoteFormWagmi({ onNoteAdded }: { onNoteAdded: () => void }) {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [txHash, setTxHash] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address || !walletClient) {
      setError("Wallet belum terhubung")
      return
    }

    try {
      setLoading(true)
      setError("")
      setTxHash("")

      // 1. Request tx dari backend
      const res = await fetch("http://localhost:8000/add-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, note, sender: address }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.detail || "Gagal membangun transaksi")

      // 2. Sign + Send tx via wagmi
      const hash = await walletClient.sendTransaction({
        account: address,
        to: result.tx.to,
        data: result.tx.data,
        gas: BigInt(result.tx.gas),
        gasPrice: BigInt(result.tx.gasPrice),
        nonce: BigInt(result.tx.nonce),
      })

      setTxHash(hash)
      setTitle("")
      setNote("")
      onNoteAdded()
    } catch (err: any) {
      setError(err.message || "Gagal mengirim transaksi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600">{error}</p>}
      <Input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Isi" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Mengirim..." : "Tambah Catatan"}
      </Button>
      {txHash && (
        <p className="text-green-600 text-sm">
          ✅ Berhasil! Hash:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}
    </form>
  )
}
