import { serve } from "serve"
import { createClient } from "@supabase/supabase-js"
import { SMTPClient } from "denomailer"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min expiry

    // Save OTP to DB
    const { error: dbError } = await supabaseAdmin
      .from('password_reset_otps')
      .insert({ email, otp, expires_at: expiresAt.toISOString() })

    if (dbError) {
      console.error('DB error:', dbError)
      return new Response(JSON.stringify({ error: 'Failed to save OTP' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send email via Gmail SMTP
    const gmailUser = Deno.env.get('GMAIL_SMTP_USER') ?? ''
    const gmailAppPassword = Deno.env.get('GMAIL_SMTP_APP_PASSWORD') ?? ''

    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailAppPassword,
        },
      },
    })

    try {
      await client.send({
        from: `Doc Rob Fitness <${gmailUser}>`,
        to: email,
        subject: 'Your Password Reset Code',
        html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
      })
    } catch (mailErr) {
      console.error('Gmail SMTP error:', mailErr)
      return new Response(JSON.stringify({ error: 'Failed to send email', details: String(mailErr) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } finally {
      await client.close()
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})