// Redimensiona y comprime en el navegador ANTES de subir.
// Las fotos originales del álbum llegaban a pesar 1.3 MB: en datos móviles
// eso es una espera real, y el free tier de Storage no es infinito.

const LADO_MAX = 1600;
const CALIDAD = 0.82;

export async function comprimirImagen(file, { ladoMax = LADO_MAX, calidad = CALIDAD } = {}) {
    if (!file.type.startsWith('image/')) {
        throw new Error('El archivo no es una imagen');
    }

    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    const escala = Math.min(1, ladoMax / Math.max(width, height));
    const anchoFinal = Math.round(width * escala);
    const altoFinal = Math.round(height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = anchoFinal;
    canvas.height = altoFinal;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, anchoFinal, altoFinal);
    bitmap.close();

    const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', calidad)
    );

    if (!blob) throw new Error('No se pudo procesar la imagen');

    // Si comprimir no ayudó (imagen ya chica y optimizada), usamos el original.
    if (blob.size >= file.size && escala === 1) {
        return { blob: file, ancho: width, alto: height, extension: extensionDe(file.type) };
    }

    return { blob, ancho: anchoFinal, alto: altoFinal, extension: 'jpg' };
}

function extensionDe(mime) {
    if (mime === 'image/png') return 'png';
    if (mime === 'image/webp') return 'webp';
    return 'jpg';
}

export function nombreUnico(extension) {
    const azar = Math.random().toString(36).slice(2, 8);
    return `${Date.now()}-${azar}.${extension}`;
}

export function formatearPeso(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
