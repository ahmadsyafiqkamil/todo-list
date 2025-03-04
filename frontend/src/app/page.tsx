'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/get-notes');
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!title || !content) return;
    try {
      await axios.post('http://localhost:8000/add-note', { title, note: content });
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const markCompleted = async (taskId) => {
    try {
      await axios.post(`http://localhost:8000/mark-completed/${taskId}`);
      fetchNotes();
    } catch (error) {
      console.error('Error marking task completed:', error);
    }
  };

  const deleteNote = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8000/delete-note/${taskId}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full mb-2"
        ></textarea>
        <button
          onClick={addNote}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Note
        </button>
      </div>
      <ul>
        {notes.map((note) => (
          <li key={note.id} className="border p-4 mb-2 rounded">
            <h2 className="font-bold">{note.title}</h2>
            <p>{note.content}</p>
            <div className="mt-2">
              {!note.completed && (
                <button
                  onClick={() => markCompleted(note.id)}
                  className="bg-green-500 text-white px-4 py-1 rounded mr-2"
                >
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => deleteNote(note.id)}
                className="bg-red-500 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
