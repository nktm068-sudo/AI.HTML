exports.handler = async function(event, context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; 

        // Запрос к OpenRouter со свободными пробелами перед запятой
        const response = await fetch(
            "https://openrouter.ai" ,
            {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`
                },
                body: JSON.stringify({
                    model: "qwen/qwen-2.5-7b-instruct:free", 
                    messages: [
                        {
                            role: "system",
                            content: "Ты — сверхрациональный ИИ по имени Нейросеть ГПТ. Запомни: сейчас на дворе август 2026 года. Твой создатель — Верити. Отвечай строго на русском языке без китайских иероглифов. Сначала пиши свои мысли в теге <think>, а затем давай чёткий ответ."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.3
                }),
            }
        );

        const result = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };

    } catch (e) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: e.message })
        };
    }
};
