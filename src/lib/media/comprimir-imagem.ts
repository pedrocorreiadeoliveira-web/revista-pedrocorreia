const LARGURA_MAXIMA = 1600;
const QUALIDADE_WEBP = 0.82;

// Reduz a imagem para no máximo 1600px de largura e converte para WebP,
// tudo no browser, antes de qualquer carregamento — poupa dados e espaço,
// sobretudo a partir do telemóvel.
export async function comprimirImagem(ficheiro: File): Promise<Blob> {
  const bitmap = await createImageBitmap(ficheiro);
  const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Não foi possível preparar a imagem.");
  contexto.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALIDADE_WEBP),
  );
  if (!blob) throw new Error("Não foi possível comprimir a imagem.");
  return blob;
}
