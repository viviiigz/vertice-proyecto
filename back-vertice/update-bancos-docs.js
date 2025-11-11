// Script para actualizar la base de datos: añadir .pdf a los documentos de bancos
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from './src/models/user.models.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vertice';

async function updateBancosDocuments() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✓ Conectado a MongoDB');

        // Buscar todos los bancos con documentos sin extensión .pdf
        const bancos = await UserModel.find({
            role: 'banco',
            documentoVerificacion: { $exists: true, $ne: null, $ne: '' }
        });

        console.log(`\n📋 Encontrados ${bancos.length} bancos con documentos`);

        let updated = 0;
        let skipped = 0;

        for (const banco of bancos) {
            const docActual = banco.documentoVerificacion;
            
            // Si ya tiene extensión, saltar
            if (docActual.endsWith('.pdf') || docActual.includes('.')) {
                console.log(`  [SKIP] ${banco.username} - ${docActual} ya tiene extensión`);
                skipped++;
                continue;
            }

            // Añadir .pdf
            const nuevoDoc = docActual + '.pdf';
            
            await UserModel.updateOne(
                { _id: banco._id },
                { $set: { documentoVerificacion: nuevoDoc } }
            );

            console.log(`  [OK] ${banco.username}: ${docActual} → ${nuevoDoc}`);
            updated++;
        }

        console.log('\n📊 Resumen:');
        console.log(`  Actualizados: ${updated}`);
        console.log(`  Omitidos: ${skipped}`);
        console.log('\n✓ Proceso completado');

    } catch (error) {
        console.error(' Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✓ Desconectado de MongoDB');
    }
}

updateBancosDocuments();
