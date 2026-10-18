// ============================================================
//  EL SOMBRERO SELECCIONADOR: contenido del test
//  Preguntas, pesos por casa y textos. Todo original (no son las preguntas
//  de ningún test oficial). Cada respuesta suma puntos a una o dos casas:
//  2 a la que más le corresponde y, a veces, 1 a una segunda.
//
//  Las abreviaturas: g = Gryffindor, s = Slytherin, r = Ravenclaw,
//  h = Hufflepuff.
// ============================================================

export const ABREV = { g: 'gryffindor', s: 'slytherin', r: 'ravenclaw', h: 'hufflepuff' };

export const PREGUNTAS = [
    {
        texto: 'Es de noche y oyes un ruido raro en el pasillo del castillo. ¿Qué haces?',
        respuestas: [
            { texto: 'Salgo a ver, con la varita lista.', pesos: { g: 2 } },
            { texto: 'Me quedo quieto y escucho: quiero saber quién es y qué busca.', pesos: { s: 2, r: 1 } },
            { texto: 'Pienso qué cosa puede hacer ese ruido antes de moverme.', pesos: { r: 2 } },
            { texto: 'Despierto a los demás: nadie debería enfrentarlo solo.', pesos: { h: 2, g: 1 } }
        ]
    },
    {
        texto: 'Te regalan un día entero libre, sin obligaciones. ¿Cómo lo gastas?',
        respuestas: [
            { texto: 'En una aventura improvisada, sin plan.', pesos: { g: 2 } },
            { texto: 'En algo que me acerque a una meta que tengo en mente.', pesos: { s: 2 } },
            { texto: 'En la biblioteca, o aprendiendo algo que no sé.', pesos: { r: 2 } },
            { texto: 'Con la gente que quiero, comiendo algo rico.', pesos: { h: 2 } }
        ]
    },
    {
        texto: '¿Qué cosa te molesta más en una persona?',
        respuestas: [
            { texto: 'La cobardía.', pesos: { g: 2 } },
            { texto: 'La mediocridad: conformarse con poco.', pesos: { s: 2 } },
            { texto: 'La ignorancia que no quiere dejar de serlo.', pesos: { r: 2 } },
            { texto: 'La crueldad y la deslealtad.', pesos: { h: 2 } }
        ]
    },
    {
        texto: 'Un amigo te confiesa un secreto que podría meterlo en problemas.',
        respuestas: [
            { texto: 'Lo guardo y, si hace falta, lo defiendo delante de quien sea.', pesos: { g: 2, h: 1 } },
            { texto: 'Lo guardo, y me aseguro de que nadie más se entere nunca.', pesos: { s: 2, h: 1 } },
            { texto: 'Le ayudo a encontrar la mejor manera de arreglarlo.', pesos: { r: 2 } },
            { texto: 'Me quedo a su lado pase lo que pase, sin juzgar.', pesos: { h: 2 } }
        ]
    },
    {
        texto: 'Si pudieras tener solo uno de estos dones, ¿cuál elegirías?',
        respuestas: [
            { texto: 'No sentir miedo nunca.', pesos: { g: 2 } },
            { texto: 'Convencer a cualquiera de lo que quiera.', pesos: { s: 2 } },
            { texto: 'Saber siempre la respuesta correcta.', pesos: { r: 2 } },
            { texto: 'Entender a cualquier criatura, y que ellas me entiendan.', pesos: { h: 2, r: 1 } }
        ]
    },
    {
        texto: 'Frente a un espejo mágico que muestra lo que más deseas, ¿qué ves?',
        respuestas: [
            { texto: 'Una hazaña que todos recordarían.', pesos: { g: 2 } },
            { texto: 'Mi nombre en lo más alto.', pesos: { s: 2 } },
            { texto: 'Todas las respuestas que todavía busco.', pesos: { r: 2 } },
            { texto: 'A mi gente reunida y feliz.', pesos: { h: 2 } }
        ]
    },
    {
        texto: 'En un trabajo en equipo, ¿cuál es tu papel natural?',
        respuestas: [
            { texto: 'Voy primero, abro camino.', pesos: { g: 2 } },
            { texto: 'Armo la estrategia y muevo las piezas.', pesos: { s: 2, r: 1 } },
            { texto: 'Investigo y propongo ideas que a nadie se le ocurrieron.', pesos: { r: 2 } },
            { texto: 'Cuido que todos estén bien y hagan su parte.', pesos: { h: 2 } }
        ]
    },
    {
        texto: 'El sendero del bosque se parte en cuatro. ¿Por cuál sigues?',
        respuestas: [
            { texto: 'Por el más peligroso: ahí está la historia.', pesos: { g: 2 } },
            { texto: 'Por el que llega más rápido al final.', pesos: { s: 2 } },
            { texto: 'Por el más raro, el que nadie ha explorado.', pesos: { r: 2 } },
            { texto: 'Por el más andado, y en compañía.', pesos: { h: 2 } }
        ]
    },
    {
        texto: '¿Cómo te gustaría que te recordaran?',
        respuestas: [
            { texto: 'Como alguien valiente.', pesos: { g: 2 } },
            { texto: 'Como alguien que llegó lejos.', pesos: { s: 2 } },
            { texto: 'Como alguien brillante.', pesos: { r: 2 } },
            { texto: 'Como alguien bueno con los demás.', pesos: { h: 2 } }
        ]
    },
    {
        texto: 'Te equivocas feo, delante de todos.',
        respuestas: [
            { texto: 'Lo acepto, me río de mí y sigo adelante.', pesos: { g: 2 } },
            { texto: 'No dejo que se note: lo uso para volverme más fuerte.', pesos: { s: 2 } },
            { texto: 'Analizo en qué falló mi razonamiento para no repetirlo.', pesos: { r: 2 } },
            { texto: 'Pido perdón y arreglo el daño que hice.', pesos: { h: 2 } }
        ]
    },
    {
        texto: 'Y para acompañarte, ¿qué animal elegirías?',
        respuestas: [
            { texto: 'Un fénix.', pesos: { g: 2 } },
            { texto: 'Una serpiente.', pesos: { s: 2 } },
            { texto: 'Una lechuza.', pesos: { r: 2 } },
            { texto: 'Un perro fiel.', pesos: { h: 2 } }
        ]
    },
    {
        texto: '¿Qué victoria te sabría mejor?',
        respuestas: [
            { texto: 'La que gané por mérito propio, aunque haya sido durísima.', pesos: { g: 2 } },
            { texto: 'La que gané siendo más astuto que los demás.', pesos: { s: 2 } },
            { texto: 'La que gané entendiendo mejor el juego que nadie.', pesos: { r: 2 } },
            { texto: 'La que gané con mi equipo. Si no es con ellos, no la quiero.', pesos: { h: 2 } }
        ]
    }
];

