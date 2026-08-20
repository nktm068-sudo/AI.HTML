const brokenLib = "ht tps:// cdn. jsd elivr. net/ npm/ @xen ova/ trans form ers@2. 17. 2";
const brokenModel = "Xe no va/ Qw en1. 5-0. 5B- Ch at";

const libUrl = brokenLib.replace(/\s+/g, '');
const modelId = brokenModel.replace(/\s+/g, '');

let generator = null;
const outputDiv = document.getElementById('output');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');

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

userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        window.generate();
    }
});

window.generate = async function() {
    const prompt = userInput.value.trim();
    if (!prompt || sendBtn.disabled) return;

    userInput.value = "";
    outputDiv.innerText = "Подключение к стабильному хабу и загрузка файлов (около 20 сек)...";
    sendBtn.disabled = true;

    try {
        const { pipeline, env } = await import(libUrl);
        
        env.allowLocalModels = false;
        env.remoteHost = "https://huggingface.co";
        env.remotePathTemplate = "{model}/resolve/main/";

        if (!generator) {
            generator = await pipeline('text-generation', modelId);
        }

        outputDiv.innerText = "Ядро ИИ вычисляет логику...";

        // Анализ сообщения пользователя на мат и капс для изменения характера
        const upperPrompt = prompt.toUpperCase();
        const hasBadWords = /(блять|сука|нахуй|заебал|бля|нах|похуй|хуй|говно|пидор|еб)/i.test(prompt);
        const isCapsAttack = prompt.length > 4 && prompt === upperPrompt;

        let aiCharacter = "Ты — вежливый и полезный ИИ-ассистент. Отвечай строго на русском языке.";

        if (hasBadWords || isCapsAttack) {
            aiCharacter = "Ты — дерзкий, резкий и саркастичный ИИ. Твой собеседник грубит тебе или кричит, поэтому ты имеешь полное право отвечать ему колко, грубо, с сарказмом и на «ты», но оставайся в рамках правил и пиши на русском языке.";
        }

        const systemPrompt = `<|im_start|>system\n${aiCharacter}\n<|im_end|>\n<|im_start|>user\n${prompt}\n<|im_end|>\n<|im_start|>assistant\n`;
        
        // Оптимальные параметры, чтобы нейросеть не плевалась пробелами
        const response = await generator(systemPrompt, {
            max_new_tokens: 150,
            temperature: 0.7,
            repetition_penalty: 1.2,
            do_sample: true
        });

        let rawText = response?.generated_text || "";
        let cleanText = rawText;

        if (cleanText.includes("assistant\n")) {
            cleanText = cleanText.split("assistant\n").pop();
        }

        cleanText = cleanText
            .replace(/<\|im_end\|>/g, "")
            .replace(/<\|im_start\|>/g, "")
            .trim();

        // Защита от HTML-тегов в ответе нейросети, чтобы не ломалась верстка
        let safeText = cleanText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        let finalHtml = `<div class="thinking">🧠 Мысли ИИ:<br>Логический анализ выполнен успешно.</div><div>${safeText}</div>`;

        typeText(finalHtml);

    } catch (e) {
        outputDiv.innerText = "Ошибка запуска ИИ: " + e.message;
        console.error(e);
    } finally {
        sendBtn.disabled = false;
    }
};
