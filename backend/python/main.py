# https://chatgpt.com/c/67d737f6-ae58-8012-b614-17f94eaf255f

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
from pydantic import BaseModel
from dotenv import load_dotenv
from eth_account.messages import encode_defunct
from eth_account import Account


load_dotenv()

RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# RPC_URL = os.getenv("RPC_URL_SEPOLIA")
# PRIVATE_KEY = os.getenv("PRIVATE_KEY_METAMASK")
# CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS_SEPOLIA")

w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    raise Exception("Failed to connect to Ethereum node")

CONTRACT_ABI = [
      {
         "type":"function",
         "name":"addTask",
         "inputs":[
            {
               "name":"_content",
               "type":"string",
               "internalType":"string"
            },
            {
               "name":"_title",
               "type":"string",
               "internalType":"string"
            }
         ],
         "outputs":[
            
         ],
         "stateMutability":"nonpayable"
      },
      {
         "type":"function",
         "name":"completeTask",
         "inputs":[
            {
               "name":"_taskId",
               "type":"uint256",
               "internalType":"uint256"
            }
         ],
         "outputs":[
            
         ],
         "stateMutability":"nonpayable"
      },
      {
         "type":"function",
         "name":"deleteTask",
         "inputs":[
            {
               "name":"_taskId",
               "type":"uint256",
               "internalType":"uint256"
            }
         ],
         "outputs":[
            
         ],
         "stateMutability":"nonpayable"
      },
      {
         "type":"function",
         "name":"getTasks",
         "inputs":[
            
         ],
         "outputs":[
            {
               "name":"",
               "type":"tuple[]",
               "internalType":"struct Note.Task[]",
               "components":[
                  {
                     "name":"id",
                     "type":"uint256",
                     "internalType":"uint256"
                  },
                  {
                     "name":"title",
                     "type":"string",
                     "internalType":"string"
                  },
                  {
                     "name":"content",
                     "type":"string",
                     "internalType":"string"
                  },
                  {
                     "name":"completed",
                     "type":"bool",
                     "internalType":"bool"
                  }
               ]
            }
         ],
         "stateMutability":"view"
      },
      {
         "type":"function",
         "name":"updateTask",
         "inputs":[
            {
               "name":"_taskId",
               "type":"uint256",
               "internalType":"uint256"
            },
            {
               "name":"_newTitle",
               "type":"string",
               "internalType":"string"
            },
            {
               "name":"_newContent",
               "type":"string",
               "internalType":"string"
            }
         ],
         "outputs":[
            
         ],
         "stateMutability":"nonpayable"
      },
      {
         "type":"event",
         "name":"TaskAdded",
         "inputs":[
            {
               "name":"user",
               "type":"address",
               "indexed":"true",
               "internalType":"address"
            },
            {
               "name":"taskId",
               "type":"uint256",
               "indexed":"false",
               "internalType":"uint256"
            },
            {
               "name":"title",
               "type":"string",
               "indexed":"false",
               "internalType":"string"
            },
            {
               "name":"content",
               "type":"string",
               "indexed":"false",
               "internalType":"string"
            }
         ],
         "anonymous":"false"
      },
      {
         "type":"event",
         "name":"TaskCompleted",
         "inputs":[
            {
               "name":"user",
               "type":"address",
               "indexed":"true",
               "internalType":"address"
            },
            {
               "name":"taskId",
               "type":"uint256",
               "indexed":"false",
               "internalType":"uint256"
            }
         ],
         "anonymous":"false"
      },
      {
         "type":"event",
         "name":"TaskDeleted",
         "inputs":[
            {
               "name":"user",
               "type":"address",
               "indexed":"true",
               "internalType":"address"
            },
            {
               "name":"taskId",
               "type":"uint256",
               "indexed":"false",
               "internalType":"uint256"
            }
         ],
         "anonymous":"false"
      },
      {
         "type":"event",
         "name":"TaskUpdated",
         "inputs":[
            {
               "name":"user",
               "type":"address",
               "indexed":"true",
               "internalType":"address"
            },
            {
               "name":"taskId",
               "type":"uint256",
               "indexed":"false",
               "internalType":"uint256"
            },
            {
               "name":"newTitle",
               "type":"string",
               "indexed":"false",
               "internalType":"string"
            },
            {
               "name":"newContent",
               "type":"string",
               "indexed":"false",
               "internalType":"string"
            }
         ],
         "anonymous":"false"
      }
   ]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi= CONTRACT_ABI)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
allow_origins=["http://localhost:3000"],  # URL Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AddNoteRequest(BaseModel):
    title: str
    note: str
    sender: str  # address user


class AuthWithMetamask(BaseModel):
    address: str
    signature: str
    message: str

class UpdateNoteRequest(BaseModel):
    task_id: int
    new_title: str
    new_content: str
    sender: str

class DeleteNoteRequest(BaseModel):
    task_id: int
    sender: str


   
@app.get("/")
def home():
    return {"message":"Web3 + FastAPI is running"}

@app.post("/login")
def login_with_metamask(data: AuthWithMetamask):
    try:
        # Pastikan pesan yang ditandatangani di frontend sama di backend
        expected_message = "Sign in to Web3 Notes App"

        if data.message != expected_message:
            raise HTTPException(status_code=400, detail="Invalid message")

        message = encode_defunct(text=data.message)
        recovered_address = Account.recover_message(message, signature=data.signature)

        if recovered_address.lower() != data.address.lower():
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        return {"message": "Login successful", "address": recovered_address}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))  # Pastikan error bisa terbaca


