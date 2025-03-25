import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import cors from 'cors';
import { token, webAppUrl, port } from './config.js';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

const handleStartCommand = async (chatId) => {
  await bot.sendMessage(chatId, 'Ниже появится кнопка, заполните форму', {
    reply_markup: {
      keyboard: [
        [{ text: 'Заполнить форму', web_app: { url: `${webAppUrl}/form` } }],
      ],
      resize_keyboard: true,
    },
  });
};

const handleOrderCommand = async (chatId) => {
  await bot.sendMessage(chatId, 'Добро пожаловать в наш интернет-магазин', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Сделать заказ', web_app: { url: webAppUrl } }],
      ],
    },
  });
};

const handleWebAppData = async (chatId, webAppData) => {
  try {
    const data = JSON.parse(webAppData);

    if (!data?.country || !data?.street) {
      throw new Error('Неполные данные из веб-приложения');
    }

    await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
    await bot.sendMessage(chatId, `Ваша страна: ${data.country}`);
    await bot.sendMessage(chatId, `Ваша улица: ${data.street}`);

    setTimeout(async () => {
      await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
    }, 1000);
  } catch (error) {
    console.error('Ошибка обработки данных:', error);
    await bot.sendMessage(
      chatId,
      'Произошла ошибка при обработке ваших данных'
    );
  }
};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    if (text === '/start') return await handleStartCommand(chatId);
    if (text === '/order') return await handleOrderCommand(chatId);
    if (msg?.web_app_data?.data)
      return await handleWebAppData(chatId, msg.web_app_data.data);
  } catch (error) {
    console.error('Ошибка обработки сообщения:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка, попробуйте позже');
  }
});

app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: 'queryId',
      title: 'Успешная покупка',
      input_message_content: {
        message_text:
          'Поздравляю с покупкой, вы приобрели товар на сумму' + totalPrice,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: 'queryId',
      title: 'Не удалось приобрести товар',
      input_message_content: {
        message_text: 'Не удалось приобрести товар',
      },
    });
    return res.status(500).json({});
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Веб-приложение доступно по адресу: ${webAppUrl}`);
});
