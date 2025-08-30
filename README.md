# Contact Form on Netlify

This repository contains a simple contact form that sends submissions via email using a serverless function on Netlify. The frontend is a static HTML form with a modern design, and the backend is a Netlify Function written in Node.js using Nodemailer.

## Features

- Collects **Email**, **Name**, **Phone**, and **Message** fields.
- Validates input on the server for required fields, email format, and basic phone number format.
- Sanitizes input to help protect against XSS attacks.
- Sends the form data as an email to a configured address via SMTP.
- Includes an example `.env` file with all required environment variables.
- Uses only serverless functions; no separate server or Express app is needed on Netlify.
- Lightweight front‑end with progressive enhancement: works without JavaScript but uses AJAX when available.

## Local development

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Serci24/contact-form-netlify.git
   cd contact-form-netlify
   npm install
   ```

2. Copy the `.env.example` file to `.env` and fill in your SMTP credentials and destination email:

   ```bash
   cp .env.example .env
   # Then edit .env in your editor and set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, etc.
   ```

3. Install the Netlify CLI globally if you don’t have it:

   ```bash
   npm install -g netlify-cli
   ```

4. Run a local development server:

   ```bash
   netlify dev
   ```

   The site will be available at `http://localhost:8888`. Submissions will use your local environment variables to send emails through the function.

## Deploy to Netlify

To deploy the site to Netlify:

1. Push this repository to your own Git provider (GitHub, GitLab, etc.).
2. Create a new site at [Netlify](https://app.netlify.com/) and link it to your repository.
3. In the Netlify dashboard, add the required environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `TO_EMAIL`, and optionally `SITE_NAME`) under **Site settings > Environment variables**.
4. Trigger a deploy. Netlify will automatically detect the `netlify` folder and set up the function.
5. After deployment, visit your site and submit the form to test email delivery.

## Tips

- If you are testing and don’t want to send real emails, you can leave the SMTP variables undefined. In this case, the function uses a test account from [Ethereal Email](https://ethereal.email/) and logs a URL for viewing the message in the Netlify Functions logs.
- For production deployments, configure SPF and DKIM records on your domain to improve deliverability.
- If you encounter issues with sending email, check the function logs in Netlify (`Functions > contact`), and verify that your environment variables are correct.

Feel free to adapt the form and function to suit your needs!
