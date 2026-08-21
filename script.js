// 1. ИМПОРТЫ ОФИЦИАЛЬНЫХ БИБЛИОТЕК (Никита, сотри пробелы в адресах ниже!)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.js";

// 2. ТВОЙ КОНФИГ ИЗ КОНСОЛИ FIREBASE (Никита, сотри пробелы внутри кавычек ниже!)
const firebaseConfig = {
    apiKey: "AIzaSyCznFuCKXm9_gO37587tTMoZAHmSq74EqQ",
    authDomain: "ngpt-ai.firebaseapp.com",
    projectId: "ngpt-ai",
    storageBucket: "ngpt-ai.appspot.com",
    messagingSenderId: "397399730958",
    appId: "1:397399730958:web:42b672dd37dc4fda3d855f"
};

// Защитный авто-фикс пробелов для полей конфига, чтобы ничего не упало
firebaseConfig.authDomain = firebaseConfig.authDomain.replace(/\s+/g, '');
firebaseConfig.storageBucket = firebaseConfig.storageBucket.replace(/\s+/g, '');

// Инициализация Firebase модулей
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Локальное хранилище истории диалога
if (!window.chatHistory) {
    window.chatHistory = [];
}

// Поиск интерфейсных элементов на странице
const authScreen = document.getElementById('authScreen');
const chatContainer = document.getElementById('chatContainer');
const userGreeting = document.getElementById('userGreeting');
const outputDiv = document.getElementById('output');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');

// Контроль авторизации (скрываем чат, пока пользователь не вошёл)
onAuthStateChanged(auth, (user) => {
    if (user) {
        authScreen.style.display = 'none';
        chatContainer.style.display = 'block';
        userGreeting.innerText = `Рад видеть вас сегодня, ${user.displayName || 'Оператор'}.`;
    } else {
        authScreen.style.display = 'flex';
        chatContainer.style.display = 'none';
        window.chatHistory = []; // Очищаем историю при выходе
    }
});

// Логика вызова окон авторизации при клике по кнопкам
document.getElementById('googleLoginBtn').addEventListener('click', () => signInWithPopup(auth, googleProvider).catch(err => alert(err.message)));
document.getElementById('githubLoginBtn').addEventListener('click', () => signInWithPopup(auth, githubProvider).catch(err => alert(err.message)));
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

// Эффект посимвольной хакерской печати HTML-текста
function typeText(targetHtml, callback) {
    outputDiv.innerHTML = "";
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = targetHtml;
    const nodes = Array.from(tempDiv.childNodes);
    let nodeIndex = 0;
    
    function renderNextNode() {
        if (nodeIndex >= nodes.length) {
            if (callback) callback();
            return;
        }
        const currentNode = nodes[nodeIndex];
        if (currentNode.nodeType === Node.TEXT_NODE) {
            let text = currentNode.textContent;
            let charIndex = 0;
            const textNode = document.createTextNode("");
            outputDiv.appendChild(textNode);
            
            function typeChar() {
                if (charIndex < text.length) {
                    textNode.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChar, 15);
                } else {
                    nodeIndex++;
                    renderNextNode();
                }
            }
            typeChar();
        } else {
            const clonedNode = currentNode.cloneNode(false);
            outputDiv.appendChild(clonedNode);
            let childText = currentNode.textContent;
            let charIndex = 0;
            
            function typeChildChar() {
                if (charIndex < childText.length) {
                    clonedNode.textContent += childText.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChildChar, 15);
                } else {
                    nodeIndex++;
                    renderNextNode();
                }
            }
            typeChildChar();
        }
    }
    renderNextNode();
}

// Отправка сообщений по нажатию Enter в текстовом поле
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        generate();
    }
});

// Отправка запроса на твой питоновский Gradio Space
async function generate() {
    const prompt = userInput.value.trim();
    if (!prompt || sendBtn.disabled) return;

    userInput.value = "";
    outputDiv.innerText = "Удаленный Gradio-сервер вычисляет логику...";
    sendBtn.disabled = true;

    try {
        // Твоя ссылка на Gradio Space (Никита, сотри пробелы внутри кавычек ниже!)
        const spaceUrl = "ht tp s:// em er al dcr ea to r- ai- gp t. hf. sp ac e";
        const cleanUrl = spaceUrl.replace(/\s+/g, '');
        
        // Подключаемся напрямую к твоему Python-серверу
        const client = await Client.connect(cleanUrl);
        
        // Вызываем функцию chat_api, передаем текст и текущую историю
        const result = await client.predict("/chat_api", { 
            prompt: prompt, 
            history: window.chatHistory 
        });

        const aiResponse = result.data;

        // Сохраняем реплики в историю переписки
        window.chatHistory.push({ role: 'user', content: prompt });
        window.chatHistory.push({ role: 'assistant', content: aiResponse });

        let finalHtml = `<div class="thinking">🧠 Мысли ИИ:<br>Анализ выполнен через Градио на сервере.</div><div>${aiResponse}</div>`;
        typeText(finalHtml);

    } catch (e) {
        outputDiv.innerText = "Ошибка Градио: " + e.message;
        console.error(e);
    } finally {
        sendBtn.disabled = false;
    }
}

// Привязываем запуск логики к клику по кнопке
sendBtn.addEventListener('click', generate);
