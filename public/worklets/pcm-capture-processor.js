class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.chunkSamples = options.processorOptions.chunkSamples;
    this.buffer = new Int16Array(this.chunkSamples);
    this.length = 0;
    this.capturing = true;
    this.port.onmessage = ({ data }) => {
      if (data.type === 'flush') {
        this.capturing = false;
        this.emit();
        this.port.postMessage({ type: 'flushed' });
      }
      if (data.type === 'resume') this.capturing = true;
    };
  }

  process(inputs) {
    const channels = inputs[0];
    if (!this.capturing || channels.length === 0) return true;

    for (let i = 0; i < channels[0].length; i++) {
      let sum = 0;
      for (const channel of channels) sum += channel[i];
      const sample = Math.max(-1, Math.min(1, sum / channels.length));
      this.buffer[this.length++] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      if (this.length === this.chunkSamples) this.emit();
    }
    return true;
  }

  emit() {
    if (this.length === 0) return;
    const chunk = this.buffer.slice(0, this.length);
    this.port.postMessage({ type: 'chunk', chunk: chunk.buffer }, [chunk.buffer]);
    this.length = 0;
  }
}

registerProcessor('pcm-capture', PcmCaptureProcessor);
