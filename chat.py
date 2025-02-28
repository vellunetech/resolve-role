import os
from langchain_openai import ChatOpenAI
from langgraph.graph import Graph, END
from dotenv import load_dotenv, find_dotenv
import json

class LangGraphChatbot:
    def __init__(self):
        # Carregar variáveis de ambiente
        _ = load_dotenv(find_dotenv())

        # Configurar o modelo de linguagem (ChatGPT)
        self.chat_model = ChatOpenAI(model="gpt-4", temperature=0.7)

        # Criar o grafo
        self.graph = self._create_workflow()

    def _create_workflow(self):
        # Criando o grafo
        workflow = Graph()

        # Adicionando nós
        workflow.add_node("saudacao", self.saudacao)
        workflow.add_node("responder", self.responder_pergunta)
        workflow.add_node("despedida", self.despedida)

        # Definindo o nó inicial
        workflow.set_entry_point("saudacao")

        # Definindo o fluxo linear
        workflow.add_edge("saudacao", "responder")
        workflow.add_edge("responder", "despedida")
        workflow.add_edge("despedida", END)

        # Compilar o grafo
        return workflow.compile()

    # Funções dos nós
    def saudacao(self, estado):
        estado["mensagens"] = []  # Inicializa a lista de mensagens
        mensagem = "Olá! Tudo bem?"
        # estado["mensagens"].append(mensagem)  # Adiciona a mensagem à lista
        # print("Bot:", mensagem)
        return estado

    def responder_pergunta(self, estado):
        # Usar o ChatGPT para gerar uma resposta
        resposta = self.chat_model.invoke(estado["input"])
        mensagem = resposta.content  # Acessar o conteúdo da resposta
        estado["mensagens"].append(mensagem)  # Adiciona a mensagem à lista
        print("Bot:", mensagem)
        return estado

    def despedida(self, estado):
        mensagem = "Espero ter ajudado"
        # estado["mensagens"].append(mensagem)  # Adiciona a mensagem à lista
        # print("Bot:", mensagem)
        return estado

    def interagir_com_bot(self, user_input):
        estado = {"input": user_input}
        resultado = self.graph.invoke(estado)
        return resultado.get("mensagens", ["Desculpe, algo deu errado."])



    def get_conversation_ids(file_path):
        try:
            file_path = 'json.json'
            # Abre o arquivo JSON e carrega os dados
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            # Extrai os IDs das conversas
            conversation_ids = [conversation['id'] for conversation in data]
            
            # Retorna o resultado no formato desejado
            return {"conversations": conversation_ids}
        
        except FileNotFoundError:
            print(f"Erro: O arquivo '{file_path}' não foi encontrado.")
            return {"conversations": []}
        except json.JSONDecodeError:
            print(f"Erro: O arquivo '{file_path}' não é um JSON válido.")
            return {"conversations": []}
        except KeyError:
            print(f"Erro: O arquivo '{file_path}' não contém a estrutura esperada.")
            return {"conversations": []}

def main():
    # Inicializar o chatbot
    chatbot = LangGraphChatbot()

    # Iniciar a interação com o bot
    chatbot.interagir_com_bot()


if __name__ == "__main__":
    main()
