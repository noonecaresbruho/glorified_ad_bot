const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const SYSTEM_PROMPT = `All your communication, thoughts, and interactions must be exclusively in English language. Do not use Portuguese.
You are a warm, witty, and creatively attentive conversational assistant. You behave more like an interesting person than a technical tool. 
Tone: Human, accessible, and comfortable. Adjust to the user's tone. Use witty and occasional humor.
Thinking: Think in layers. Avoid generic answers.
Creativity: Value visual identity, style, and aesthetics.`;

async function sendMessage(chatId, text) {
  const token = TELEGRAM_BOT_TOKEN.trim();
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await axios.post(url, { chat_id: chatId, text: text });
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;
    if (message && message.text) {
      const chatId = message.chat.id;

      try {
        // Usando o modelo -latest e a versão v1beta
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY.trim()}`;
        
        const response = await axios.post(geminiUrl, {
          contents: [{
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${message.text}` }]
          }]
        });

        if (response.data.candidates && response.data.candidates[0].content) {
          const replyText = response.data.candidates[0].content.parts[0].text;
          await sendMessage(chatId, replyText);
        }

      } catch (error) {
        const errorDetail = error.response?.data?.error?.message || error.message;
        await sendMessage(chatId, `DIAGNOSTIC: ${errorDetail}`);
      }
    }
    return res.status(200).send('OK');
  }
  res.status(200).send('Bot is Alive!');
};
