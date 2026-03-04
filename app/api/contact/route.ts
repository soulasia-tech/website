import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resendKey = process.env.RESEND_API_KEY;

export async function POST(req: Request) {
  const body = await req.json()

  const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: body.name,
          phone: body.phone,
          message: body.message,
        },
      ])

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  try {
    await sendEmail(body)
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error)
  }

  return NextResponse.json({ data, success: true })
}

async function sendEmail(body: { name: string; phone: string; message?: string }) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "kongratbayevn@gmail.com",
      to: "aziz_khakimov@yahoo.com",
      subject: "New Contact",
      html: `<p>Name: ${body.name} <br/> - Phone: ${body.phone}</p>`
    })
  })

  return {status: "ok"}
}
