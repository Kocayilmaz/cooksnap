export class InvalidDataUrlError extends Error {}

/** `data:<mimeType>;base64,<data>` formatındaki bir data URL'i mimeType/base64 parçalarına ayırır. */
export function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new InvalidDataUrlError("Fotoğraf verisi geçersiz bir data URL formatında.");
  }
  return { mimeType: match[1], base64: match[2] };
}
