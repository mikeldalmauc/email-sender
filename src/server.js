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
// Leer contactos del disco// Leer contactos del disco (Versión Blindada)
const getContacts = () => {
    try {
        // 1. Si no existe el archivo, devolvemos array vacío
        if (!fs.existsSync(DATA_FILE)) {
            console.log("⚠️ Archivo no encontrado. Inicializando vacío.");
            return [];
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');

        // 2. Si el archivo está vacío, devolvemos array vacío
        if (!data || data.trim() === '') {
            console.log("⚠️ Archivo vacío.");
            return [];
        }

        const parsed = JSON.parse(data);

        // 3. Verificamos estructura { "contacts": [...] }
        if (parsed.contacts && Array.isArray(parsed.contacts)) {
            return parsed.contacts;
        }

        // 4. Verificamos estructura directa [...]
        if (Array.isArray(parsed)) {
            return parsed;
        }

        // 5. Si es un objeto raro pero no tiene contactos, logueamos y devolvemos vacío
        console.error("❌ Formato JSON desconocido:", parsed);
        return [];

    } catch (error) {
        console.error("❌ Error leyendo/parseando contactos:", error.message);
        // EN CASO DE ERROR, SIEMPRE DEVOLVEMOS ARRAY VACÍO
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

        // --- CAMBIO AQUÍ ---
        // 1. Obtenemos contactos y forzamos un array vacío si falla (|| [])
        const allContacts = getContacts() || []; 
        
        console.log(`📋 Estado de allContacts:`, typeof allContacts, Array.isArray(allContacts) ? `Array(${allContacts.length})` : allContacts);

        // 2. Validación de seguridad extra antes del filter
        if (!Array.isArray(allContacts)) {
            throw new Error("Error interno: La lista de contactos no es válida (no es un array).");
        }
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