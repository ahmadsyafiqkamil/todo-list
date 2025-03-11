"use client";

import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { ethers } from "ethers";
import { Dialog, DialogActions, DialogContent, DialogTitle, Container, Box, Typography, Button, TextField, Card, CardContent, CardActions, Grid } from "@mui/material";


export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");  
  const [editingNote, setEditingNote] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setAccount(localStorage.getItem("account"));
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() =>{
    const savedAccount = localStorage.getItem("account")
    if (savedAccount){
      setAccount(savedAccount);
    }
  },[])


  // Fungsi untuk menghubungkan MetaMask
  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Periksa apakah MetaMask terhubung ke Sepolia
    // const network = await provider.getNetwork();
    // if (network.chainId !== 11155111) {
    //   // await switchToSepolia();
    //   alert("Please switch to Sepolia network in MetaMask.");
    //   return;
    // }


      setAccount(address);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const switchToSepolia = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xAA36A7" }], // 11155111 dalam hex
        });
        alert("Switched to Sepolia successfully!");
      } catch (switchError) {
        console.error("Error switching to Sepolia:", switchError);
      }
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
        localStorage.setItem("account", address);
        alert("Login successful");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  const logout = () =>{
    localStorage.removeItem("account");
    setAccount(null)
  }

  // Fungsi untuk mengambil data notes dari API
  const fetchNotes = async () => {
    try {
      const response = await api.get("/get-notes");
      console.log(response)
      setNotes(response.data.notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

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

  const updateNote = async(taskId) => {
    if(!editingTitle || !editingContent){
      alert("Title dan Content harus diisi");
      return;
    }
    try{
      await api.post("/update-note",{task_id: taskId, new_title: editingTitle, new_content: editingContent});
      setEditingNote(null);
      setEditingTitle("");
      setEditingContent("");
      fetchNotes();
      handleCloseModal();
    }catch (error){
      console.error("Error updating note:", error);
    }
  }

  // Fungsi untuk menandai note sebagai selesai
  const markCompleted = async (taskId) => {
    const confirmMark = window.confirm("Are you sure you want to mark complete this note?");
    if (!confirmMark) return;

    try {
      await api.post(`/mark-completed/${taskId}`);
      fetchNotes();
    } catch (error) {
      console.error("Error marking note as completed:", error);
    }
  };

  // Fungsi untuk menghapus note
  const deleteNote = async (taskId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;
  
    try {
      await api.delete(`/delete-note/${taskId}`);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleOpenModal = (note) => {
    setEditingNote(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  

  return (
    <Container maxWidth="md">
      <Box textAlign="center" my={4}>
        <Typography variant="h4" fontWeight="bold">
          Web3 Notes App
        </Typography>
      </Box>

      {/* Tombol Login MetaMask */}
      <Box textAlign="center" mb={4}>
        {account ? (
          <Typography variant="h6" color="primary">
            Connected: {account}{" "}
            <Button variant="contained" color="error" onClick={logout} sx={{ ml: 2 }}>
              Logout
            </Button>
          </Typography>
        ) : (
          <Button variant="contained" color="primary" onClick={connectWallet}>
            Login with MetaMask
          </Button>
        )}
      </Box>

      {/* Form Tambah Note */}
      <Box display="flex" flexDirection="column" gap={2} mb={4}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Content"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={addNote}>
          Add Note
        </Button>
      </Box>

      {/* Daftar Notes */}
      <Grid container spacing={2}>
        {notes.length > 0 ? (
          notes.map((note) => (
            <Grid item xs={12} sm={6} key={note.id}>
              <Card>
                <CardContent>
                  
                    <>
                      <Typography variant="h6">{note.title}</Typography>
                      <Typography>{note.content}</Typography>
                      <Typography color={note.completed ? "green" : "orange"}>
                        Status: {note.completed ? "Completed ✅" : "Pending ⏳"}
                      </Typography>
                    </>
                  
                </CardContent>
                <CardActions>
                  {!note.completed && (
                    <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={() => markCompleted(note.id)} >
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleOpenModal(note)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button variant="contained" color="error" onClick={() => deleteNote(note.id)}> Delete </Button>

                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No notes available.</Typography>
        )}
      </Grid>

      {/* MODAL EDIT NOTE */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="warning">
            Cancel
          </Button>
          <Button
            onClick={() => updateNote(editingNote)}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}