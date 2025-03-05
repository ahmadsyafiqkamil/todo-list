import os
from fastapi import FastAPI, HTTPException
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

class NoteRequest(BaseModel):
    title: str
    note: str

class AuthWithMetamask(BaseModel):
    address: str
    signature: str
    message: str

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
def add_note(request: NoteRequest):
    try:
        account = Account.from_key(PRIVATE_KEY)
        sender_address = account.address

        tx = contract.functions.addTask(request.note, request.title).build_transaction({
            "from": sender_address,
            "nonce": w3.eth.get_transaction_count(sender_address),
            "gas": 2000000,
            "gasPrice": w3.to_wei("5","gwei")
        })

        signed_tx = Account.sign_transaction(tx, PRIVATE_KEY)

        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {"message": "Transaction successful", "tx_hash": tx_hash.hex()}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/get-notes")
def get_notes():
    try:
        account = Account.from_key(PRIVATE_KEY)
        sender_address = account.address
        # Panggil fungsi smart contract `getTasks()`
        tasks = contract.functions.getTasks().call({"from":sender_address})

        if not tasks:
            return {"notes":[]}

        # Konversi hasil ke format JSON-friendly
        notes = [{"id": task[0], "title": task[1], "content": task[2], "completed": task[3]} for task in tasks]

        return {"notes": notes}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.delete("/delete-note/{task_id}")
def delete_note(task_id: int):
    try:
        account = Account.from_key(PRIVATE_KEY)
        sender_address = account.address

        tx = contract.functions.deleteTask(task_id).build_transaction({
            "from": sender_address,
            "nonce": w3.eth.get_transaction_count(sender_address),
            "gas": 2000000,
            "gasPrice": w3.to_wei("5","gwei")
        })

        signed_tx = Account.sign_transaction(tx, PRIVATE_KEY)

        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "message": f"task {task_id} deleted successfully",
            "tx_hash": tx_hash.hex()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/mark-completed/{task_id}")
def mark_completed(task_id: int):
    try:
        account = Account.from_key(PRIVATE_KEY)
        sender_address = account.address

        tx = contract.functions.completeTask(task_id).build_transaction({
            "from": sender_address,
            "nonce": w3.eth.get_transaction_count(sender_address),
            "gas": 2000000,
            "gasPrice": w3.to_wei("5","gwei")
        })

        signed_tx = Account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "message": f"task {task_id} completed",
            "tx_hash": tx_hash.hex()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
