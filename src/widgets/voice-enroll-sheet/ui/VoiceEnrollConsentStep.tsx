import { VoiceEnrollResult } from './VoiceEnrollResult';

export const VoiceEnrollConsentStep = () => (
  <VoiceEnrollResult
    title="음성 수집 동의가 필요해요"
    description={
      <>
        목소리를 등록하려면 음성 정보 수집에
        <br />
        먼저 동의해 주세요.
      </>
    }
  />
);
