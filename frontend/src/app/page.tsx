"use client";

import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { ethers } from "ethers";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fungsi untuk menghubungkan MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  // Fungsi untuk login dengan MetaMask
  const loginWithMetamask = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Pesan yang akan ditandatangani oleh pengguna
      const message = "Sign in to Web3 Notes App";
      const signature = await signer.signMessage(message);

      // Kirim ke backend untuk verifikasi
      const response = await api.post("/login", { address, signature, message });

      if (response.data.message === "Login successful") {
        setAccount(address);
        alert("Login successful");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  // Fungsi untuk mengambil data notes dari API
  const fetchNotes = async () => {
    try {
      const response = await api.get("/get-notes");
      setNotes(response.data.notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Fungsi untuk menambahkan note
  const addNote = async () => {
    if (!title || !content) {
      alert("Title dan Content harus diisi!");
      return;
    }
    try {
      await api.post("/add-note", { title, note: content });
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Fungsi untuk menandai note sebagai selesai
  const markCompleted = async (taskId) => {
    try {
      await api.post(`/mark-completed/${taskId}`);
      fetchNotes();
    } catch (error) {
      console.error("Error marking note as completed:", error);
    }
  };

  // Fungsi untuk menghapus note
  const deleteNote = async (taskId) => {
    try {
      await api.delete(`/delete-note/${taskId}`);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Web3 Notes App</h1>

      {/* Tombol Login MetaMask */}
      <div className="flex justify-center mb-4">
        {account ? (
          <p className="text-green-600">Connected: {account}</p>
        ) : (
          <button
            onClick={loginWithMetamask}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login with MetaMask
          </button>
        )}
      </div>

      {/* Form Tambah Note */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 mr-2 w-1/3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Content"
          className="border p-2 mr-2 w-1/3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={addNote}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Note
        </button>
      </div>

      {/* Daftar Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-bold">{note.title}</h2>
              <p>{note.content}</p>
              <p>Status: {note.completed ? "Completed ✅" : "Pending ⏳"}</p>
              <div className="mt-2">
                {!note.completed && (
                  <button
                    onClick={() => markCompleted(note.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => deleteNote(note.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No notes available.</p>
        )}
      </div>
    </div>
  );
}
