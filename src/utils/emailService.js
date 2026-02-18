const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options) {
    const mailOptions = {
      from: `MAKDEVS <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    return await this.transporter.sendMail(mailOptions);
  }

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

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission - MAKDEVS',
      html
    });
  }

  async sendContactAutoReply(contact) {
    const html = `
      <h2>Thank you for contacting MAKDEVS!</h2>
      <p>Dear ${contact.name},</p>
      <p>Thank you for reaching out to us. We have received your inquiry and will get back to you within 24 hours.</p>
      <p>Here's a copy of your message:</p>
      <p><strong>Project Type:</strong> ${contact.projectType}</p>
      <p><strong>Message:</strong> ${contact.message}</p>
      <br>
      <p>Best regards,</p>
      <p>The MAKDEVS Team</p>
    `;

    return this.sendEmail({
      to: contact.email,
      subject: 'Thank you for contacting MAKDEVS',
      html
    });
  }

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

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Idea Submission - MAKDEVS',
      html
    });
  }

  async sendIdeaConfirmation(idea) {
    const html = `
      <h2>Thank you for sharing your idea with MAKDEVS!</h2>
      <p>Dear ${idea.name},</p>
      <p>Thank you for submitting your innovative idea. We have received it and our team will review it shortly.</p>
      <p>Here's a copy of your submission:</p>
      <p><strong>Idea Title:</strong> ${idea.ideaTitle}</p>
      <p><strong>Industry:</strong> ${idea.industry}</p>
      <p><strong>Description:</strong> ${idea.ideaDescription}</p>
      <br>
      <p>Best regards,</p>
      <p>The MAKDEVS Team</p>
    `;

    return this.sendEmail({
      to: idea.email,
      subject: 'Your idea has been received - MAKDEVS',
      html
    });
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
      <p>Best regards,</p>
      <p>The MAKDEVS Team</p>
    `;

    return this.sendEmail({
      to: idea.email,
      subject: `Idea ${idea.status} - MAKDEVS`,
      html
    });
  }
}

module.exports = new EmailService();