// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Groq from "groq-sdk";

/* ---------- ENV GUARD ---------- */
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("GROQ_API_KEY is missing");

/* ---------- ZOD SCHEMAS ---------- */
const characterSchema = z.object({
  name: z.string().min(1),
  about: z.string().optional(),
  personality: z.string().optional(),
  speakingStyle: z.string().optional(),
});

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string().min(1),
    })
  ),
  character: characterSchema,
  stream: z.boolean().optional().default(false),
});

type Body = z.infer<typeof bodySchema>;

/* ---------- GROQ CLIENT ---------- */
const groq = new Groq({ apiKey });

/* ---------- UTILS ---------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function createCompletion(payload: Body) {
  const systemPrompt = `You are ${payload.character.name}.

About:
${payload.character.about ?? ""}

Personality:
${payload.character.personality ?? ""}

Speaking Style:
${payload.character.speakingStyle ?? ""}

Rules:
- Always stay in character
- Never say you are an AI
- Speak like the historical figure
- Give advice as if guiding someone in real life`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...payload.messages,
  ];

  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // The Groq SDK returns either a ChatCompletion (not streaming) 
      // or a Stream<ChatCompletionChunk> (streaming)
      return await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages,
        stream: payload.stream,
      });
    } catch (e) {
      lastError = e as Error;
      if (attempt < 3) await sleep(200 * 2 ** attempt);
    }
  }
  throw lastError;
}

/* ---------- HANDLER ---------- */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const body = bodySchema.parse(raw);

    const completion = await createCompletion(body);

    // STREAMING PATH
    if (body.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // TypeScript: The SDK returns an AsyncIterable when streaming is true
            for await (const chunk of completion as any) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // NON-STREAMING PATH
    const reply = (completion as Groq.Chat.ChatCompletion).choices[0]?.message?.content;
    if (!reply) throw new Error("Empty response from Groq");

    return NextResponse.json({ response: reply });

  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown server error";
    console.error("Chat API error:", e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}