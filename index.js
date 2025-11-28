require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());


// Transportador configurable via .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT == '465', // true para 465, false para STARTTLS
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    } : undefined
});


app.post('/send', async (req, res) => {
    try {
        const { to, subject, body, from } = req.body;
        if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject y body son obligatorios' });


        const info = await transporter.sendMail({
            from: from || process.env.SENDER || 'no-reply@example.com',
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            text: body
        });


        return res.json({ ok: true, messageId: info.messageId });
    } catch (err) {
        console.error('send error', err);
        return res.status(500).json({ error: err.message });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Mailer API escuchando en http://0.0.0.0:${port}`));