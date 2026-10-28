import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini SDK safely on the server
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health and Provider Status API
app.get('/api/ai/status', (_req: Request, res: Response) => {
  const geminiAvailable = Boolean(process.env.GEMINI_API_KEY);
  const openaiAvailable = Boolean(process.env.OPENAI_API_KEY);

  res.json({
    geminiAvailable,
    openaiAvailable,
    activeProvider: geminiAvailable ? 'gemini' : openaiAvailable ? 'openai' : 'rule_based',
    models: {
      gemini: ['gemini-3.8-flash', 'gemini-3.1-flash-lite'],
      openai: ['gpt-4o-mini', 'gpt-4o'],
    },
    message: geminiAvailable
      ? 'Google Gemini AI engine connected and ready.'
      : openaiAvailable
      ? 'OpenAI engine connected and ready.'
      : 'Deterministic rule-based scheduling engine active (Offline/Fallback mode).',
  });
});

// 2. Intelligent AI Study Planner Endpoint
app.post('/api/ai/plan', async (req: Request, res: Response) => {
  const {
    studentName,
    targetGoal,
    targetDate,
    dailyStudyHours,
    subjects,
    chapters,
    daysToSchedule = 7,
    provider = 'gemini',
    model = 'gemini-3.8-flash',
  } = req.body;

  try {
    const gemini = getGeminiClient();

    if (provider === 'gemini' && gemini) {
      const prompt = `You are the core intelligence of "Agami", an expert academic scheduling engine for students.
Create an adaptive, balanced study schedule for the next ${daysToSchedule} days.

Student: ${studentName || 'Student'}
Target Exam/Goal: ${targetGoal || 'Board Examination'} (Exam Date: ${targetDate || 'Upcoming'})
Available Daily Study Hours: ${dailyStudyHours || 6} hours/day.

Subjects and Chapters to prioritize:
${JSON.stringify(
  (chapters || []).slice(0, 15).map((c: any) => ({
    id: c.id,
    subjectId: c.subjectId,
    name: c.nameEn || c.nameBn,
    priority: c.priority,
    difficulty: c.difficulty || 'Medium',
    status: c.status,
    confidence: c.confidence,
    estimatedHours: c.estimatedHours,
    deadlineDate: c.deadlineDate,
  })),
  null,
  2
)}

Guidelines:
1. Prevent schedule fatigue: allocate realistic study sessions (45 to 90 minutes).
2. Balance theory review, numerical calculations, MCQ practice, CQ written practice, and revision.
3. Prioritize urgent, high-priority, and weak confidence chapters whose deadlines are near.
4. Output structured JSON matching the provided schema. Include concise reasoning explaining why this schedule was chosen.`;

      let aiResponseText = '';
      try {
        const primaryResp = await gemini.models.generateContent({
          model: model || 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an intelligent educational planning engine. Always respond in valid JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reasoning: {
                  type: Type.STRING,
                  description: 'Concise explanation of the adaptive scheduling strategy used.',
                },
                feasibilitySummary: {
                  type: Type.STRING,
                  description: 'Assessment of whether the remaining workload is realistically achievable before the target date.',
                },
                sessions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayOffset: { type: Type.INTEGER, description: 'Day offset from 0 (today) up to daysToSchedule - 1' },
                      subjectId: { type: Type.STRING },
                      chapterId: { type: Type.STRING },
                      title: { type: Type.STRING },
                      taskType: { type: Type.STRING, description: 'theory | numerical | mcq | cq | revision | mock_test' },
                      durationMinutes: { type: Type.INTEGER },
                      startTime: { type: Type.STRING, description: 'HH:mm format like 16:00' },
                      priority: { type: Type.STRING, description: 'high | medium | low' },
                      reason: { type: Type.STRING },
                    },
                    required: ['dayOffset', 'title', 'durationMinutes', 'priority'],
                  },
                },
              },
              required: ['reasoning', 'sessions'],
            },
          },
        });
        aiResponseText = primaryResp.text || '';
      } catch (geminiErr: any) {
        console.warn('Primary model failed, attempting flash-lite fallback:', geminiErr?.message);
        try {
          const liteResp = await gemini.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              systemInstruction: 'You are an intelligent educational planning engine. Always respond in valid JSON.',
              responseMimeType: 'application/json',
            },
          });
          aiResponseText = liteResp.text || '';
        } catch (liteErr: any) {
          console.warn('Fallback model also unavailable:', liteErr?.message);
          return res.json({
            success: false,
            fallbackToRuleBased: true,
            message: 'Gemini service temporarily busy; using deterministic planner.',
          });
        }
      }

      const parsed = JSON.parse(aiResponseText || '{}');
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        return res.json({ success: true, provider: 'gemini', data: parsed });
      }
    }

    // OpenAI provider support if configured
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      const openAiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are Agami AI planning engine. Output strict JSON with { reasoning, feasibilitySummary, sessions: [...] }',
            },
            {
              role: 'user',
              content: `Create a ${daysToSchedule}-day study plan for ${studentName || 'Student'}. Target: ${targetGoal}. Available hours: ${dailyStudyHours} hrs/day. Chapters: ${JSON.stringify(chapters?.slice(0, 10))}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (openAiResp.ok) {
        const result = await openAiResp.json();
        const content = JSON.parse(result.choices[0].message.content);
        return res.json({ success: true, provider: 'openai', data: content });
      }
    }

    // Fallback: Notify client to run deterministic scheduling engine
    return res.json({
      success: false,
      fallbackToRuleBased: true,
      message: 'No external AI API key configured. Using built-in deterministic scheduling engine.',
    });
  } catch (error: any) {
    console.error('AI Planning Error:', error);
    return res.status(200).json({
      success: false,
      fallbackToRuleBased: true,
      error: error.message || 'Error communicating with AI engine',
    });
  }
});

// 3. Smart Study Task Breakdown Generator
app.post('/api/ai/suggest-tasks', async (req: Request, res: Response) => {
  const { subjectName, chapterName, topics, difficulty = 'Medium', language = 'en' } = req.body;

  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.json({
        success: false,
        fallbackToRuleBased: true,
        message: 'Using rule-based task generator.',
      });
    }

    const prompt = `For subject "${subjectName}" and chapter "${chapterName}" (${difficulty} difficulty, topics: ${Array.isArray(topics) ? topics.join(', ') : topics || 'Core concepts'}),
generate 4 to 6 actionable student study tasks tailored specifically to this topic (such as key formula derivations, textbook numericals, creative question CQ practice, MCQ speed test, and mistake revision).
Provide task titles in ${language === 'bn' ? 'Bangla' : 'English'}.`;

    const aiResponse = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  taskType: { type: Type.STRING, description: 'theory | numerical | mcq | cq | revision' },
                  estimatedMinutes: { type: Type.INTEGER },
                },
                required: ['title', 'estimatedMinutes'],
              },
            },
          },
          required: ['tasks'],
        },
      },
    });

    const parsed = JSON.parse(aiResponse.text || '{}');
    return res.json({ success: true, tasks: parsed.tasks || [] });
  } catch (error: any) {
    return res.json({
      success: false,
      fallbackToRuleBased: true,
      error: error.message,
    });
  }
});

// 4. Feasibility & Bottleneck Schedule Analyzer
app.post('/api/ai/analyze-schedule', async (req: Request, res: Response) => {
  const { targetDate, dailyStudyHours, totalRemainingHours, weakChaptersCount, overdueCount } = req.body;

  try {
    const gemini = getGeminiClient();
    if (!gemini) {
      return res.json({
        success: false,
        fallbackToRuleBased: true,
      });
    }

    const prompt = `Analyze student study feasibility:
- Target Exam Date: ${targetDate}
- Daily Available Hours: ${dailyStudyHours} hrs
- Total Remaining Syllabus Hours: ${totalRemainingHours} hrs
- Weak Chapters Needing Revision: ${weakChaptersCount}
- Overdue Tasks: ${overdueCount}

Provide a concise, encouraging 2-sentence evaluation and 2 specific optimization tips for the student.`;

    const aiResponse = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFeasible: { type: Type.BOOLEAN },
            evaluation: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['isFeasible', 'evaluation', 'tips'],
        },
      },
    });

    const parsed = JSON.parse(aiResponse.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    return res.json({ success: false, fallbackToRuleBased: true });
  }
});

// Serve frontend: Vite middleware in dev, dist files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Agami server running on port ${port} (mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
