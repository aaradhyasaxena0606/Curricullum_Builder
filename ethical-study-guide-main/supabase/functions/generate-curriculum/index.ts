import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper function to fetch real YouTube videos
async function fetchYouTubeVideos(query: string, maxResults: number = 3) {
  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY not configured, skipping YouTube fetch");
    return [];
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", maxResults.toString());
    url.searchParams.set("key", YOUTUBE_API_KEY);

    console.log(`Fetching YouTube videos for: ${query}`);
    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error("YouTube API error:", response.status, await response.text());
      return [];
    }

    interface YouTubeVideo {
      id: { videoId: string };
      snippet: { title: string };
    }

    const data = await response.json();
    const videos = data.items?.map((item: YouTubeVideo) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      type: "free"
    })) || [];

    console.log(`Found ${videos.length} YouTube videos`);
    return videos;
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
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
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body).slice(0, 100));

    const { subjects, durationWeeks, hoursPerDay, goal, hardestSubject, learningPath, userId } = body;
    const API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY or LOVABLE_API_KEY is not configured");
    }

    // Build resource guidance based on learning path
    let resourceGuidance = "";
    if (learningPath === "Video") {
      resourceGuidance = `
LEARNING PATH: Video-based learning
- Prioritize video resources (YouTube, Coursera, Udemy, Khan Academy videos, MIT OCW lectures)
- Include mostly video tutorials, recorded lectures, and visual demonstrations
- Limit text-based resources to supplementary materials only`;
    } else if (learningPath === "Article") {
      resourceGuidance = `
LEARNING PATH: Article/Text-based learning
- Prioritize written resources (articles, blog posts, documentation, textbooks, PDFs)
- Include mostly reading materials, written tutorials, and reference pages
- Limit video resources to supplementary materials only`;
    } else if (learningPath === "Question & Practice") {
      resourceGuidance = `
LEARNING PATH: Practice-based learning
- Prioritize practice resources (problem sets, coding challenges, quiz platforms, exercise websites)
- Include mostly interactive practice sites (LeetCode, HackerRank, practice workbooks, problem banks)
- Focus on hands-on application and problem-solving resources`;
    } else if (learningPath === "Mixed") {
      resourceGuidance = `
LEARNING PATH: Mixed/Balanced learning
- Provide a balanced mix of ALL resource types
- Include videos, articles, AND practice resources for each module
- This should give the BEST overall resources regardless of format`;
    }

    // Build the prompt for curriculum generation
    const prompt = `You are an expert curriculum designer. Create a detailed, personalized ${durationWeeks}-week study curriculum for a student with the following requirements:

Subjects: ${subjects.join(", ")}
Study Time: ${hoursPerDay} hours per day
Academic Goal: ${goal || "General mastery"}
${hardestSubject ? `Hardest Subject (needs extra focus): ${hardestSubject}` : ""}
${resourceGuidance}

CRITICAL INSTRUCTIONS:
1. Create exactly ${durationWeeks} weekly modules
2. Distribute subjects evenly across the weeks
3. Include progressive learning - start with fundamentals, build to advanced topics
4. For each week, provide:
   - Week number
   - Subject focus
   - Specific topic title
   - 3-5 clear learning outcomes
   - 3-5 practical activities (exercises, readings, practice problems)
   - 3-5 specific resources with ACTUAL WORKING URLs (mix of free and paid)

RESOURCE REQUIREMENTS:
- Each resource must be a JSON object with "title", "url", and "type" (free/paid)
- Include real, working URLs to actual educational resources
- Mix free resources (Khan Academy, MIT OpenCourseWare, YouTube, etc.) with paid options (Udemy, Coursera, textbooks)
- For textbooks, include Amazon or publisher links
- Ensure all URLs are valid and currently accessible

${hardestSubject ? `Give extra attention and more practice activities for ${hardestSubject}.` : ""}

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "planId": "unique-id-string",
  "duration_weeks": ${durationWeeks},
  "modules": [
    {
      "week": 1,
      "subject": "Subject Name",
      "title": "Specific Topic Title",
      "learning_outcomes": ["outcome 1", "outcome 2", "outcome 3"],
      "activities": ["activity 1", "activity 2", "activity 3"],
      "resources": [
        {
          "title": "Resource Name",
          "url": "https://actual-url.com",
          "type": "free"
        },
        {
          "title": "Paid Course Name",
          "url": "https://actual-url.com",
          "type": "paid"
        }
      ]
    }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
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

    const aiResponseText = data.candidates[0].content.parts[0].text;
    console.log("AI response received");


    // Parse the JSON
    let curriculum;
    try {
      // Clean up the response - remove markdown code blocks if present
      const rawJson = aiResponseText.replace(/```json\n?|\n?```/g, "").trim();
      curriculum = JSON.parse(rawJson);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Attempted to parse:", aiResponseText);
      throw new Error("Failed to parse curriculum JSON");
    }

    // Ensure planId exists
    if (!curriculum.planId) {
      curriculum.planId = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add learning path to curriculum
    curriculum.learningPath = learningPath;

    console.log("Successfully generated curriculum");

    // Enhance with real YouTube videos if learning path is Video or Mixed
    if (learningPath === "Video" || learningPath === "Mixed") {
      console.log(`Enhancing curriculum with YouTube videos (path: ${learningPath})`);

      for (const module of curriculum.modules) {
        // Construct search query from subject and module title
        const query = `${subjects.join(" ")} ${module.title} tutorial`;
        const youtubeVideos = await fetchYouTubeVideos(query, 3);

        if (youtubeVideos.length > 0) {
          if (learningPath === "Video") {
            // Replace all resources with YouTube videos for Video path
            module.resources = youtubeVideos;
          } else if (learningPath === "Mixed") {
            // Combine YouTube videos with existing resources for Mixed path
            // Keep 2 AI-generated resources and add YouTube videos
            const existingResources = module.resources?.slice(0, 2) || [];
            module.resources = [...youtubeVideos, ...existingResources];
          }
        }
      }

      console.log("YouTube enhancement complete");
    }

    // Save curriculum to database if userId is provided
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);

          await supabase
            .from("curriculums")
            .insert({
              user_id: userId,
              plan_id: curriculum.planId,
              title: `${subjects.join(", ")} - ${durationWeeks} weeks`,
              subjects: subjects,
              goal: goal || "General mastery",
              duration_weeks: durationWeeks,
              modules: curriculum.modules
            });

          console.log("Curriculum saved to database");
        }
      } catch (dbError) {
        console.error("Error saving curriculum to database:", dbError);
        // Don't fail the request if DB save fails
      }
    }

    return new Response(JSON.stringify(curriculum), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-curriculum:", error);
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