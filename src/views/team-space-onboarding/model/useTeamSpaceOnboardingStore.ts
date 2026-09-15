import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TeamSpaceOnboardingState {
  join: {
    inviteCode: string;
    nickname: string;
  };
  create: {
    teamName: string;
    nickname: string;
  };

  setInviteCode: (inviteCode: string) => void;
  setJoinNickname: (nickname: string) => void;
  setTeamName: (teamName: string) => void;
  setCreateNickname: (nickname: string) => void;

  resetJoin: () => void;
  resetCreate: () => void;
}

const initialJoinState = {
  inviteCode: '',
  nickname: '',
};

const initialCreateState = {
  teamName: '',
  nickname: '',
};

export const useTeamSpaceOnboardingStore = create<TeamSpaceOnboardingState>()(
  persist(
    (set) => ({
      join: initialJoinState,
      create: initialCreateState,

      setInviteCode: (inviteCode) =>
        set((state) => ({
          join: { ...state.join, inviteCode },
        })),

      setJoinNickname: (nickname) =>
        set((state) => ({
          join: { ...state.join, nickname },
        })),

      setTeamName: (teamName) =>
        set((state) => ({
          create: { ...state.create, teamName },
        })),

      setCreateNickname: (nickname) =>
        set((state) => ({
          create: { ...state.create, nickname },
        })),

      resetJoin: () => set({ join: initialJoinState }),
      resetCreate: () => set({ create: initialCreateState }),
    }),
    {
      name: 'team-space-onboarding',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
