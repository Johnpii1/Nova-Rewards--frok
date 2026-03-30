import { create } from 'zustand';

const DEFAULT_VISIBLE_ITEMS = 6;
const PROGRESSIVE_BATCH_SIZE = 4;

export const useLoadingStore = create((set) => ({
  contentLoading: {
    rewards: false,
  },
  asyncOperations: {
    redeemReward: false,
  },
  progressive: {
    rewardsVisibleCount: DEFAULT_VISIBLE_ITEMS,
  },

  setContentLoading: (area, isLoading) =>
    set((state) => ({
      contentLoading: {
        ...state.contentLoading,
        [area]: isLoading,
      },
    })),

  setAsyncOperation: (operation, isLoading) =>
    set((state) => ({
      asyncOperations: {
        ...state.asyncOperations,
        [operation]: isLoading,
      },
    })),

  resetProgressiveLoading: (area) =>
    set((state) => ({
      progressive: {
        ...state.progressive,
        [`${area}VisibleCount`]: DEFAULT_VISIBLE_ITEMS,
      },
    })),

  loadNextBatch: (area) =>
    set((state) => ({
      progressive: {
        ...state.progressive,
        [`${area}VisibleCount`]:
          (state.progressive[`${area}VisibleCount`] ?? DEFAULT_VISIBLE_ITEMS) +
          PROGRESSIVE_BATCH_SIZE,
      },
    })),
}));

export { DEFAULT_VISIBLE_ITEMS, PROGRESSIVE_BATCH_SIZE };
