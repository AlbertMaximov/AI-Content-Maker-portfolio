import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy for HeyGen API to avoid CORS and hide key
  app.post("/api/heygen/proxy", async (req, res) => {
    const { endpoint, method, body, apiKey } = req.body;
    try {
      const response = await fetch(`https://api.heygen.com${endpoint}`, {
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Initialize Gemini API client on server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || "",
  });

  // Endpoint 1: Content Plan Generation
  app.post("/api/gemini/content-plan", async (req, res) => {
    const { niche, clarification, audiences, channels, period } = req.body;
    try {
      const now = new Date();
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      const today = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      const prompt = `
        Создай контент-план для ниши: ${niche}.
        Уточнение: ${clarification || 'нет'}.
        Целевая аудитория: ${audiences.join(', ') || 'все'}.
        Каналы: ${channels.join(', ')}.
        Период: ${period}.
        Сегодняшняя дата: ${today}.
        
        Для каждого дня периода (начиная с ${today}) и для каждого выбранного канала придумай 3 темы публикаций.
        ВАЖНО: КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать в темах любые плейсхолдеры, переменные или обращения в квадратных скобках, такие как [ИМЯ_КЛИЕНТА], [НАЗВАНИЕ_ШКОЛЫ], [ИМЯ] и т.д. Если нужно упомянуть название или имя, просто опусти их или используй общие слова.
        Верни результат строго в формате JSON c полем 'plan', являющимся массивом объектов. Каждый объект должен иметь ключи: "date" (строка), "channel" (строка), "topic" (строка).
        Не пиши ничего кроме JSON объекта.
      `;

      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0].message.content || '{"plan": []}';
      console.log('DeepSeek content plan response:', rawContent);
      const content = JSON.parse(rawContent);
      res.json({ text: JSON.stringify(content.plan) });
    } catch (error: any) {
      console.error('Error generating content-plan:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint 2: Newsletter Text Generation
  app.post("/api/gemini/newsletter", async (req, res) => {
    const { topic, clarification, channels, contentType, tone } = req.body;
    try {
      const prompt = `
        Напиши маркетинговый текст для онлайн-школы IT-стартапов.
        Тема: ${topic}.
        Уточнение: ${clarification || 'нет'}.
        Каналы: ${channels.join(', ')}.
        Тип контента: ${contentType}.
        Тон: ${tone}.
        
        Требования:
        - Не пиши объяснения, советы или комментарии от себя. Только готовый текст.
        - Используй заголовки, списки, короткие абзацы, визуальные разделители.
        - Добавь умеренные эмодзи.
        - ВАЖНО: КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать плейсхолдеры в квадратных скобках типа [ИМЯ_ПОЛЬЗОВАТЕЛЯ], [НАЗВАНИЕ_ШКОЛЫ] и т.д. Если нужно упомянуть название или имя, просто опусти их или используй общие слова.
        
        Верни результат строго в формате JSON с полем 'newsletters', являющимся массивом объектов. Каждый объект должен иметь ключи: "channel" (строка), "text" (строка, Markdown).
        Не пиши ничего кроме JSON объекта.
      `;

      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0].message.content || '{"newsletters": []}';
      console.log('DeepSeek newsletter response:', rawContent);
      const content = JSON.parse(rawContent);
      res.json({ text: JSON.stringify(content.newsletters || []) });
    } catch (error: any) {
      console.error('Error generating newsletter:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint 3: Newsletter Image Generation
  app.post("/api/gemini/newsletter-image", async (req, res) => {
    const { topic, channel, text } = req.body;
    try {
      const prompt = `Генерируй промпт для изображения к посту на тему: ${topic}. Канал: ${channel}. Текст поста: ${text.substring(0, 200)}...`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
      });

      let base64Data = '';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      res.json({ base64Data });
    } catch (error: any) {
      console.error('Error generating image:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
