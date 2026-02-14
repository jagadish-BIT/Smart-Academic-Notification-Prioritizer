import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailData {
  from: string;
  subject: string;
  body: string;
  receivedAt?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const emailData: EmailData = await req.json();

    const parsedNotification = parseEmailToNotification(emailData);

    const { data, error } = await supabase
      .from("notifications")
      .insert([parsedNotification])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification: data,
        message: "Notification created successfully from email",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process email",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function parseEmailToNotification(emailData: EmailData) {
  const subject = emailData.subject.toLowerCase();
  const body = emailData.body.toLowerCase();
  const fullText = `${subject} ${body}`;

  let category: "Assignment" | "Exam" | "Placement" | "Event" = "Event";
  if (fullText.includes("assignment") || fullText.includes("homework") || fullText.includes("submit")) {
    category = "Assignment";
  } else if (fullText.includes("exam") || fullText.includes("test") || fullText.includes("quiz")) {
    category = "Exam";
  } else if (fullText.includes("placement") || fullText.includes("interview") || fullText.includes("recruitment") || fullText.includes("job")) {
    category = "Placement";
  }

  let priority: "Low" | "Medium" | "High" | "Critical" = "Medium";
  if (fullText.includes("urgent") || fullText.includes("critical") || fullText.includes("important")) {
    priority = "Critical";
  } else if (fullText.includes("high priority") || fullText.includes("asap")) {
    priority = "High";
  } else if (fullText.includes("low priority") || fullText.includes("fyi") || fullText.includes("optional")) {
    priority = "Low";
  }

  let targetGroup: "All" | "CSE" | "IT" | "Final Year" = "All";
  if (fullText.includes("cse") || fullText.includes("computer science")) {
    targetGroup = "CSE";
  } else if (fullText.includes(" it ") || fullText.includes("information technology")) {
    targetGroup = "IT";
  } else if (fullText.includes("final year") || fullText.includes("4th year") || fullText.includes("senior")) {
    targetGroup = "Final Year";
  }

  const deadline = extractDeadline(fullText);

  const title = emailData.subject.length > 100
    ? emailData.subject.substring(0, 97) + "..."
    : emailData.subject;

  const description = extractKeyPoints(emailData.body);

  return {
    title,
    description,
    category,
    priority,
    deadline,
    target_group: targetGroup,
    source: "email" as const,
    email_metadata: {
      from: emailData.from,
      subject: emailData.subject,
      receivedAt: emailData.receivedAt || new Date().toISOString(),
      originalBody: emailData.body.substring(0, 500),
    },
  };
}

function extractDeadline(text: string): string {
  const datePatterns = [
    /deadline[:\s]+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    /due[:\s]+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    /submit by[:\s]+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    /on[:\s]+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1];
      try {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
        }
      } catch (e) {
      }
    }
  }

  const now = new Date();
  now.setDate(now.getDate() + 7);
  return now.toISOString();
}

function extractKeyPoints(body: string): string {
  const lines = body.split('\n').filter(line => line.trim().length > 0);

  const keyPoints: string[] = [];

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (line.length > 10 && line.length < 200) {
      keyPoints.push(line);
    }
  }

  let description = keyPoints.join('\n\n');

  if (description.length > 500) {
    description = description.substring(0, 497) + '...';
  }

  return description || body.substring(0, 500);
}
