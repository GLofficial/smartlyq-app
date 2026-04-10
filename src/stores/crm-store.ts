import { create } from "zustand";

interface CrmUiState {
  selectedDealId: number | null;
  selectedContactId: number | null;
  selectedTaskId: number | null;
  setSelectedDeal: (id: number | null) => void;
  setSelectedContact: (id: number | null) => void;
  setSelectedTask: (id: number | null) => void;
}

export const useCrmUiStore = create<CrmUiState>((set) => ({
  selectedDealId: null,
  selectedContactId: null,
  selectedTaskId: null,
  setSelectedDeal: (id) => set({ selectedDealId: id }),
  setSelectedContact: (id) => set({ selectedContactId: id }),
  setSelectedTask: (id) => set({ selectedTaskId: id }),
}));
