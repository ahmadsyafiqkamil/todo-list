'use client'

import { useEffect, useState } from "react"
import WalletLogin from "../components/WalletLogin"
import NoteList from "../components/NoteList"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [userAddress, setUserAddress] = useState("")

  // Cek localStorage saat pertama kali halaman dibuka
  useEffect(() => {
    const savedAddress = localStorage.getItem("userAddress")
    if (savedAddress) setUserAddress(savedAddress)
  }, [])

  // Simpan address ke localStorage setelah login
  function handleLogin(addr: string) {
    setUserAddress(addr)
    localStorage.setItem("userAddress", addr)
  }

  // Logout: hapus address dari state & localStorage
  function handleLogout() {
    setUserAddress("")
    localStorage.removeItem("userAddress")
  }

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">📒 Web3 Note App</h1>

      {!userAddress ? (
        <WalletLogin onLogin={handleLogin} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Terhubung sebagai: {userAddress}</p>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
          <NoteList />
        </>
      )}
    </main>
  )
}
