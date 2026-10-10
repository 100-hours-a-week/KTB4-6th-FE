export const NotificationsErrorState = () => (
  <div className="flex flex-1 flex-col px-5 pt-6 pb-8">
    <section
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-cool-200 bg-white px-4 py-8 text-center"
    >
      <h2 className="text-base font-bold text-cool-900">알림을 불러오지 못했어요</h2>
      <p className="mt-2 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
    </section>
  </div>
);
