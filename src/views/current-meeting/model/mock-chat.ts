export type ChatMessageStatus = 'COMPLETED' | 'PROCESSING' | 'FAILED';

export interface ChatMessageViewModel {
  id: string;
  askerDisplayName: string;
  createdAtLabel: string;
  question: string;
  status: ChatMessageStatus;
  answer: string | null;
}

export interface ChatViewModel {
  status: 'ready' | 'loading' | 'error';
  messages: ChatMessageViewModel[];
}

export const mockChat: ChatViewModel = {
  status: 'ready',
  messages: [
    {
      id: 'chat-message-1',
      askerDisplayName: '김민수 (나)',
      createdAtLabel: '14:05',
      question: '지금까지 나온 출시 일정 관련 의견을 정리해줘',
      status: 'COMPLETED',
      answer:
        '출시 일정에 대한 의견은 **두 가지**입니다.\n\n1. **기존 일정 유지**: QA 범위를 핵심 결제 흐름으로 줄여 2주 차 출시를 유지합니다.\n2. **1주 연기**: 결제 모듈 테스트와 환불 시나리오까지 확인한 뒤 출시합니다.\n\n현재는 QA 결과를 확인한 뒤 다음 회의에서 최종 일정을 정하기로 했습니다.',
    },
    {
      id: 'chat-message-2',
      askerDisplayName: '신짱구',
      createdAtLabel: '14:08',
      question: '결제 모듈 담당자와 이번 주 할 일을 알려줘',
      status: 'COMPLETED',
      answer:
        '결제 모듈 QA 담당자는 **박지민 님**입니다.\n\n- 핵심 결제 흐름 테스트\n- 환불 시나리오 확인\n- **이번 주 금요일**까지 QA 결과 공유',
    },
    {
      id: 'chat-message-processing',
      askerDisplayName: '김민수 (나)',
      createdAtLabel: '14:13',
      question: '지금까지 결정된 사항만 알려줘',
      status: 'PROCESSING',
      answer: null,
    },
    {
      id: 'chat-message-failed',
      askerDisplayName: '이영희',
      createdAtLabel: '14:15',
      question: '다음 회의 전까지 준비할 내용을 알려줘',
      status: 'FAILED',
      answer: null,
    },
  ],
};
