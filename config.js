import dotenv from 'dotenv';

dotenv.config();

export const token = process.env.BOT_TOKEN;
export const webAppUrl = process.env.WEB_URL;
export const port = process.env.PORT;
