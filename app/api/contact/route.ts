import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from "nodemailer";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_USER = process.env.MAIL_USER;
const MAIL_APP_PASSWORD = process.env.MAIL_APP_PASSWORD;

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
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: MAIL_USER,
      pass: MAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `Soulasia Contacts`,
      replyTo: 'no-reply@gmail.com',
      to: "aziz_khakimov@yahoo.com",
      subject: "New Contact",
      text: `New Contact from Soulasia For-Owners <br/><br/>Name: ${body.name}<br/>Phone: ${body.phone}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err }, { status: 500 });
  }

}
