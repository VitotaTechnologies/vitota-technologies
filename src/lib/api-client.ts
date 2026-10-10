export async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error(
      'The server returned an empty response. Please try again.'
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const isHtmlResponse =
      /^<!doctype html\b/i.test(normalizedText) ||
      /^<html\b/i.test(normalizedText);

    if (isHtmlResponse) {
      throw new Error(
        'The server returned a web page instead of an API response. Please try again later.'
      );
    }

    throw new Error(
      'The server returned an invalid response. Please try again.'
    );
  }
}
