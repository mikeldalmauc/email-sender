// src/logic/matcher.js

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function generateMatches(participants) {
    if (participants.length < 2) {
        throw new Error("Se necesitan al menos 2 participantes.");
    }

    // 1. Mezclamos el array original (Pool)
    // Usamos spread [...] para crear una copia y no mutar el input original
    const pool = shuffle([...participants]);

    // 2. Asignamos en cadena (Circular Shift)
    return pool.map((giver, index) => {
        // El receptor es el siguiente en la lista.
        // Si es el último, el receptor es el primero (índice 0).
        const receiverIndex = (index + 1) % pool.length;
        
        return {
            giver: giver,
            receiver: pool[receiverIndex]
        };
    });
}

module.exports = { generateMatches };