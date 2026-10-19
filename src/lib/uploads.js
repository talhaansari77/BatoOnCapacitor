export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const photoTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const documentTypes = [...photoTypes, "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export function validateUpload(file, { photoOnly = false, count = 0, limit = 10 } = {}) {
  if (!file || !file.size || file.size > MAX_UPLOAD_BYTES) return "size";
  if (!(photoOnly ? photoTypes : documentTypes).includes(file.type)) return "type";
  if (count >= limit) return "count";
  return null;
}
