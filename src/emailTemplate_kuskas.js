const getHtmlTemplate = (giverName, receiverName, receiverPhoto, title, budget, date) => {
    // Colores extraídos del logo KUS KAS
    const colors = {
        primaryBlue: '#2C3E50', // Azul oscuro del fondo del logo
        accentOrange: '#F39C12', // Naranja del splash
        accentLime: '#CDDC39',   // Amarillo/Verde del final del splash
        bgBody: '#2C3E50',       // Fondo general del correo
        cardBg: '#ffffff',       // Fondo de la tarjeta
        text: '#333333'
    };

    // URL DE TU LOGO (Sustituye esto por la URL real de tu imagen PNG)
    // He puesto un placeholder, pero debes subir tu logo a internet.
    const logoUrl = "https://mikeldalmau.com/kuskas/logo.png"; 

    // Imagen por defecto si el usuario no tiene foto (un avatar genérico)
    const photoUrl = receiverPhoto || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: ${colors.bgBody}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    
                    <table role="presentation" width="100%" style="max-width: 600px; background-color: ${colors.cardBg}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        
                        <tr>
                            <td style="background-color: ${colors.primaryBlue}; padding: 30px; text-align: center; border-bottom: 4px solid ${colors.accentOrange};">
                                <img src="${logoUrl}" alt="KUS KAS" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
                                <h2 style="color: #ffffff; margin-top: 15px; margin-bottom: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">${title || 'Amigo Invisible'}</h2>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="font-size: 18px; color: ${colors.text}; text-align: center; margin-bottom: 30px;">
                                    ¡Hola <strong>${giverName}</strong>! 👋
                                </p>
                                <p style="font-size: 16px; color: #555; text-align: center; line-height: 1.5;">
                                    El sorteo "Kus Kas" ha hablado. Tu misión secreta, si decides aceptarla, es regalar a...
                                </p>

                                <div style="background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); border: 2px dashed ${colors.accentOrange}; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                                    
                                    <img src="https://mikeldalmau.com/kuskas/${photoUrl}" alt="${receiverName}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid ${colors.accentOrange}; display: block; margin: 0 auto 15px auto;">
                                    
                                    <h1 style="color: ${colors.primaryBlue}; margin: 0; font-size: 28px; font-weight: 800;">${receiverName}</h1>
                                </div>

                                <div style="background-color: #f9f9f9; border-left: 5px solid ${colors.accentLime}; padding: 15px; border-radius: 4px;">
                                    <table width="100%" border="0">
                                        <tr>
                                            <td width="30" style="font-size: 20px;">💰</td>
                                            <td style="color: #555;"><strong>Presupuesto:</strong> ${budget || 'Libre'}</td>
                                        </tr>
                                        <tr>
                                            <td width="30" style="font-size: 20px;">📅</td>
                                            <td style="color: #555;"><strong>Fecha:</strong> ${date || 'A confirmar'}</td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="background-color: #eeeeee; padding: 20px; text-align: center; color: #888; font-size: 12px;">
                                <p style="margin: 0;">Generado por el sistema de sorteos <strong>KUS KAS</strong></p>
                                <p style="margin: 5px 0 0 0;">🤫 Shhh... guarda el secreto.</p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};

module.exports = { getHtmlTemplate };