const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

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
        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY.trim()}`;
        
        const response = await axios.post(geminiUrl, {
          contents: [{ parts: [{ text: message.text }] }]
        });

        const replyText = response.data.candidates[0].content.parts[0].text;
        await sendMessage(chatId, replyText);

      } catch (error) {
        // Agora o bot vai te falar o erro real no chat do Telegram!
        const errorDetail = error.response?.data?.error?.message || error.message;
        await sendMessage(chatId, `DEBUG ERROR: ${errorDetail}`);
      }
    }
    return res.status(200).send('OK');
  }
  res.status(200).send('Diagnostic Mode Active');
};
