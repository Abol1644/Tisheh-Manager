import { create } from 'zustand';
import { Account } from '@/models/';

interface AccountState {
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  selectedAccount: null,
  setSelectedAccount: (account) => set({ selectedAccount: account }),
}));