// src/services/mailer.js
const nodemailer = require('nodemailer');

// Configuración del transporte
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT == '465',
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    } : undefined
});

/**
 * Función unificada para enviar correos o simularlos
 */
async function sendEmail({ to, subject, html, text, isDryRun }) {
    
    // --- MODO DESARROLLO / SIMULACRO ---
    if (isDryRun) {
        console.log(`[DRY RUN - NO EMAIL SENT]`);
        console.log(`-------------------------`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Text: ${text}`);
        console.log(`HTML Preview: ${html.substring(0, 100)}...`);
        console.log(`-------------------------\n`);
        return { messageId: 'mock-id-12345', accepted: [to] }; // Retorno falso simulando éxito
    }

    // --- MODO PRODUCCIÓN (ENVÍO REAL) ---
    return transporter.sendMail({
        from: process.env.SENDER || 'no-reply@example.com',
        to,
        subject,
        html,
        text,
        headers: {
            'X-SES-CONFIGURATION-SET': 'lagunizkutu' // Tu config set de AWS
        }
    });
}

module.exports = { sendEmail };