// Pregunta final: la preferencia propia. Pesa menos que el resto, pero
// desempata (el Sombrero siempre escucha lo que uno quiere).
export const PREGUNTA_FINAL = {
    texto: 'Última pregunta, y es la más importante. Si dudo entre dos casas, ¿cuál prefieres?',
    respuestas: [
        { texto: 'Gryffindor.', pesos: { g: 1.5 } },
        { texto: 'Slytherin.', pesos: { s: 1.5 } },
        { texto: 'Ravenclaw.', pesos: { r: 1.5 } },
        { texto: 'Hufflepuff.', pesos: { h: 1.5 } }
    ]
};

// --- Lo que dice el Sombrero entre pregunta y pregunta -------------------------
// Una frase corta según la casa que va liderando, para que parezca que escucha.

export const COMENTARIOS = {
    gryffindor: [
        'Mmm, veo un corazón que no se queda quieto.',
        'Interesante... hay fuego por aquí.',
        'Eso fue valiente, o tal vez imprudente. Ya veremos.'
    ],
    slytherin: [
        'Vaya, vaya... hay un plan detrás de esa respuesta.',
        'Mmm, ambición. No me asusta, me gusta.',
        'Astuto. Muy astuto.'
    ],
    ravenclaw: [
        'Ajá, una mente que no para de preguntar.',
        'Interesante razonamiento, sí, sí.',
        'Curioso, muy curioso... me gusta cómo piensas.'
    ],
    hufflepuff: [
        'Qué cosa más noble. Se nota quién importa para ti.',
        'Mmm, un corazón generoso y firme.',
        'Lealtad. Eso no se enseña, se trae.'
    ],
    neutro: [
        'Mmm... difícil, muy difícil.',
        'Hay de todo en esa cabecita.',
        'Interesante, interesante. Sigamos.'
    ]
};

