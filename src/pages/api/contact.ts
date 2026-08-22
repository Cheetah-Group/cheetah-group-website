export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const name = data.get('name')?.toString();
    const email = data.get('email')?.toString();
    const phone = data.get('phone')?.toString();
    const subject = data.get('subject')?.toString();
    const message = data.get('message')?.toString();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ message: 'Name, email, and message are required.' }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.GMAIL_USER,
        pass: import.meta.env.GMAIL_APP_PASS,
      },
    });

    await transporter.sendMail({
      from: import.meta.env.GMAIL_USER,
      to: import.meta.env.GMAIL_USER,
      replyTo: email,
      subject: `[Website Contact] ${subject || 'New Inquiry'} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
    });

    return new Response(JSON.stringify({ message: 'Inquiry sent successfully!' }), { status: 200 });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    return new Response(JSON.stringify({ message: 'Failed to send message.' }), { status: 500 });
  }
};