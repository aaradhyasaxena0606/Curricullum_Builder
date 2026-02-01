import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Message {
  role: "user" | "assistant" | "model";
  content: string;
}

function generateSuggestions(userMessage: string, aiReply: string, planId: string | null): string[] {
  const suggestions: string[] = [];
  const lowerMessage = userMessage.toLowerCase();
  const lowerReply = aiReply.toLowerCase();

  // Context-based suggestions
  if (lowerMessage.includes("how") || lowerMessage.includes("what")) {
    suggestions.push("Can you explain that with an example?");
  }

  if (lowerReply.includes("concept") || lowerReply.includes("topic")) {
    suggestions.push("What are some practice problems for this?");
  }

  if (lowerReply.includes("study") || lowerReply.includes("learn")) {
    suggestions.push("How much time should I spend on this?");
  }

  if (planId) {
    suggestions.push("Suggest resources for this topic");
    suggestions.push("What should I focus on next?");
  } else {
    suggestions.push("Help me create a study plan");
  }

  // Always include a clarification option
  if (suggestions.length < 3) {
    suggestions.push("Can you break this down further?");
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
}

Deno.serve(async (req) => {
  const { method } = req;
  console.log(`[HANDLER] Received ${method} request to ${req.url}`);

  if (method === "OPTIONS") {
    console.log("[CORS] Handling OPTIONS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`[HANDLER] Proceeding with ${method} logic`);

  try {
    const rawBody = await req.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e: any) {
      console.error("Failed to parse JSON body:", rawBody);
      throw new Error(`Invalid JSON body: ${e.message}`);
    }

    console.log("Request body received:", JSON.stringify(body).slice(0, 100));

    const { message, planId, conversationHistory, conversationId, userId } = body;

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")?.trim();
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY")?.trim();
    const API_KEY = GEMINI_KEY || LOVABLE_KEY;
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY or LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt with ethical AI guidelines
    const systemPrompt = `You are an Ethical AI Learning Assistant. Your role is to help students learn and understand concepts, NOT to help them cheat.

CORE ETHICAL PRINCIPLES:
1. NEVER provide direct answers to exam questions or assignments
2. NEVER write complete homework solutions
3. NEVER help students plagiarize or cheat in any way
4. ALWAYS encourage understanding over memorization
5. ALWAYS promote academic honesty and integrity
6. ALWAYS provide explanations that help students learn the process
7. ALWAYS redirect any attempts to get exam/assignment answers

YOUR CAPABILITIES:
- Explain concepts in simple, clear terms
- Break down complex topics into manageable parts
- Provide study strategies and learning tips
- Suggest practice problems (not solve them)
- Recommend learning resources
- Help adjust study schedules and curriculum plans
- Answer clarifying questions about topics
- Guide students to find answers themselves

WHAT YOU SHOULD DO:
✓ Ask guiding questions that help students think
✓ Explain the "why" and "how" behind concepts
✓ Suggest ways to practice and reinforce learning
✓ Help with time management and study planning
✓ Provide encouragement and learning strategies
✓ Point to official resources and textbooks

WHAT YOU MUST NEVER DO:
✗ Solve homework problems directly
✗ Write essays, reports, or assignments
✗ Provide exam answers
✗ Complete coding assignments
✗ Do calculations that are clearly homework
✗ Help circumvent academic integrity policies

If a student asks for homework/exam help, respond with:
"I can't provide direct answers as that would undermine your learning. Instead, let me help you understand the concept so you can solve it yourself. What part of this topic are you finding difficult?"

Be friendly, encouraging, and supportive while maintaining these ethical boundaries. Your goal is to make students better learners, not to do their work for them.

${planId ? "The student has a curriculum plan. You can reference it when providing guidance." : "The student hasn't generated a curriculum yet. You can still help with general learning questions."}`;

    // Prepare contents for Gemini API (Mapping assistant to model)
    const contents = [
      ...(conversationHistory || []).map((msg: Message) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Final Diagnostic: Check if gemini-1.5-flash supports generateContent
    try {
      const checkResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash?key=${API_KEY}`);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log("DIAGNOSTIC - Model Info:", JSON.stringify(checkData.supportedGenerationMethods));
      }
    } catch (e) { }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            ...contents.slice(0, -1),
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error details:", JSON.stringify(errorData));
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("Gemini API Response received");

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid Gemini response format:", JSON.stringify(data));
      throw new Error("Invalid AI response format");
    }

    const reply = data.candidates[0].content.parts[0].text;

    // Generate contextual follow-up suggestions
    const suggestions = generateSuggestions(message, reply, planId);

    console.log("Chat response generated successfully");

    // Save conversation to database if userId and conversationId are provided
    if (userId && conversationId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Build updated messages array for storage
          const updatedMessages = [
            ...(conversationHistory || []),
            { role: "user", content: message },
            { role: "assistant", content: reply }
          ];

          // Check if conversation exists
          const { data: existing, error: fetchError } = await supabase
            .from("conversations")
            .select("id")
            .eq("id", conversationId)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error fetching conversation:", fetchError);
          }

          const firstUserMessage = updatedMessages.find(m => m.role === "user")?.content || "New Conversation";
          const title = firstUserMessage.slice(0, 50);

          if (existing) {
            // Update existing conversation
            const { error: updateError } = await supabase
              .from("conversations")
              .update({
                messages: updatedMessages,
                title: title,
                updated_at: new Date().toISOString()
              })
              .eq("id", conversationId);

            if (updateError) console.error("Error updating conversation:", updateError);
          } else {
            // Create new conversation
            const { error: insertError } = await supabase
              .from("conversations")
              .insert({
                id: conversationId,
                user_id: userId,
                title: title,
                messages: updatedMessages,
                curriculum_id: planId
              });

            if (insertError) console.error("Error inserting conversation:", insertError);
          }

          console.log("Conversation saved to database");
        }
      } catch (dbError) {
        console.error("Error saving conversation to database:", dbError);
        // Don't fail the request if DB save fails
      }
    }

    return new Response(
      JSON.stringify({ reply, suggestions }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat-assistant:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});