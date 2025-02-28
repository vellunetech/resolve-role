from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from chat import LangGraphChatbot

# Inicialize o FastAPI
app = FastAPI()


chatbot = LangGraphChatbot()

lista = {"conversations": [1,2,3]}
# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8001", "http://127.0.0.1:8001"],  # Permite a origem do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Função para carregar as conversas do arquivo JSON
def load_conversations():
    try:
        with open("json.json", "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []

# Função para salvar as conversas no arquivo JSON
def save_conversations(conversations):
    with open("conversations.json", "w") as file:
        json.dump(conversations, file, indent=4)

# Carregar as conversas no início
conversations_db = load_conversations()

# Modelo de entrada para a API
class ChatInput(BaseModel):
    message: str

# Rota para buscar conversas disponíveis
@app.get("/conversations/")
async def get_conversations():
    return lista

# Rota para criar uma nova conversa
@app.post("/conversation/")
async def create_conversation():
    lista["conversations"].append(lista["conversations"][-1]+1)
    return lista

# Rota para buscar mensagens de uma conversa específica
@app.get("/messages/")
async def get_messages(conversation_id: int = Query(..., description="ID da conversa")):
    conversation = next((conv for conv in conversations_db if conv["id"] == conversation_id), None)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")
    return {"messages": conversation["messages"]}

# Rota para enviar uma mensagem ao bot
@app.post("/message/")
async def send_message(input: ChatInput):
    try:
        # Processe a mensagem com o chatbot (simulação)
        response =  chatbot.interagir_com_bot(input.message)  # Simulação de resposta do chatbot
        return {"message": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Rota de saúde para verificar se a API está funcionando
@app.get("/health")
async def health():
    return {"status": "ok"}
