import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = Deno.env.get("RESEND_TO_EMAIL") || "saddiq0musa@gmail.com";

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
    const { name, email, message, uiRating, likedMost, hatedMost, missingFeatures } = await req.json();

    if (!message && !uiRating && !likedMost && !hatedMost && !missingFeatures) {
      throw new Error("Feedback payload is empty");
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
          <div style="font-family: sans-serif; direction: rtl; text-align: right;">
            <h2>تقييم جديد</h2>
            <p><strong>الاسم:</strong> ${name || 'غير معروف'}</p>
            <p><strong>البريد الإلكتروني:</strong> ${email || 'غير معروف'}</p>
            <hr />
            <p><strong>تقييم الواجهة:</strong> ${uiRating ? `${uiRating} / 5` : 'لم يتم التقييم'}</p>
            
            <h3>أكثر شيء أعجبه:</h3>
            <p style="white-space: pre-wrap;">${likedMost || 'لا يوجد'}</p>

            <h3>أكثر شيء أزعجه:</h3>
            <p style="white-space: pre-wrap;">${hatedMost || 'لا يوجد'}</p>

            <h3>ميزات مفقودة (تمنى وجودها):</h3>
            <p style="white-space: pre-wrap;">${missingFeatures || 'لا يوجد'}</p>

            <h3>رسالة إضافية (اختياري):</h3>
            <p style="white-space: pre-wrap;">${message || 'لا يوجد'}</p>
          </div>
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