// --- Veredicto: lo que grita el Sombrero y lo que explica después ---------------

export const VEREDICTOS = {
    gryffindor: {
        grito: '¡GRYFFINDOR!',
        explicacion: (nombre) =>
            `${nombre}, en ti hay mucho coraje y una necesidad de actuar antes de que otros se decidan. Eres de los que van primero y no miran atrás. Ese corazón es tu mejor arma.`
    },
    slytherin: {
        grito: '¡SLYTHERIN!',
        explicacion: (nombre) =>
            `${nombre}, aquí hay ambición de la buena: ves lo que quieres y sabes cómo llegar. Astucia, determinación y una cabeza fría que no se rinde. Llegarás lejos.`
    },
    ravenclaw: {
        grito: '¡RAVENCLAW!',
        explicacion: (nombre) =>
            `${nombre}, tu mente no descansa: preguntas, conectas y entiendes antes que los demás. Ingenio, curiosidad y ganas de saber. Tus ideas son tu tesoro.`
    },
    hufflepuff: {
        grito: '¡HUFFLEPUFF!',
        explicacion: (nombre) =>
            `${nombre}, tu fuerza está en tu gente: eres leal, justo y paciente, y haces que los demás se sientan en casa. Lo que parece suave es de lo más firme que hay.`
    }
};

// Cuando las dos casas más altas quedan casi empatadas, el Sombrero duda.
export const DUDA = {
    abre: [
        'Mmm... esto no es fácil. Veo dos caminos igual de buenos.',
        'Vaya, vaya... estoy dudando. Hace mucho que no me pasaba.'
    ],
    cierra: (casaGanadora, casaSegunda, nombre) =>
        `Estuve a punto de mandarte a ${casaSegunda}, ${nombre}. Pero lo que me dijiste al final inclinó la balanza.`
};

// --- Cuando los dos ya fueron seleccionados ------------------------------------------
// Una frase por cada combinación (sin importar el orden).

const PARES = {
    'gryffindor+gryffindor': 'Dos leones bajo el mismo techo: valentía por partida doble. Nunca se aburrirán, y de vez en cuando tendrán que turnarse para tener la razón.',
    'slytherin+slytherin': 'Dos mentes ambiciosas que se entienden sin hablar. Juntos llegan a donde se propongan, y hay muy pocos secretos que no se cuenten.',
    'ravenclaw+ravenclaw': 'Dos cabezas que no paran de pensar. Sus conversaciones pueden durar horas, y siempre habrá un libro nuevo del que hablar.',
    'hufflepuff+hufflepuff': 'Dos corazones leales y pacientes: la casa más cálida de todas. Con ustedes cualquiera se siente en casa.',
    'gryffindor+slytherin': 'Fuego y astucia: una persona lanza la idea y la otra ve el plan. Se desafían, se complementan y, cuando se alían, no hay quien los pare.',
    'gryffindor+ravenclaw': 'Corazón y cabeza. Una se lanza y la otra se pregunta por qué; juntos hacen aventuras con cabeza y planes con corazón.',
    'gryffindor+hufflepuff': 'La valentía y la lealtad, la mejor combinación para una historia larga: alguien abre camino y alguien más nunca suelta la mano.',
    'slytherin+ravenclaw': 'La ambición y el ingenio: se retan a pensar más lejos y a llegar más alto. Una pareja que siempre tiene un plan, y otro de respaldo.',
    'slytherin+hufflepuff': 'La determinación y la paciencia. Una parte sabe a dónde ir y la otra sabe cómo llegar sin perder a nadie en el camino.',
    'ravenclaw+hufflepuff': 'La curiosidad y la ternura: una parte pregunta el porqué de todo y la otra se asegura de que nunca falte un lugar seguro donde preguntarlo.'
};

export function textoDePareja(casaA, casaB) {
    const clave = [casaA, casaB].sort().join('+');
    return PARES[clave] ?? '';
}
