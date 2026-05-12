const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface UploadInstallerResult {
  url: string;
}

/**
 * Envia o arquivo instalador para o backend, que o repassa ao S3 e retorna a URL pública.
 * A estratégia de URL (pública ou presigned) é encapsulada no backend — apenas a URL final
 * é retornada aqui.
 */
export function uploadInstaller(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadInstallerResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadInstallerResult;
          resolve(data);
        } catch {
          reject(new Error("Resposta inválida do servidor"));
        }
      } else {
        reject(new Error(`Erro no upload: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Falha na conexão durante o upload"))
    );
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelado")));

    xhr.open("POST", `${API_BASE_URL}/api/versions/installer`);
    xhr.send(formData);
  });
}
