require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// --- IMPORTAR TUS MÓDULOS EXISTENTES ---
// Asegúrate de que estos archivos existen o ajusta la ruta
const { generateMatches } = require('./matcher');
const { getHtmlTemplate } = require('./emailTemplate_kuskas');
const { sendEmail } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración
const DATA_FILE = path.join('data', 'contacts.json');
console.log(`Usando archivo de datos: ${DATA_FILE}`);
// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Servirá el HTML en la carpeta 'public'

// --- FUNCIONES AUXILIARES PARA EL JSON ---

// Leer contactos del disco
// Leer contactos del disco
const getContacts = () => {
    try {
        console.log(`📂 Intentando leer archivo: ${DATA_FILE}`);
        
        if (!fs.existsSync(DATA_FILE)) {
            console.warn("⚠️ El archivo no existe. Devolviendo array vacío.");
            return [];
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');
        
        // LOG DE DEBUG: Ver qué hemos leído exactamente
        console.log(`📄 Contenido raw (primeros 50 chars): ${data.substring(0, 50)}...`);

        if (!data) {
            console.warn("⚠️ El archivo está vacío.");
            return [];
        }

        const parsedData = JSON.parse(data);

        // LOG DE DEBUG: Ver qué tipo de dato es
        console.log(`🧩 Tipo de dato parseado: ${typeof parsedData}`);
        console.log(`❓ ¿Es Array directo?: ${Array.isArray(parsedData)}`);

        // CASO 1: Es la estructura { "contacts": [...] }
        if (parsedData.contacts && Array.isArray(parsedData.contacts)) {
            console.log(`✅ Estructura {contacts: [...]} detectada. Extrayendo ${parsedData.contacts.length} elementos.`);
            return parsedData.contacts; // <--- AQUÍ ESTÁ LA SOLUCIÓN
        }

        // CASO 2: Es un Array directo [...]
        if (Array.isArray(parsedData)) {
            console.log(`✅ Estructura Array directa detectada.`);
            return parsedData;
        }

        console.error("❌ El JSON no tiene formato válido (ni array ni objeto con propiedad contacts).");
        return [];

    } catch (error) {
        console.error("❌ Error CRÍTICO leyendo contactos:", error);
        return [];
    }
};
// Guardar contactos en el disco
const saveContacts = (contacts) => {

    let addAttr = cts => `{"contacts":${JSON.stringify(cts, null, 4)}}`
    
    try {
        fs.writeFileSync(DATA_FILE, addAttr(contacts));
        return true;
    } catch (error) {
        console.error("Error guardando contactos:", error);
        return false;
    }
};

// --- API ENDPOINTS ---

// 1. Obtener todos los contactos
app.get('/api/contacts', (req, res) => {
    const contacts = getContacts();
    res.json(contacts);
});

// 2. Actualizar la lista de contactos (Añadir, Editar, Borrar, Cambiar estado)
app.post('/api/contacts', (req, res) => {
    const newContacts = req.body;
    if (!Array.isArray(newContacts)) {
        return res.status(400).json({ error: 'Formato inválido' });
    }
    
    if (saveContacts(newContacts)) {
        res.json({ ok: true, message: 'Lista de contactos actualizada' });
    } else {
        res.status(500).json({ error: 'No se pudo guardar en el disco' });
    }
});

// 3. Ejecutar el Sorteo (Lógica unificada)
app.post('/api/sorteo', async (req, res) => {
    try {
        // Recibimos la configuración desde el Frontend
        const { title, budget, date, dryRun } = req.body;
        
        // Leemos los contactos actuales
        const allContacts = getContacts();
        console.log(`📋 Total contactos en el sistema: ${allContacts}`);
        // Filtramos solo los que están marcados como "active" (juegan)
        // Nota: Añadiremos la propiedad 'active' en el frontend y JSON
        const participants = allContacts.filter(c => c.active === true).map(p => ({
            name: p.nickname,
            email: p.email,
            photo: p.photo
        }));

        console.log(`🚀 Iniciando Sorteo: ${title}`);
        console.log(`👥 Participantes activos: ${participants.length}`);
        console.log(`🔧 Modo: ${dryRun ? 'DRY RUN (Simulacro)' : 'PRODUCCIÓN (Envíos reales)'}`);

        // Validaciones
        if (participants.length < 2) {
            return res.status(400).json({ error: 'Se necesitan al menos 2 participantes activos.' });
        }

        // Generar parejas
        const matches = generateMatches(participants);
        
        // Logs para el frontend
        let logs = [];
        logs.push(`✅ Se han generado ${matches.length} parejas.`);

        // Enviar correos
        const emailPromises = matches.map(match => {
            const { giver, receiver } = match;
            
            const htmlContent = getHtmlTemplate(giver.name, receiver.name, receiver.photo, title, budget, date);
            const textContent = `Hola ${giver.name}, tu amigo invisible es ${receiver.name}.`;

            // Simulamos o enviamos
            return sendEmail({
                to: giver.email,
                subject: `${giver.name}, Tu Amigo Invisible: ${title}`,
                html: htmlContent,
                text: textContent,
                isDryRun: dryRun
            }).then(() => {
                const status = dryRun ? '[SIMULADO]' : '[ENVIADO]';
                logs.push(`${status} Correo para ${giver.name} -> Le toca a: ${receiver.name}`);
            }).catch(e => {
                logs.push(`❌ ERROR enviando a ${giver.name}: ${e.message}`);
                throw e; // Re-lanzar para que Promise.all lo detecte si queremos parar, o manejarlo
            });
        });

        await Promise.allSettled(emailPromises);

        return res.json({ 
            ok: true, 
            message: dryRun ? 'Simulacro finalizado' : 'Correos enviados',
            logs: logs
        });

    } catch (err) {
        console.error('Error crítico:', err);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n---------------------------------------------------`);
    console.log(`🎁 AMIGO INVISIBLE APP`);
    console.log(`🌐 Abre tu navegador en: http://localhost:${PORT}`);
    console.log(`---------------------------------------------------\n`);
});