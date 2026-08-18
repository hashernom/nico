// Migración única: sube las fotos históricas de img/ a Supabase Storage y
// carga los checkpoints del timeline, todo tal como estaba hardcodeado en
// el script.js original.
//
// Uso:
//   SUPABASE_SERVICE_KEY=<service_role> npm run migrar-fotos
//
// La service_role key NUNCA se guarda en un archivo: se pasa por variable de
// entorno y solo vive durante la ejecución del comando.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUCKET = 'fotos';
const LADO_MAX = 1600;
const CALIDAD = 82;

// Orden y captions tal como estaban en el script.js original.
const FOTOS = [
    { archivo: 'img1.jpg', caption: 'segunda date jajaja' },
    { archivo: 'img2.jpg', caption: 'primera date :u' },
    { archivo: 'img3.jpg', caption: 'dia de almuerzo con la family' },
    { archivo: 'img4.jpg', caption: 'pre date' },
    { archivo: 'img5.jpg', caption: 'oye bonita!!!' },
    { archivo: 'img6.jpg', caption: 'pechochos' },
    { archivo: 'img7.jpg', caption: 'prueba de embarazo...' },
    { archivo: 'img8.jpg', caption: 'integracion familiar ishh' },
    { archivo: 'img9.jpg', caption: 'pre night' },
    { archivo: 'img10.jpg', caption: 'NO MAMES EL BIG DAY' },
    { archivo: 'img10.1.jpeg', caption: 'Best date' },
    { archivo: 'img11.jpeg', caption: 'primer mes!!!!', fecha: '2026-03-21' },
    { archivo: 'img12.jpeg', caption: 'El mejor regalo del mundo lit', fecha: '2026-03-21' },
    { archivo: 'img13.jpeg', caption: 'Almuerzo de pumple de mi nico' },
    { archivo: 'img14.jpeg', caption: 'us 4:3' },
    { archivo: 'img15.jpeg', caption: 'Pumple de mamor bello mua' },
    { archivo: 'img16.jpeg', caption: 'primer beso formal' },
    { archivo: 'img17.jpeg', caption: 'brunch con el suegro' },
    { archivo: 'img18.jpeg', caption: 'mi foto fav por ahora (4/04/2026)', fecha: '2026-04-04' },
    { archivo: 'img19.jpeg', caption: 'noche del temple' },
    { archivo: 'img20.jpeg', caption: 'us 2D' },
    { archivo: 'img21.jpeg', caption: 'tavo facereveal' },
    { archivo: 'img22.jpeg', caption: 'mi novia es muy linda dios mio' },
    { archivo: 'img23.jpeg', caption: 'somos muy lindos dios mio' },
    { archivo: 'img24.jpeg', caption: 'te amo amor' },
    { archivo: 'img25.jpeg', caption: 'lit el mejor regalo del mundo v2.0' },
    { archivo: 'img26.jpeg', caption: 'mi cumpleeeee', fecha: '2026-05-24' }
];

// Checkpoints tal como estaban hardcodeados en script.js. "fecha: null" es
// a propósito: "Serenata de cumpleaños 18 de nico" nunca tuvo fecha registrada.
const EVENTOS = [
    { title: 'Primer contacto', fecha: '2025-04-04' },
    { title: 'Primera Cita', fecha: '2025-04-10' },
    { title: 'Conocí a tus papás', fecha: '2026-01-24' },
    { title: 'Primer pico', fecha: '2026-01-24' },
    { title: 'Primer dia en ocaña', fecha: '2026-02-14' },
    { title: 'Cena familiar', fecha: '2026-02-20' },
    { title: 'nobios alaberga', fecha: '2026-02-21' },
    { title: 'primera date de cine', fecha: '2026-03-18' },
    { title: 'primer mes', fecha: '2026-03-21' },
    { title: 'el mejo regalo del mundo', fecha: '2026-03-21' },
    { title: 'Santiago arrives ocaña once again', fecha: '2026-03-28' },
    { title: 'Serenata de cumpeaños 18 de nico', fecha: null },
    { title: 'Pumple santi', fecha: '2026-05-24' }
];

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// La service_role saltea RLS. Si no está, se usa la clave pública: eso exige
// que existan políticas de escritura temporales (así se corrió la migración
// original, habilitándolas y quitándolas enseguida).
const clave = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !clave) {
    console.error('Faltan VITE_SUPABASE_URL y/o una clave de Supabase en el entorno.');
    process.exit(1);
}

const supabase = createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false }
});

async function migrar() {
    const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true });
    if (count > 0) {
        console.log(`Ya hay ${count} fotos en la base. Nada que migrar.`);
        return;
    }

    let pesoOriginal = 0;
    let pesoFinal = 0;
    let subidas = 0;

    for (const [indice, foto] of FOTOS.entries()) {
        const ruta = join(raiz, 'img', foto.archivo);

        if (!existsSync(ruta)) {
            console.warn(`  ⚠️  No existe ${foto.archivo}, se omite`);
            continue;
        }

        const original = await readFile(ruta);
        const comprimida = await sharp(original)
            .rotate() // respeta la orientación EXIF de las fotos de celular
            .resize(LADO_MAX, LADO_MAX, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: CALIDAD, mozjpeg: true })
            .toBuffer();

        pesoOriginal += original.length;
        pesoFinal += comprimida.length;

        const destino = `historicas/${String(indice + 1).padStart(2, '0')}-${foto.archivo.replace(
            /\.[^.]+$/,
            ''
        )}.jpg`;

        const { error: errorSubida } = await supabase.storage
            .from(BUCKET)
            .upload(destino, comprimida, { contentType: 'image/jpeg', upsert: true });

        if (errorSubida) {
            console.error(`  ❌ ${foto.archivo}: ${errorSubida.message}`);
            continue;
        }

        const { error: errorFila } = await supabase.from('photos').insert({
            storage_path: destino,
            caption: foto.caption,
            taken_on: foto.fecha ?? null,
            sort_index: indice
        });

        if (errorFila) {
            console.error(`  ❌ fila de ${foto.archivo}: ${errorFila.message}`);
            continue;
        }

        subidas++;
        console.log(`  ✅ ${foto.archivo} → ${destino}`);
    }

    const mb = (b) => (b / 1024 / 1024).toFixed(1);
    console.log(`\n${subidas}/${FOTOS.length} fotos migradas.`);
    console.log(`Peso: ${mb(pesoOriginal)} MB → ${mb(pesoFinal)} MB`);
}

async function migrarEventos() {
    const { count } = await supabase.from('events').select('*', { count: 'exact', head: true });
    if (count > 0) {
        console.log(`Ya hay ${count} eventos en la base. Nada que migrar.`);
        return;
    }

    const filas = EVENTOS.map((e) => ({ title: e.title, happened_on: e.fecha }));
    const { error } = await supabase.from('events').insert(filas);

    if (error) {
        console.error('Error migrando eventos:', error.message);
        return;
    }
    console.log(`${filas.length}/${EVENTOS.length} eventos migrados.`);
}

async function main() {
    await migrar();
    await migrarEventos();
}

main().catch((err) => {
    console.error('Falló la migración:', err);
    process.exit(1);
});
