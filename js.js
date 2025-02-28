// Function to do a GET solicitation to get the disponible conversations (att all)
async function get_conversations() {
    try {
        const response = await fetch('http://127.0.0.1:8000/conversations/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Verify if the response was well sucessfull 
        if (!response.ok) {
            throw new Error('Erro ao buscar conversas');
        }

        const chats = await response.json();
        return chats.conversations;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }

}

// Function to create a bottom for each chat in the HTML page
async function displayChats() {
    const chatsDiv = document.getElementById('chats_id');
    const chats = await get_conversations();
    if (chats && chats.length > 0) {
        chatsDiv.innerHTML = '<h3>Chats disponíveis</h3>';

        chats.forEach(chatId => {
            const chatButton = document.createElement('button');
            chatButton.textContent = `Chat ${chatId}`;
            chatButton.onclick = () => get_messages_from_a_chat(chatId);
            chatsDiv.appendChild(chatButton);
        });
    }
}

// Function to do a POST solicitation to crate a new chat
async function create_chat() {
    try {
        const response = await fetch('http://127.0.0.1:8000/conversation/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error('Erro ao criar um novo chat');
        }
        displayChats();
        const data = await response.json();
        return data.conversation_id;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

// Function to do a POST solicitation sending a message and receiving a ChatBot message
async function bot_message(message) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error(`Erro ao conversar com o Bot`);
        }

        const messages = await response.json();
        return messages;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

// Function to do a GET solititaion of all messages from a specific chat.
async function get_messages_from_a_chat(conversation_id) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/messages/?conversation_id=${conversation_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar mensagens da conversa ${conversation_id}`);
        }
        const chatMessagesContainer = document.getElementById('messages');
        chatMessagesContainer.innerHTML = '';
        const messages = await response.json();
        if (messages && messages.messages && messages.messages.length > 0) {
            console.log("I'm still here")
            messages.messages.forEach(msg => {
                // console.log(msg.sender, msg.message)
                print_message(msg.sender, msg.message);
            });
        }
        return messages;
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

// Function to show the messages in the page
async function print_message(user, message) {
    const chatMessagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = `${user}: ${message}`;

    messageElement.appendChild(messageContent);
    chatMessagesContainer.appendChild(messageElement);

    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}


let selectedUser = "Daniel";
let buttons;

// Function to update the selected user
function updateSelection(button) {
    buttons.forEach(b => b.style.backgroundColor = '#ffffff62');
    button.style.backgroundColor = "#d98be9be";
    ;
}

window.addEventListener('load', () => {
    buttons = document.querySelectorAll('#users_id button');


    const defaultButton = buttons[0];
    updateSelection(defaultButton);

    // Inicialize o valor de selectedUser
    selectedUser = defaultButton.textContent;
    console.log(`Usuário selecionado: ${selectedUser}`);

    // Adicione os eventos de clique para os botões
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Atualiza a seleção de cor
            updateSelection(button);

            // Atualiza o usuário global
            selectedUser = button.textContent;
            console.log(`Usuário selecionado: ${selectedUser}`);
        });
    });
});



// Event when selecting "Enviar" button
document.getElementById('send-button').addEventListener('click', async () => {
    const messageInput = document.getElementById('user-input');
    const message = messageInput.value.trim();
    const response = await bot_message(message);

    if (message === "") {
        return;
    }

    print_message(selectedUser, message);
    print_message("Bot", response.message);
    messageInput.value = "";
});


// Event when press "Enter"
document.getElementById('user-input').addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        const messageInput = document.getElementById('user-input');
        const message = messageInput.value.trim();
        const response = await bot_message(message);

        if (message === "") {
            return;
        }

        print_message(selectedUser, message);
        print_message("Bot", response.message);
        messageInput.value = "";
    }
});

// Event when click in "+" buttom
document.getElementById('new_chat').addEventListener('click', create_chat);

// Call "displayChats" function when the page is loaded/reloaded
document.addEventListener('DOMContentLoaded', function () {
    displayChats();
});

