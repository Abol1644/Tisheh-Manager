import { create } from 'zustand';
import { Account } from '@/models/';

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account | null) => void;
  addAccount: (account: Account) => void;
  eraseAccount: (accountId: string) => void;
  replaceAccount: (updatedAccount: Account) => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  selectedAccount: null,
  setAccounts: (accounts) => set({ accounts }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  addAccount: (account) => set((state) => ({ 
    accounts: [...state.accounts, account] 
  })),
  eraseAccount: (accountId) => set((state) => ({ 
    accounts: state.accounts.filter(acc => acc.codeAcc !== accountId),
    selectedAccount: state.selectedAccount && state.selectedAccount.codeAcc === accountId 
      ? null 
      : state.selectedAccount
  })),
  replaceAccount: (updatedAccount) => set((state) => ({
    accounts: state.accounts.map(acc => 
      acc.codeAcc === updatedAccount.codeAcc ? updatedAccount : acc
    ),
    selectedAccount: state.selectedAccount?.codeAcc === updatedAccount.codeAcc ? updatedAccount : state.selectedAccount
  })),
}));