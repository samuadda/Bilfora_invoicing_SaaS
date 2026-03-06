import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = Deno.env.get("RESEND_TO_EMAIL") || "BILFORAINVOICE@GMAIL.COM";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, message } = await req.json();

    if (!message) {
      throw new Error("Message is required");
    }

    if (!RESEND_API_KEY) {
      throw new Error("Resend API Key is missing");
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Bilfora Feedback <onboarding@resend.dev>',
        to: [TO_EMAIL],
        subject: `[Bilfora Feedback] New feedback from ${name || 'A User'}`,
        html: `
          <h2>New Feedback Submission</h2>
          <p><strong>Name:</strong> ${name || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <h3>Message:</h3>
          <p style="white-space: pre-wrap; font-family: sans-serif; direction: rtl; text-align: right;">${message}</p>
        `,
      }),
    });

    const data = await res.json();
    
    if (res.ok) {
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } else {
        return new Response(JSON.stringify({ error: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Returning 200 so Supabase JS client doesn't mask the error body
        });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Returning 200 so Supabase JS client doesn't mask the error body
    });
  }
});
