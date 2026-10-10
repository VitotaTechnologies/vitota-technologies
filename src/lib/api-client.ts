export async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const isHtmlResponse =
      normalizedText.startsWith('<!DOCTYPE html') ||
      normalizedText.startsWith('<html');

    if (isHtmlResponse) {
      throw new Error(
        'The server returned an unexpected response. Please try again.'
      );
    }

    throw new Error(
      normalizedText.slice(0, 180) || 'Request failed.'
    );
  }
}
