'use client';

import { useCurrentMeetingContext } from '../model/current-meeting-context';
import { useMeetingChatComposer } from '../model/useMeetingChatComposer';
import { useMeetingChatCredits } from '../model/useMeetingChatCredits';
import { useMeetingChatMessages } from '../model/useMeetingChatMessages';
import { ChatComposer } from './ChatComposer';
import { ChatCreditNoticeDialog } from './ChatCreditNoticeDialog';
import { ChatMessageList } from './ChatMessageList';

export const MeetingChat = () => {
  const { meetingId, teamId } = useCurrentMeetingContext();
  const chatMessages = useMeetingChatMessages(meetingId);
  const chatCredits = useMeetingChatCredits(Number(teamId));
  const chatComposer = useMeetingChatComposer({
    meetingId,
    serverMessages: chatMessages.messages,
    serverHasAskedQuestion: chatMessages.hasAskedQuestion,
    creditBalance: chatCredits.creditBalance,
    isUnavailable:
      chatMessages.isLoading || chatMessages.isError || chatCredits.creditBalance === null,
    onCreditBalanceRefresh: chatCredits.refreshCreditBalance,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <ChatMessageList
        messages={chatMessages.messages}
        isLoading={chatMessages.isLoading}
        isError={chatMessages.isError}
        isRetrying={chatMessages.isRetrying}
        hasOlderMessages={chatMessages.hasOlderMessages}
        isLoadingOlderMessages={chatMessages.isLoadingOlderMessages}
        hasLoadingOlderMessagesError={chatMessages.hasLoadingOlderMessagesError}
        onRetry={chatMessages.retry}
        onLoadOlderMessages={chatMessages.loadOlderMessages}
      />
      {!chatMessages.isError && (
        <>
          <ChatComposer
            creditBalance={chatComposer.creditBalance}
            creditCost={chatComposer.creditCost}
            isLoading={chatMessages.isLoading}
            isCreditLoading={chatCredits.isLoading}
            isCreditError={chatCredits.isError}
            isProcessing={chatComposer.isProcessing}
            question={chatComposer.question}
            onQuestionChange={chatComposer.setQuestion}
            onSubmit={chatComposer.submitQuestion}
          />
          {chatComposer.creditBalance !== null && (
            <ChatCreditNoticeDialog
              isOpen={chatComposer.isCreditNoticeOpen}
              currentCredit={chatComposer.creditBalance}
              creditCost={chatComposer.creditCost}
              isConfirmDisabled={
                chatComposer.isProcessing || chatComposer.creditBalance < chatComposer.creditCost
              }
              onCancel={() => chatComposer.setIsCreditNoticeOpen(false)}
              onConfirm={chatComposer.sendQuestion}
              onOpenChange={chatComposer.setIsCreditNoticeOpen}
            />
          )}
        </>
      )}
    </div>
  );
};
