const ES_DESCRIPTOR_TAG = 0x03;
const DECODER_CONFIG_DESCRIPTOR_TAG = 0x04;
const DECODER_SPECIFIC_INFO_TAG = 0x05;
const DECODER_CONFIG_FIXED_FIELDS_SIZE = 13;
const STREAM_DEPENDENCE_FLAG = 0x80;
const URL_FLAG = 0x40;
const OCR_STREAM_FLAG = 0x20;

interface Descriptor {
  tag: number;
  start: number;
  end: number;
}

const readDescriptor = (bytes: Uint8Array, offset: number): Descriptor | null => {
  if (offset >= bytes.length) return null;

  const tag = bytes[offset];
  let size = 0;
  let cursor = offset + 1;
  for (let i = 0; i < 4; i += 1) {
    if (cursor >= bytes.length) return null;
    const byte = bytes[cursor];
    cursor += 1;
    size = (size << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) break;
  }

  const end = cursor + size;
  return end <= bytes.length ? { tag, start: cursor, end } : null;
};

const findChildDescriptor = (bytes: Uint8Array, start: number, end: number, tag: number) => {
  let offset = start;
  while (offset < end) {
    const descriptor = readDescriptor(bytes, offset);
    if (!descriptor || descriptor.end > end) return null;
    if (descriptor.tag === tag) return descriptor;
    offset = descriptor.end;
  }
  return null;
};

export const toAudioSpecificConfig = (description: ArrayBuffer): ArrayBuffer => {
  const bytes = new Uint8Array(description);
  const esDescriptor = readDescriptor(bytes, 0);
  if (esDescriptor?.tag !== ES_DESCRIPTOR_TAG) return description;

  const flags = bytes[esDescriptor.start + 2];
  let offset = esDescriptor.start + 3;
  if (flags & STREAM_DEPENDENCE_FLAG) offset += 2;
  if (flags & URL_FLAG) offset += 1 + bytes[offset];
  if (flags & OCR_STREAM_FLAG) offset += 2;

  const decoderConfig = findChildDescriptor(
    bytes,
    offset,
    esDescriptor.end,
    DECODER_CONFIG_DESCRIPTOR_TAG,
  );
  if (!decoderConfig) return description;

  const specificInfo = findChildDescriptor(
    bytes,
    decoderConfig.start + DECODER_CONFIG_FIXED_FIELDS_SIZE,
    decoderConfig.end,
    DECODER_SPECIFIC_INFO_TAG,
  );
  return specificInfo ? description.slice(specificInfo.start, specificInfo.end) : description;
};
