const axios = require('axios'); 
// Asegúrate de que la ruta es correcta según tu estructura de carpetas
const contacts = require('../contactos_kuskas/contactos.json');

// --- CONFIGURACIÓN DEL SORTEO ---
const CONFIG = {
    apiUrl: 'http://localhost:3000/sorteo',
    title: 'Amigo Invisible KUS KAS 2025',
    budget: '20 Euros',
    date: '25 de Diciembre',
    dryRun: true // <--- TRUE = Simula / FALSE = Envía correos reales
};

// --- SELECCIÓN DE JUGADORES (Interruptores) ---
// true  = Juega
// false = No juega este año
const PLAYERS_SELECTION = {
    "asier_emaldi": true,
    "ferrero":      true,
    "denis":        true,
    "marti":        true,
    "bofe":         true,
    "iturbe":       true,
    "garci":        true,
    "dalmau":       true,
    "ojan":         true,
    "sagredo":      true,
    "iker":         true,
    "siti":         true,
    "inaki":        true,
    "sarri":        true,
    "alai":         true,
    "arri":         true,
    "peio":         true,
    "legorburu":    true,
    "jongo":        true,
    "duenas":       true,
    "etxe":         true,
    "eder":         true,
    "imanol":       true,
    "xerpa":        true,
    "segovia":      true,
    "lobato":       true,
    "amor":         true,
    "piti":         true,
    "julenr":       true
};

// --- LÓGICA DEL SCRIPT ---
async function runSorteo() {
    console.log(`🚀 Iniciando sorteo: ${CONFIG.title}`);
    console.log(`🔧 Modo: ${CONFIG.dryRun ? 'SIMULACRO (No envía)' : 'PRODUCCIÓN (Envía reales)'}`);
    
    // 1. Filtrar participantes basándonos en los interruptores (true)
    const participants = contacts
        .filter(contact => {
            // Verificamos si el ID está en la lista Y si es true
            const isSelected = PLAYERS_SELECTION[contact.id] === true;
            
            // Opcional: Avisar si hay un ID en el JSON que no está en la lista de selección
            if (PLAYERS_SELECTION[contact.id] === undefined) {
                console.warn(`⚠️  Aviso: El contacto '${contact.id}' existe en el JSON pero no está en la lista de selección.`);
            }
            
            return isSelected;
        })
        .map(p => ({
            name: p.nickname, // Usamos el Mote
            email: p.email,
            photo: p.photo
        }));

    console.log(`👥 Participantes seleccionados: ${participants.length}`);

    // Validación de seguridad
    if (participants.length < 2) {
        console.error("❌ Error: Necesitas al menos 2 participantes activos (true).");
        return;
    }

    // 2. Preparar payload
    const payload = {
        title: CONFIG.title,
        budget: CONFIG.budget,
        date: CONFIG.date,
        dryRun: CONFIG.dryRun,
        participants: participants
    };

    // 3. Enviar a la API
    try {
        console.log("📨 Enviando petición a la API...");
        const response = await axios.post(CONFIG.apiUrl, payload);
        
        // Mostramos un resumen limpio
        console.log("\n✅ RESPUESTA DEL SERVIDOR:");
        console.log(`   Estado: ${response.data.ok ? 'OK' : 'Error'}`);
        console.log(`   Mensaje: ${response.data.message}`);
        
        if (response.data.matches_count) {
            console.log(`   Parejas generadas: ${response.data.matches_count}`);
        }

        if(CONFIG.dryRun) {
            console.log("\n---------------------------------------------------");
            console.log("⚠️  ATENCIÓN: Esto ha sido un DRY RUN.");
            console.log("   Nadie ha recibido correos.");
            console.log("   Ve a la terminal de Docker para ver la vista previa.");
            console.log("---------------------------------------------------");
        } else {
            console.log("\n🎉 ¡PROCESO COMPLETADO! Correos enviados.");
        }

    } catch (error) {
        console.error("\n❌ Ocurrió un error:");
        if (error.response) {
            // El servidor respondió con un código de error (ej: 400, 500)
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Razón: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            // No hubo respuesta del servidor
            console.error("   No se recibió respuesta del servidor. ¿Está Docker encendido?");
        } else {
            // Error al configurar la petición
            console.error(`   Error: ${error.message}`);
        }
    }
}

runSorteo();