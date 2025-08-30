const nodemailer = require('nodemailer');
const xss = require('xss');

function sanitize(input, maxLen = 1000) {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim().slice(0, maxLen);
  return xss(trimmed, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script'] });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isLikelyPhone(phone) {
  return /^[0-9\-\+\(\)\s]{7,20}$/.test(phone);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Simple honeypot for bots
    if (data.company && String(data.company).trim() !== '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: 'Bot detected.' }),
      };
    }

    const email = sanitize(data.email, 200);
    const name = sanitize(data.name, 200);
    const phone = sanitize(data.phone, 50);
    const message = sanitize(data.message, 5000);

    // Validate required fields
    if (!email || !name || !phone || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: 'All fields are required.' }),
      };
    }
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: 'Please enter a valid email address.' }),
      };
    }
    if (!isLikelyPhone(phone)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: 'Please enter a valid phone number.' }),
      };
    }

    // Configure transporter
    let transporter;
    let fromAddress;
    let testMode = false;
    let testAccount;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      fromAddress = process.env.SMTP_USER;
    } else {
      // fallback to test account for development
      testMode = true;
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      fromAddress = testAccount.user;
    }

    const now = new Date().toISOString();
    const siteName = process.env.SITE_NAME || 'Website';
    const toEmail = process.env.TO_EMAIL || fromAddress;

    const mailOptions = {
      from: {
        name: `${siteName} Contact`,
        address: fromAddress,
      },
      to: toEmail,
      replyTo: { name, address: email },
      subject: `New contact form submission — ${siteName}`,
      text: `You have a new message from the contact form.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}\n\n---\nReceived at: ${now}`,
      html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6"><h2>New contact form submission — ${siteName}</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p><hr><small>Received at: ${now}</small></div>`,
    };

    const info = await transporter.sendMail(mailOptions);

    let previewUrl = null;
    if (testMode) {
      previewUrl = nodemailer.getTestMessageUrl(info);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: 'Thanks! Your message has been sent.', preview: previewUrl }),
    };
  } catch (err) {
    console.error('Error sending mail', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: 'Sorry, something went wrong.' }),
    };
  }
};
