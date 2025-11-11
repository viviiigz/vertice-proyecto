// archivo: controllers/publicController.js

/**
 * Devuelve la lista fija de puntos de retiro públicos.
 * Esta ruta es para que la use el CONSUMIDOR al hacer el pedido.
 */
export const getPuntosDeRetiro = (req, res) => {
    try {
        const puntosFijos = [
            { id: 'plaza_san_martin', nombre: 'Plaza San Martín (Centro)' },
            { id: 'virgen_desatanudos', nombre: 'Virgen Desatanudos (Circuito 5)' },
            { id: 'la_cruz', nombre: 'La Cruz (Costanera)' }
            // Agrega más puntos fijos aquí si lo necesitas
        ];
        
        res.status(200).json(puntosFijos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los puntos de retiro' });
    }
};