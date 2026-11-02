export interface SseEvent {
  event: string;
  data: string;
}

const DEFAULT_EVENT_NAME = 'message';

const toSseEvent = (block: string): SseEvent | null => {
  let event = DEFAULT_EVENT_NAME;
  const dataLines: string[] = [];

  for (const line of block.split('\n')) {
    if (line === '' || line.startsWith(':')) continue;

    const separatorIndex = line.indexOf(':');
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const rawValue = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1);
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;

    if (field === 'event') event = value;
    if (field === 'data') dataLines.push(value);
  }

  return dataLines.length > 0 ? { event, data: dataLines.join('\n') } : null;
};

export async function* readSseEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseEvent, void, undefined> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let pendingCarriageReturn = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = pendingCarriageReturn + decoder.decode(value, { stream: true });
      pendingCarriageReturn = text.endsWith('\r') ? '\r' : '';
      buffer += (pendingCarriageReturn ? text.slice(0, -1) : text).replace(/\r\n?/g, '\n');

      let boundaryIndex = buffer.indexOf('\n\n');
      while (boundaryIndex !== -1) {
        const event = toSseEvent(buffer.slice(0, boundaryIndex));
        buffer = buffer.slice(boundaryIndex + 2);
        if (event) yield event;
        boundaryIndex = buffer.indexOf('\n\n');
      }
    }

    buffer += (pendingCarriageReturn + decoder.decode()).replace(/\r\n?/g, '\n');
    const lastEvent = toSseEvent(buffer);
    if (lastEvent) yield lastEvent;
  } finally {
    reader.releaseLock();
  }
}
