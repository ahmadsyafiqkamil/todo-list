"use client"

import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Ambil data note dari API
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
      fetchNotes(); // Refresh daftar note
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Fungsi untuk menandai note sebagai selesai
  const markCompleted = async (taskId) => {
    try {
      await api.post(`/mark-completed/${taskId}`);
      fetchNotes(); // Refresh daftar note
    } catch (error) {
      console.error("Error marking note as completed:", error);
    }
  };

  // Fungsi untuk menghapus note
  const deleteNote = async (taskId) => {
    try {
      await api.delete(`/delete-note/${taskId}`);
      fetchNotes(); // Refresh daftar note
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Web3 Notes App</h1>

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