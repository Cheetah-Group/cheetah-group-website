export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const phone = data.get('phone')?.toString().trim();
    const subject = data.get('subject')?.toString().trim();
    const message = data.get('message')?.toString().trim();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          message: 'Name, email, and message are required.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Environment variables
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      CONTACT_EMAIL,
      CC_CHAND_EMAIL,
      CC_CHETHAN_EMAIL,
      CC_HARISH_EMAIL,
      COMPANY_NAME,
    } = import.meta.env;

    // Check email configuration
    if (
      !SMTP_HOST ||
      !SMTP_PORT ||
      !SMTP_USER ||
      !SMTP_PASS ||
      !CONTACT_EMAIL
    ) {
      console.error('Missing SMTP environment variables.');

      return new Response(
        JSON.stringify({
          message: 'Email service is not configured correctly.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create GoDaddy SMTP transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Verify SMTP connection
    await transporter.verify();

    // --------------------------------------------------
    // 1. Send inquiry to Cheetah Group
    // --------------------------------------------------

    await transporter.sendMail({
      from: `"${COMPANY_NAME || 'Cheetah Group'} Website" <${SMTP_USER}>`,

      to: CONTACT_EMAIL,

      cc: [
        CC_CHAND_EMAIL,
        CC_CHETHAN_EMAIL,
        CC_HARISH_EMAIL,
      ].filter(Boolean),

      // When you click Reply, it will reply directly to the visitor
      replyTo: email,

      subject: `[Website Contact] ${
        subject || 'New Inquiry'
      } from ${name}`,

      text: `
New Website Inquiry
===================

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Subject: ${subject || 'New Inquiry'}

Message:
${message}

===================
Submitted through Cheetah Group website.
      `.trim(),
    });

    // --------------------------------------------------
    // 2. Send confirmation email to the visitor
    // --------------------------------------------------

    await transporter.sendMail({
      from: `"${COMPANY_NAME || 'Cheetah Group'}" <${SMTP_USER}>`,

      to: email,

      subject: 'We received your inquiry - Cheetah Group',

      text: `
Dear ${name},

Thank you for contacting ${COMPANY_NAME || 'Cheetah Group'}.

We have successfully received your inquiry.

Our team will review your message and get back to you as soon as possible.

Your submitted information
==========================

Name: ${name}
Email: ${email}
Phone: ${phone || 'N/A'}
Subject: ${subject || 'New Inquiry'}

Message:
${message}

==========================

Thank you for contacting us.

Regards,
${COMPANY_NAME || 'Cheetah Group'}
      `.trim(),
    });

    // Success response
    return new Response(
      JSON.stringify({
        message:
          'Your inquiry has been sent successfully. A confirmation email has been sent to your email address.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Nodemailer Error:', error);

    return new Response(
      JSON.stringify({
        message:
          'Failed to send your inquiry. Please try again later.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};