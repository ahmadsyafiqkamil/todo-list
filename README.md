# Web3 Notes App

## Introduction
Web3 Notes App is a decentralized note-taking application built with **Next.js** for the frontend, **FastAPI with web3.py** for the backend, and **Solidity (Foundry framework)** for the smart contract. This application allows users to create, update, mark as completed, and delete notes on the Ethereum blockchain.

## Features
- **Web3 Authentication:** Users can log in using MetaMask.
- **Decentralized Storage:** Notes are stored on the Ethereum blockchain.
- **CRUD Operations:** Users can create, update, mark as completed, and delete notes.
- **MetaMask Integration:** Supports connection to the Sepolia testnet.
- **Smart Contract Security:** Uses event logging for all task-related actions.

## Tech Stack
- **Frontend:** Next.js, Material-UI, Ethers.js
- **Backend:** FastAPI, Web3.py, Python
- **Blockchain:** Solidity, Foundry framework

## Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- Foundry for Solidity development
- MetaMask extension installed in your browser
- Ethereum Sepolia testnet faucet for testing

### 1. Clone the Repository
```bash
[git clone https://github.com/your-username/web3-notes-app.git](https://github.com/ahmadsyafiqkamil/todo-list.git)
cd web3-notes-app
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Deploy Smart Contract
```bash
cd smart-contracts
forge build
forge test
forge create --rpc-url YOUR_RPC_URL --private-key YOUR_PRIVATE_KEY src/Note.sol:Note
```

## Usage
### Connecting to MetaMask
- Click **"Login with MetaMask"** button.
- Approve the connection request.
- Ensure you are on the Sepolia network.

### Adding a Note
- Enter the **Title** and **Content**.
- Click **"Add Note"**.
- Transaction is sent to the blockchain.

### Editing a Note
- Click the **Edit** button on a note.
- Modify the Title and Content.
- Click **"Save"** to update the note on the blockchain.

### Marking as Completed
- Click **"Complete"** to mark a note as done.

### Deleting a Note
- Click **"Delete"** to remove the note from the blockchain.

## Environment Variables
Create a `.env` file inside the `backend` directory:
```
RPC_URL=<Your Ethereum Node RPC URL>
PRIVATE_KEY=<Your Wallet Private Key>
CONTRACT_ADDRESS=<Deployed Smart Contract Address>
```

## Smart Contract Functions
### `addTask(string _content, string _title)`
Creates a new task stored on the blockchain.

### `updateTask(uint _taskId, string _newTitle, string _newContent)`
Updates an existing task.

### `completeTask(uint _taskId)`
Marks a task as completed.

### `deleteTask(uint _taskId)`
Deletes a task from the blockchain.

### `getTasks()`
Returns all tasks belonging to the connected user.

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit changes (`git commit -m 'Add new feature'`).
4. Push to GitHub (`git push origin feature-branch`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License.

## Contact
For any issues or contributions, feel free to open an issue or reach out via email at **ahmadsyafiqkamil@gmail.com**.
