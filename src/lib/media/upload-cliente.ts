import { createClient } from "@/lib/supabase/client";

const BUCKET = "media";
const LIMITE_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

export class ErroDeCarregamento extends Error {}

function nomeSeguro(nome: string): string {
  const partes = nome.split(".");
  const extensao = partes.length > 1 ? partes.pop() : "";
  const base = partes
    .join(".")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const sufixo = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}-${base || "ficheiro"}-${sufixo}${extensao ? `.${extensao}` : ""}`;
}

// Carrega um ficheiro para o bucket "media", com barra de progresso real
// (por isso XHR em vez do cliente supabase-js, que não expõe progresso).
export async function carregarMedia(
  ficheiro: Blob,
  nomeOriginal: string,
  onProgresso: (percentagem: number) => void,
): Promise<{ url: string; caminho: string }> {
  if (ficheiro.type.startsWith("video/") && ficheiro.size > LIMITE_VIDEO_BYTES) {
    throw new ErroDeCarregamento(
      "O vídeo excede o limite de 50MB. Escolhe um ficheiro mais pequeno.",
    );
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new ErroDeCarregamento("A tua sessão expirou — entra outra vez.");

  const caminho = nomeSeguro(nomeOriginal);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${caminho}`);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Content-Type", ficheiro.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (evento) => {
      if (evento.lengthComputable) {
        onProgresso(Math.round((evento.loaded / evento.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgresso(100);
        resolve();
      } else {
        reject(new ErroDeCarregamento("O carregamento falhou. Tenta outra vez."));
      }
    };
    xhr.onerror = () => reject(new ErroDeCarregamento("O carregamento falhou. Verifica a ligação."));
    xhr.send(ficheiro);
  });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return { url: data.publicUrl, caminho };
}
