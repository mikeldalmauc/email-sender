require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

// Importamos nuestros módulos
const { generateMatches } = require('./matcher');
// const { getHtmlTemplate } = require('./emailTemplate');
const { getHtmlTemplate } = require('./emailTemplate_kuskas');
const { sendEmail } = require('./mailer');

const app = express();
app.use(bodyParser.json());

app.post('/sorteo', async (req, res) => {
    try {
        const { participants, budget, date, title, dryRun } = req.body;

        // 1. Validaciones
        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return res.status(400).json({ error: 'Se necesitan al menos 2 participantes.' });
        }

        // 2. Generar parejas (Lógica)
        const matches = generateMatches(participants);
        console.log(`Sorteo generado para ${matches.length} personas.`);

        // 3. Preparar envíos (Orquestación)
        const emailPromises = matches.map(match => {
            const { giver, receiver } = match;
            
            // Generar HTML
            const htmlContent = getHtmlTemplate(giver.name, receiver.name, title, budget, date);
            const textContent = `Hola ${giver.name}, tu amigo invisible es ${receiver.name}.`;

            // Enviar (o simular si dryRun es true)
            return sendEmail({
                to: giver.email,
                subject: ` ${giver.name}, Tu Amigo Invisible: ${title}`,
                html: htmlContent,
                text: textContent,
                isDryRun: dryRun // Pasamos el flag
            });
        });

        // 4. Esperar resultados
        await Promise.all(emailPromises);

        return res.json({ 
            ok: true, 
            message: dryRun ? 'Simulacro completado (Ver logs)' : 'Correos enviados correctamente',
            matches_count: matches.length,
            mode: dryRun ? 'development/dry-run' : 'production'
        });

    } catch (err) {
        console.error('Error en el proceso:', err);
        return res.status(500).json({ error: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API modular escuchando en http://0.0.0.0:${port}`));