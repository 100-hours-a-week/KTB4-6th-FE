export const breakSentences = (text: string) => text.replace(/([.!?])\s+(?=\S)/g, '$1\n');
