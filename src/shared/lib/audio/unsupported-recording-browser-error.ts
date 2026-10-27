export class UnsupportedRecordingBrowserError extends Error {
  constructor() {
    super('이 브라우저에서는 녹음을 사용할 수 없습니다.');
    this.name = 'UnsupportedRecordingBrowserError';
  }
}
