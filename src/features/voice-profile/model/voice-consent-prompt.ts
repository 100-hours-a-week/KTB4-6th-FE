const promptDismissedKey = (teamId: number) => `voice-consent-prompt-dismissed:${teamId}`;
const PROMPT_CHANGE_EVENT = 'voice-consent-prompt-change';

export const subscribeToVoiceConsentPrompt = (onChange: () => void): (() => void) => {
  window.addEventListener(PROMPT_CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);

  return () => {
    window.removeEventListener(PROMPT_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

export const hasDismissedVoiceConsentPrompt = (teamId: number): boolean =>
  sessionStorage.getItem(promptDismissedKey(teamId)) === 'true';

export const dismissVoiceConsentPrompt = (teamId: number): void => {
  sessionStorage.setItem(promptDismissedKey(teamId), 'true');
  window.dispatchEvent(new Event(PROMPT_CHANGE_EVENT));
};

export const clearDismissedVoiceConsentPrompt = (teamId: number): void => {
  sessionStorage.removeItem(promptDismissedKey(teamId));
  window.dispatchEvent(new Event(PROMPT_CHANGE_EVENT));
};
