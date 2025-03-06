let ChatWorking = false;
const coresHex = [
    "#FF5733", // Vermelho alaranjado
    "#33FF57", // Verde brilhante
    "#3357FF", // Azul forte
    "#FF33A8", // Rosa choque
    "#A833FF", // Roxo vibrante
    "#33FFF5", // Ciano claro
    "#FFD700", // Dourado
    "#FF4500", // Laranja avermelhado
    "#008000", // Verde escuro
    "#4B0082"  // Índigo
];
let userList = [];

// MAKE CHATS AVAILABLE//
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
            chatButton.id = chatId;
            chatButton.onclick = () => get_messages_from_a_chat(chatId);
            chatsDiv.appendChild(chatButton);
        });
    }
}

let activeChatButton = null;

// Function to select just one chat and indicate the activated chat 
function selectChat(chatId) {
    const chatContainer = document.getElementById("chats_id");
    const buttons = chatContainer.querySelectorAll("button");

    buttons.forEach(btn => {
        btn.style.backgroundColor = "#888888";
    });

    const selectedButton = document.getElementById(chatId);
    if (selectedButton) {
        selectedButton.style.backgroundColor = "#d98be9be";
        activeChatButton = selectedButton;
    } else {
        console.error(`Botão com ID ${chatId} não encontrado.`);
    }
}

// CREATE NEW CHAT //

// Event when click in "+" buttom
document.getElementById('new_chat').addEventListener('click', create_chat);

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

// SHOW A CONVERSATION //

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
            messages.messages.forEach(msg => {
                if (!userList.includes(msg.sender)) {
                    userList.push(msg.sender); // Adiciona apenas se ainda não existir
                }
                print_message(msg.sender, msg.message, coresHex[userList.indexOf(msg.sender)]);

            });
        }
        toggleSendButton(true);
        selectChat(conversation_id);
        return messages
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

// Function to show the messages in the page
async function print_message(user, message, cor) {
    const chatMessagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');

    if (user === "Bot") {
        messageElement.classList.add('message', 'bot-message');
    } else {
        messageElement.classList.add('message', 'user-message');
    }

    const userName = document.createElement('div');
    userName.classList.add('message-user');
    userName.textContent = user;

    if (user === "Bot") {
        userName.classList.add('bot-username');
    } else {
        userName.classList.add('user-username');
        userName.style.color = cor;
    }

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = message;

    messageElement.appendChild(userName);
    messageElement.appendChild(messageContent);
    chatMessagesContainer.appendChild(messageElement);

    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}



// SELECTING THE USER //
let selectedUser = "Daniel";
let buttons;

// Function to update the selected user
function updateSelection(button) {
    buttons.forEach(b => b.style.backgroundColor = '#ffffff62');
    button.style.backgroundColor = "#d98be9be";
    ;
}

// Function that gives a features for the users' buttons
window.addEventListener('load', () => {
    buttons = document.querySelectorAll('#users_id button');

    const defaultButton = buttons[0];
    updateSelection(defaultButton);

    selectedUser = defaultButton.textContent;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            updateSelection(button);
            selectedUser = button.textContent;
        });
    });
});

// TALKING TO THE BOT //
// Function to do a POST solicitation sending a message and receiving a ChatBot message
async function bot_message(message) {
    ChatWorking = true;
    showLoading();
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
        ChatWorking = false
        hideLoading();
        return messages;
    } catch (error) {
        console.error('Erro:', error);
        ChatWorking = false;
        hideLoading();
        return null;
    }
}


// Event when selecting "Enviar" button
document.getElementById('send-button').addEventListener('click', async () => {
    // If the Chatworking is true do nothing
    if (ChatWorking) return;

    // Stop the input option
    toggleSendButton(false);

    // Save the current user
    const currentUser = selectedUser;

    // Collect the user message at input bar
    const messageInput = document.getElementById('user-input');

    // Verify if the message is valid
    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    // Clean the input space
    messageInput.value = "";
    if (!userList.includes(currentUser)) {
        userList.push(currentUser);
    }
    // Print message
    print_message(currentUser, message, coresHex[userList.indexOf(currentUser)]);

    // Print the bot answer
    const response = await bot_message(message);
    print_message("Bot", response.message);

    // Turn possible a new input
    toggleSendButton(true);
});


// Event when press "Enter"
document.getElementById('user-input').addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        // If the Chatworking is true do nothing
        if (ChatWorking) return;

        // Stop the input option
        toggleSendButton(false);

        // Save the current user
        const currentUser = selectedUser;

        // Collect the user message at input bar
        const messageInput = document.getElementById('user-input');

        // Verify if the message is valid
        const message = messageInput.value.trim();

        if (message === "") {
            return;
        }

        // Clean the input space
        messageInput.value = "";

        if (!userList.includes(currentUser)) {
            userList.push(currentUser);
        }
        // Print message
        print_message(currentUser, message, coresHex[userList.indexOf(currentUser)]);


        // Print the bot answer
        const response = await bot_message(message);
        print_message("Bot", response.message);

        // Turn possible a new input
        toggleSendButton(true);
    }
});

// Function to call the loading animation 
function showLoading() {
    let loader = document.getElementById("loading-animation");
    if (loader) {
        loader.classList.remove("hidden");
    }

}

// Function to stop the loading animation
function hideLoading() {
    let loader = document.getElementById("loading-animation");
    if (loader) {
        loader.classList.add("hidden");
    }
}

// Function to disable the "Enviar" button and prevent Enter key press
function toggleSendButton(enabled) {
    const sendButton = document.getElementById('send-button');

    if (enabled) {
        sendButton.disabled = false;
        sendButton.style.backgroundColor = "#ffffff62";
        sendButton.style.cursor = "pointer";
        document.removeEventListener("keydown", preventEnterKey);
    } else {
        sendButton.disabled = true;
        sendButton.style.backgroundColor = "#888888";
        sendButton.style.cursor = "not-allowed";
        document.addEventListener("keydown", preventEnterKey);
    }
}

// Function to prevent Enter key press when the button is disabled
function preventEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
    }
}


// Call "displayChats" function when the page is loaded/reloaded
document.addEventListener('DOMContentLoaded', function () {
    displayChats();
    if (activeChatButton === null) {
        print_message("Bot", "Selecione ou crie um chat! :D");
        toggleSendButton(false);
    } else {
        toggleSendButton(true);
    }
});




