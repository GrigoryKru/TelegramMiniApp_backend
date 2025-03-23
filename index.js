import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEB_URL;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появиться кнопка, заполните форму', {
      reply_markup: {
        keyboard: [
          [{ text: 'Заполнить форму', web_app: { url: webAppUrl + '/form' } }],
        ],
      },
    });
  }

  if (text === '/order') {
    await bot.sendMessage(chatId, 'Заходи в наш интернет ', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Сделать заказ', web_app: { url: webAppUrl } }],
        ],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
      await bot.sendMessage(chatId, 'Ваша страна:' + data?.country);
      await bot.sendMessage(chatId, 'Ваша улица:' + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          ' Всю информацию вы получите в этом чате'
        );
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  }
});
