"use client"

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { api } from "../utils/api";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // State untuk memastikan komponen dirender di client-side

  // Pastikan komponen sudah dimount sebelum menggunakan Modal.setAppElement
  useEffect(() => {
    setIsClient(true);
    Modal.setAppElement(document.body); // Gunakan document.body daripada "#__next"
  }, []);

  // Fetch Notes dari API
  const fetchNotes = async () => {
    try {
      const response = await api.get("/get-notes");
      console.log("API Response:", response);  // ✅ Tambahkan log untuk debugging
      setNotes(response.data.notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      console.log(error.response?.data); // ✅ Debug respons error dari server
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
      setModalIsOpen(false); // Tutup modal setelah submit
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Fungsi untuk menandai sebagai selesai
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

      {/* Tombol untuk membuka modal */}
      <button
        onClick={() => setModalIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        + Add Note
      </button>

      {/* Modal Form (hanya dirender jika isClient true) */}
      {isClient && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20"
          overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-2xl font-bold mb-4">Add New Note</h2>
          <input
            type="text"
            placeholder="Title"
            className="border p-2 mb-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Content"
            className="border p-2 mb-4 w-full"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              onClick={addNote}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Note
            </button>
          </div>
        </Modal>
      )}

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
