'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function WalletLogin({ onLogin }: { onLogin: (address: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin() {
    setError("")
    setLoading(true)

    try {
      if (!window.ethereum) throw new Error("Metamask belum terpasang")

      // 1. Minta akses ke akun
      const [address] = await window.ethereum.request({ method: "eth_requestAccounts" })

      // 2. Tulis pesan untuk ditandatangani
      const message = "Sign in to Web3 Notes App"

      // 3. Tanda tangani pesan
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      })

      // 4. Kirim ke backend untuk verifikasi
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.detail || "Login gagal")

      onLogin(result.address)
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? "Masuk..." : "Login dengan Metamask"}
      </Button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
