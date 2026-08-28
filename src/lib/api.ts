const API_BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api`;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return typeof body?.error === 'string' ? body.error : `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res));
  return res.json() as Promise<T>;
}

export interface ContentAsset {
  _id: string;
  type: 'image' | 'voicenote';
  slot: string;
  url: string;
  publicId: string;
  uploadedAt: string;
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

export async function getUploadSignature(type: 'image' | 'voicenote'): Promise<UploadSignature> {
  return apiJson<UploadSignature>('/uploads/signature', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

export async function uploadToCloudinary(
  signature: UploadSignature,
  file: File,
): Promise<{ secure_url: string; public_id: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  return res.json();
}

export async function replaceAsset(
  slot: string,
  data: { type: 'image' | 'voicenote'; url: string; publicId: string },
): Promise<ContentAsset> {
  return apiJson<ContentAsset>(`/assets/${slot}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAsset(slot: string): Promise<void> {
  const res = await apiFetch(`/assets/${slot}`, { method: 'DELETE' });
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res));
}
