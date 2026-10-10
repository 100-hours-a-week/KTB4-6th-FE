'use client';

import { useCurrentMeetingContext } from '../model/current-meeting-context';
import { useMeetingChatComposer } from '../model/useMeetingChatComposer';
import { useMeetingChatMessages } from '../model/useMeetingChatMessages';
import { ChatComposer } from './ChatComposer';
import { ChatCreditNoticeDialog } from './ChatCreditNoticeDialog';
import { ChatMessageList } from './ChatMessageList';

export const MeetingChat = () => {
  const { meetingId } = useCurrentMeetingContext();
  const chatMessages = useMeetingChatMessages(meetingId);
  const chatComposer = useMeetingChatComposer({
    serverMessages: chatMessages.messages,
    serverHasAskedQuestion: chatMessages.hasAskedQuestion,
    isUnavailable: chatMessages.isLoading || chatMessages.isError,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <ChatMessageList
        messages={chatComposer.messages}
        isLoading={chatMessages.isLoading}
        isError={chatMessages.isError}
        isRetrying={chatMessages.isRetrying}
        onRetry={chatMessages.retry}
      />
      {!chatMessages.isError && (
        <>
          <ChatComposer
            creditBalance={chatComposer.creditBalance}
            creditCost={chatComposer.creditCost}
            isLoading={chatMessages.isLoading}
            isProcessing={chatComposer.isProcessing}
            question={chatComposer.question}
            onQuestionChange={chatComposer.setQuestion}
            onSubmit={chatComposer.submitQuestion}
          />
          <ChatCreditNoticeDialog
            isOpen={chatComposer.isCreditNoticeOpen}
            currentCredit={chatComposer.creditBalance}
            creditCost={chatComposer.creditCost}
            onCancel={() => chatComposer.setIsCreditNoticeOpen(false)}
            onConfirm={chatComposer.sendQuestion}
            onOpenChange={chatComposer.setIsCreditNoticeOpen}
          />
        </>
      )}
    </div>
  );
};
