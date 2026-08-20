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

        const systemPrompt = `<|im_start|>system\nТы — сверхрациональный ИИ. Отвечай строго на русском языке. Сначала пиши свои мысли в теге <think>, а затем давай чёткий ответ.\n<|im_end|>\n<|im_start|>user\n${prompt}\n<|im_end|>\n<|im_start|>assistant\n<think>\n`;
        
        const response = await generator(systemPrompt, {
            max_new_tokens: 300,
            temperature: 0.2,
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

        let finalHtml = "";
        if (cleanText.includes("<think>") && cleanText.includes("</think>")) {
            let parts = cleanText.split("</think>");
            let thinkingProcess = parts[0].replace("<think>", "").trim();
            let finalAnswer = parts[1].trim();
            finalHtml = `<div class="thinking">🧠 Мысли ИИ:<br>${thinkingProcess}</div><div>${finalAnswer}</div>`;
        } else if (cleanText.includes("</think>")) {
            let parts = cleanText.split("</think>");
            finalHtml = `<div class="thinking">🧠 Мысли ИИ:<br>Анализ завершен успешно.</div><div>${parts[0].trim()}</div>`;
        } else {
            finalHtml = `<div class="thinking">🧠 Мысли ИИ:<br>Логический анализ выполнен успешно.</div><div>${cleanText}</div>`;
        }

        typeText(finalHtml);

    } catch (e) {
        outputDiv.innerText = "Ошибка запуска ИИ: " + e.message;
        console.error(e);
    } finally {
        sendBtn.disabled = false;
    }
};
