/**
 * Voice log — placeholder until a speech-to-text integration is built.
 * Neha's UI should call isVoiceSupported() first and show a "coming soon"
 * state rather than a broken button when it returns false.
 */

export function isVoiceSupported(): boolean {
  return false;
}

export async function startVoiceLog(): Promise<string> {
  throw new Error('Voice log coming soon');
}
