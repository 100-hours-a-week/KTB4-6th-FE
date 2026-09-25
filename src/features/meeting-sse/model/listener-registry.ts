/** 회의 ID별 이벤트 구독자를 등록·해제하고, 이벤트가 오면 해당 회의의 구독자에게만 알린다. */
export const createListenerRegistry = <Args extends unknown[] = []>() => {
  type Listener = (...args: Args) => void;
  const listenersByMeetingId = new Map<string, Set<Listener>>();

  const subscribe = (meetingId: string, listener: Listener) => {
    const listeners = listenersByMeetingId.get(meetingId) ?? new Set<Listener>();
    listeners.add(listener);
    listenersByMeetingId.set(meetingId, listeners);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && listenersByMeetingId.get(meetingId) === listeners) {
        listenersByMeetingId.delete(meetingId);
      }
    };
  };

  const emit = (meetingId: string, ...args: Args) => {
    listenersByMeetingId.get(meetingId)?.forEach((listener) => listener(...args));
  };

  const clear = () => listenersByMeetingId.clear();

  return { subscribe, emit, clear };
};
