from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from chat import LangGraphChatbot
from fastapi.middleware.cors import CORSMiddleware

# Inicialize o FastAPI
app = FastAPI()

# Inicialize o seu chatbot
chatbot = LangGraphChatbot()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8001", "http://localhost:8001"],  # Permite a origem do frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)


# Modelo de entrada para a API
class ChatInput(BaseModel):
    message: list[str]


# Rota para enviar mensagens ao chatbot
@app.post("/chat/")
async def chat(input: ChatInput):
    try:
        # Processe a mensagem com o chatbot
        response = chatbot.start_bot(input)
        return {"response": response}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))


# Rota de saúde para verificar se a API está funcionando
@app.get("/health")
async def health():
    return {"status": "ok"}