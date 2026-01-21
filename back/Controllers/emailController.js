const nodemailer = require('nodemailer');

exports.sendEmail = async (req, res) => {
    try {
      const { to, subject, text, html } = req.body;
  
      // 1. Configuration du transporteur
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });
  
      // 2. Options de l'email (ajoutez le support HTML)
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text, // version texte pour les clients mail basiques
        html // version HTML riche
      };
  
      // 3. Envoi de l'email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  };