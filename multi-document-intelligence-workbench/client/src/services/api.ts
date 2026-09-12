import type {
  UploadApiResponse,
  AnalysisResponse,
  DocumentItem,
} from '../types/api.types.js';

const API_BASE = '/api';

export async function uploadDocumentsApi(files: File[]): Promise<UploadApiResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Upload failed';
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.errors && parsed.errors.length > 0) {
        errorMessage = parsed.errors[0].message;
      } else if (parsed.message) {
        errorMessage = parsed.message;
      }
    } catch {
      errorMessage = errorText || 'Upload HTTP error';
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function createAnalysisApi(
  documentIds: string[],
  prompt: string
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE}/analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentIds, prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Analysis failed';
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || (parsed.errors ? parsed.errors.join(', ') : 'Analysis failed');
    } catch {
      errorMessage = errorText || 'Analysis HTTP error';
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getAnalysisApi(id: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE}/analysis/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analysis with ID ${id}`);
  }
  return response.json();
}

export async function getDocumentsApi(): Promise<DocumentItem[]> {
  const response = await fetch(`${API_BASE}/documents`);
  if (!response.ok) {
    throw new Error('Failed to fetch uploaded documents list');
  }
  return response.json();
}

export async function deleteDocumentApi(id: string): Promise<void> {
  await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
  });
}