@app.post("/add-note")
def add_note(request: AddNoteRequest):
    try:
        sender = request.sender

        balance = check_balance(sender)
        if balance < 0.01:
            raise HTTPException(status_code=400, detail="Saldo tidak cukup untuk gas")

        gas_limit, gas_price = get_gas_parameters(
            contract.functions.addTask(request.note, request.title),
            sender
        )

        nonce = w3.eth.get_transaction_count(sender)

        tx = contract.functions.addTask(request.note, request.title).build_transaction({
            "from": sender,
            "to": CONTRACT_ADDRESS,
            "nonce": nonce,
            "gas": gas_limit,
            "gasPrice": gas_price
        })

        return {"tx": tx}  # Raw tx akan dikirim ke frontend
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@app.post("/update-note")
def update_note(request: UpdateNoteRequest):
    try:
        sender_address = request.sender

        balance = check_balance(sender_address)
        if balance < 0.01:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        gas_limit, gas_price = get_gas_parameters(
            contract.functions.updateTask(request.task_id, request.new_title, request.new_content),
            sender_address
        )

        nonce = w3.eth.get_transaction_count(sender_address, "latest")

        tx = contract.functions.updateTask(
            request.task_id, request.new_title, request.new_content
        ).build_transaction({
            "from": sender_address,
            "nonce": nonce,
            "gas": gas_limit,
            "gasPrice": gas_price
        })

        return {"tx": tx}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@app.get("/get-notes/{user_address}")
def get_notes(user_address: str):
    try:
        # gunakan address dari path, bukan PRIVATE_KEY
        tasks = contract.functions.getTasks().call({"from": user_address})

        notes = [{"id": t[0], "title": t[1], "content": t[2], "completed": t[3]} for t in tasks]
        return {"notes": notes}

    except Exception as e:
        error_message = str(e)
        if "revert" in error_message:
            error_message = error_message.split("revert")[-1].strip
        raise HTTPException(status_code=400, detail=f"Transaction error: {error_message}")


@app.post("/delete-note")
def delete_note(task_id: int, sender: str):
    try:
        balance = check_balance(sender)
        if balance < 0.01:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        gas_limit, gas_price = get_gas_parameters(
            contract.functions.deleteTask(task_id), sender
        )
        nonce = w3.eth.get_transaction_count(sender, "latest")

        tx = contract.functions.deleteTask(task_id).build_transaction({
            "from": sender,
            "nonce": nonce,
            "gas": gas_limit,
            "gasPrice": gas_price
        })

        return {"tx": tx}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/mark-completed/{task_id}")
def mark_completed(task_id: int):
    try:
        account = Account.from_key(PRIVATE_KEY)
        sender_address = account.address

        balance = check_balance(sender_address)
        if balance < 0.01:
            raise HTTPException(status_code=400, detail="Insufficient balance to pay gas fee")

        gas_limit, gas_price = get_gas_parameters(contract.functions.completeTask(task_id), sender_address)
        nonce = w3.eth.get_transaction_count(sender_address, "latest")

        tx = contract.functions.completeTask(task_id).build_transaction({
            "from": sender_address,
            "nonce": nonce,
            "gas": gas_limit,
            "gasPrice": gas_price
        })

        signed_tx = Account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if tx_receipt["status"] == 0:
            raise HTTPException(status_code=400, detail="Transaction failed: Smart contract reverted")

        return {"message": "Transaction successful", "tx_hash": tx_hash.hex()}
    
    except Exception as e:
        error_message = str(e)
        if "revert" in error_message:
            error_message = error_message.split("revert")[-1].strip
        raise HTTPException(status_code=400, detail=f"Transaction error: {error_message}")

def get_gas_parameters(tx_function, sender_address, extra_gas=50000, extra_gwei=5):
    """
    Menghitung gas limit dan gas price secara otomatis.

    Parameters:
    - tx_function: Fungsi transaksi dari smart contract (contoh: contract.functions.addTask()).
    - sender_address: Alamat pengirim transaksi.
    - extra_gas: Tambahan gas untuk keamanan (default: 50.000 gas).
    - extra_gwei: Tambahan gas price agar transaksi lebih cepat diproses (default: 5 Gwei).

    Returns:
    - gas_limit: Estimasi gas limit yang sudah ditambahkan buffer.
    - gas_price: Gas price dalam wei yang sudah disesuaikan.
    """

    try:
        # Estimasi gas yang dibutuhkan untuk transaksi
        estimated_gas = tx_function.estimate_gas({"from": sender_address})

        # Ambil gas price saat ini dari jaringan
        current_gas_price = w3.eth.gas_price

        # Tambahkan buffer untuk gas limit agar transaksi tidak gagal
        gas_limit = estimated_gas + extra_gas

        # Tambahkan buffer untuk gas price agar transaksi lebih cepat dikonfirmasi
        gas_price = current_gas_price + w3.to_wei(extra_gwei, "gwei")

        print(f"Estimasi Gas: {estimated_gas}, Gas Limit: {gas_limit}, Gas Price: {w3.from_wei(gas_price, 'gwei')} Gwei")

        return gas_limit, gas_price

    except Exception as e:
        raise Exception(f"Error mendapatkan parameter gas: {str(e)}")


def check_balance(address):
    """
    Mengecek saldo ETH dari alamat yang diberikan.

    Parameters:
    - address: Alamat Ethereum yang akan diperiksa saldonya.

    Returns:
    - balance_eth: Saldo ETH dalam satuan Ether.
    """

    try:
        balance_wei = w3.eth.get_balance(address)  # Dapatkan saldo dalam Wei
        balance_eth = w3.from_wei(balance_wei, "ether")  # Konversi ke ETH

        print(f"Saldo {address}: {balance_eth} ETH")

        return balance_eth

    except Exception as e:
        raise Exception(f"Error mendapatkan saldo: {str(e)}")

    