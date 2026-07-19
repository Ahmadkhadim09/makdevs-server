const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const DEFAULT_EMAIL = 'service@makdev.online';

class EmailService {
  constructor() {
    // Resend client (HTTP API - works from Render, no SMTP port blocking)
    this.resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

    // Keep a nodemailer transporter for /api/health verify() compatibility
    // This will show the SMTP status but actual sending goes via Resend
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  get adminEmail() {
    return process.env.ADMIN_EMAIL || DEFAULT_EMAIL;
  }

  get fromEmail() {
    return process.env.EMAIL_FROM || DEFAULT_EMAIL;
  }

  get fromName() {
    return 'MAKDEVS';
  }

  async sendEmail(options) {
    // If RESEND_API_KEY is set, use Resend (works on Render)
    if (this.resend) {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });

      if (error) {
        throw new Error(`Resend error: ${error.message}`);
      }

      return data;
    }

    // Fallback to nodemailer SMTP (may not work on Render free tier)
    const mailOptions = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    return await this.transporter.sendMail(mailOptions);
  }

  // ─── Contact ───────────────────────────────────────────────────────────────

  async sendContactNotification(contact) {
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Company:</strong> ${contact.company || 'N/A'}</p>
      <p><strong>Project Type:</strong> ${contact.projectType}</p>
      <p><strong>Budget:</strong> ${contact.budget || 'N/A'}</p>
      <p><strong>Timeline:</strong> ${contact.timeline || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
    `;
    return this.sendEmail({ to: this.adminEmail, subject: 'New Contact Form Submission - MAKDEVS', html });
  }

  async sendContactAutoReply(contact) {
    const html = `
      <h2>Thank you for contacting MAKDEVS!</h2>
      <p>Dear ${contact.name},</p>
      <p>We have received your inquiry and will get back to you within 24 hours.</p>
      <p><strong>Project Type:</strong> ${contact.projectType}</p>
      <p><strong>Message:</strong> ${contact.message}</p>
      <br>
      <p>Best regards,<br>The MAKDEVS Team</p>
    `;
    return this.sendEmail({ to: contact.email, subject: 'Thank you for contacting MAKDEVS', html });
  }

  // ─── Ideas ─────────────────────────────────────────────────────────────────

  async sendIdeaNotification(idea) {
    const html = `
      <h2>New Idea Submission</h2>
      <p><strong>Name:</strong> ${idea.name}</p>
      <p><strong>Email:</strong> ${idea.email}</p>
      <p><strong>Idea Title:</strong> ${idea.ideaTitle}</p>
      <p><strong>Industry:</strong> ${idea.industry}</p>
      <p><strong>Description:</strong></p>
      <p>${idea.ideaDescription}</p>
    `;
    return this.sendEmail({ to: this.adminEmail, subject: 'New Idea Submission - MAKDEVS', html });
  }

  async sendIdeaConfirmation(idea) {
    const html = `
      <h2>Thank you for sharing your idea with MAKDEVS!</h2>
      <p>Dear ${idea.name},</p>
      <p>We have received your idea and will review it shortly.</p>
      <p><strong>Idea Title:</strong> ${idea.ideaTitle}</p>
      <p><strong>Industry:</strong> ${idea.industry}</p>
      <p><strong>Description:</strong> ${idea.ideaDescription}</p>
      <br>
      <p>Best regards,<br>The MAKDEVS Team</p>
    `;
    return this.sendEmail({ to: idea.email, subject: 'Your idea has been received - MAKDEVS', html });
  }

  async sendIdeaReviewNotification(idea) {
    const statusMessages = {
      approved: 'Your idea has been approved! We will contact you soon to discuss next steps.',
      rejected: 'Thank you for your idea. After careful review, we have decided not to pursue it at this time.',
      implemented: 'Great news! Your idea has been implemented. Thank you for your contribution!'
    };
    const html = `
      <h2>Your Idea Status Update - MAKDEVS</h2>
      <p>Dear ${idea.name},</p>
      <p>${statusMessages[idea.status] || 'Your idea status has been updated.'}</p>
      ${idea.reviewNotes ? `<p><strong>Review Notes:</strong> ${idea.reviewNotes}</p>` : ''}
      <br>
      <p>Best regards,<br>The MAKDEVS Team</p>
    `;
    return this.sendEmail({ to: idea.email, subject: `Idea ${idea.status} - MAKDEVS`, html });
  }
}

module.exports = new EmailService();