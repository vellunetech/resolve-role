from langchain_openai import ChatOpenAI
from langgraph.graph import Graph, START, END
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv, find_dotenv
from pydantic import BaseModel


class StaySilent(BaseModel):
    """If you think it's wise to stay silent."""
    pass

class Choose(BaseModel):
    """If you need to choose between few conflicting suggestions."""
    pass

class Harmonize(BaseModel):
    """If you need to merge few not mutually-exclusive suggestions into one."""
    pass

class Ask(BaseModel):
    """If you don't have enough information about what the users want to do."""
    pass

OPTIONS = [StaySilent, Choose, Harmonize, Ask]

class LangGraphChatbot:
    def __init__(self):
        # Loading environment variables
        _ = load_dotenv(find_dotenv())

        # Configuring LLM (ChatGPT)
        self.chat_model = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

        # Create graph
        self.graph = self._create_workflow()
    
    # Defining start conditional edge
    def simple_redirect(self, state):
        prompt = ChatPromptTemplate.from_template(
            "You are in a group chat, and people are trying to decide what they should do together."
            "Your task is to propose a solution that makes the most ammount of people happy, and if possible, you should seek consensus."
            "Evaluate the following message, and choose if you are going to remain silent, answer them,"
            "or ask question about what are their preferences."
            "The group chat is as follows, in between triple backticks:"
            "```{message}```"
        )
        chain = prompt | self.chat_model.bind_tools(OPTIONS, tool_choice="any")
        answer = chain.invoke({"message": "\n\n".join(state["input"].message)}).additional_kwargs["tool_calls"][0]
        tool_name = answer["function"]["name"].upper()

        eval_possible = ["STAYSILENT", "CHOOSE", "HARMONIZE", "ASK"]

        print(tool_name)

        if tool_name in eval_possible:
            return tool_name
        
        print("Bot didn't return a valid option for continuing. Instead, it will remain silent.")
        return "STAYSILENT"

    def _create_workflow(self):
        # Creating graph
        workflow = Graph()

        # Adding nodes
        workflow.add_node("ask_questions", self.ask_questions)
        workflow.add_node("choose", self.choose)
        workflow.add_node("harmonize", self.harmonize)
        workflow.add_node("send_message_or_quit", self.send_message_or_quit)

        # Conditional Edges
        workflow.add_conditional_edges(
            START,
            self.simple_redirect,
            {"CHOOSE": "choose", "HARMONIZE": "harmonize", "ASK": "ask_questions", "STAYSILENT": "send_message_or_quit"}
        )

        # Simple edges
        workflow.add_edge("ask_questions", "send_message_or_quit")
        workflow.add_edge("harmonize", "send_message_or_quit")
        workflow.add_edge("choose", "send_message_or_quit")

        # Compiling graph

        return workflow.compile()

    # All nodes
    def ask_questions(self, state):
        prompt = ChatPromptTemplate.from_template(
            "You are in a group chat, and people are trying to decide what they should do together. " 
            "Your task is to ask questions to facilitate your job. Based on the information of the previous messages, " 
            "and taking into consideration the amount of people who answered, make atmost two questions to further your " 
            "understading of people's preferences. " 
            "The message history is as follows, in between triple backticks: \n" 
            "```{message}```"
        )
        chain = prompt | self.chat_model
        answer = chain.invoke({"message": "\n\n".join(state["input"].message)}).content

        print(f"Bot is thinking the following: {answer}")
        return answer

    def choose(self, state):
        prompt = ChatPromptTemplate.from_template(
            "You are in a group chat, and people are trying to decide what they should do together."
            "Choose the most popular/recurring themes for activities, and make a suggestion for the group"
            "asking if it would be a good idea for them to do it."
            "For this, take into consideration the message history below, which is between triple backticks:"
            "```{message}```"
        )
        chain = prompt | self.chat_model
        answer = chain.invoke({"message": "\n\n".join(state["input"].message)}).content

        print(f"Bot is thinking of answering: {answer}")
        return answer
    
    def harmonize(self, state):
        prompt = ChatPromptTemplate.from_template(
            "You are in a group chat, and people are trying to decide what they should do together."
            "Evaluate a consensual proposal, while trying to please all"
            "individuals present in the group, or, if that's impossible,"
            "try to merge proposals to make a proposal which is acceptable for everyone."
            "For this, take into consideration the message history below, which is between triple backticks:"
            "```{message}```"
        )
        chain = prompt | self.chat_model
        answer = chain.invoke({"message": "\n\n".join(state["input"].message)}).content

        print(f"Bot is thinking of answering: {answer}")
        return answer

    def send_message_or_quit(self, answer):
        if answer:
            return answer
        else:
            return 'teste'

    def start_bot(self, user_input):
        estado = {"input": user_input}
        resultado = self.graph.invoke(estado)
        return resultado


def main():
    # Inicializar o chatbot
    chatbot = LangGraphChatbot()
    # Iniciar a interação com o bot
    chatbot.start_bot()

if __name__ == "__main__":
    main()
