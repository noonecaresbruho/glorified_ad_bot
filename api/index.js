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
        // Chamada oficial para listar os modelos disponíveis para sua chave
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY.trim()}`;
        
        const response = await axios.get(listUrl);
        
        // Vamos pegar apenas os nomes dos modelos para não ficar uma mensagem gigante
        const models = response.data.models.map(m => m.name.replace('models/', '')).join('\n');
        
        await sendMessage(chatId, `✅ Modelos disponíveis:\n\n${models}`);

      } catch (error) {
        const detail = error.response?.data?.error?.message || error.message;
        await sendMessage(chatId, `❌ Erro ao listar: ${detail}`);
      }
    }
    return res.status(200).send('OK');
  }
  res.status(200).send('ListModels Mode Active');
};
