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
    // Clonamos para no mutar el original
    let givers = [...participants];
    let receivers = [...participants];
    let isValid = false;
    let attempts = 0;

    // Intentamos mezclar hasta que nadie coincida (con límite de seguridad)
    while (!isValid && attempts < 100) {
        shuffle(receivers);
        isValid = givers.every((giver, index) => giver.email !== receivers[index].email);
        attempts++;
    }

    if (!isValid) throw new Error("No se pudo generar una combinación válida (posiblemente muy pocos participantes).");

    return givers.map((giver, index) => ({
        giver: giver,
        receiver: receivers[index]
    }));
}

module.exports = { generateMatches };