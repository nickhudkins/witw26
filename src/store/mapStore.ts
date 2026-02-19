import { create } from 'zustand';
import type { AppData, TourStep } from '@/lib/types';

interface MapState {
  data: AppData | null;
  vis: Record<number, boolean>;
  openFolders: Record<number, boolean>;
  searchQuery: string;

  // Tour
  tourActive: boolean;
  tourSteps: TourStep[];
  tourIdx: number;
  tourFocus: { fi: number; pi: number } | null;
  preVis: Record<number, boolean>;

  // Actions
  setData: (data: AppData) => void;
  setSearchQuery: (q: string) => void;
  toggleVis: (fi: number) => void;
  setVis: (fi: number, val: boolean) => void;
  toggleFolder: (fi: number) => void;
  setFolderOpen: (fi: number, open: boolean) => void;

  // Tour actions
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  showStep: (idx: number) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  data: null,
  vis: {},
  openFolders: {},
  searchQuery: '',
  tourActive: false,
  tourSteps: [],
  tourIdx: 0,
  tourFocus: null,
  preVis: {},

  setData: (data) => {
    const vis: Record<number, boolean> = {};
    const openFolders: Record<number, boolean> = {};
    data.folders.forEach((_, i) => {
      vis[i] = true;
      openFolders[i] = false;
    });
    set({ data, vis, openFolders });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleVis: (fi) =>
    set((s) => ({ vis: { ...s.vis, [fi]: !s.vis[fi] } })),

  setVis: (fi, val) =>
    set((s) => ({ vis: { ...s.vis, [fi]: val } })),

  toggleFolder: (fi) =>
    set((s) => ({ openFolders: { ...s.openFolders, [fi]: !s.openFolders[fi] } })),

  setFolderOpen: (fi, open) =>
    set((s) => ({ openFolders: { ...s.openFolders, [fi]: open } })),

  startTour: () => {
    const { data, vis } = get();
    if (!data) return;

    const steps: TourStep[] = [];
    data.folders.forEach((folder, fi) => {
      steps.push({ type: 'folder', fi, folder });
      folder.pois.forEach((poi, pi) => {
        steps.push({ type: 'poi', fi, pi, poi, folder });
      });
    });

    if (!steps.length) return;
    const preVis = { ...vis };
    set({ tourActive: true, tourSteps: steps, tourIdx: 0, preVis });
  },

  endTour: () => {
    const { preVis } = get();
    set({
      tourActive: false,
      tourFocus: null,
      vis: { ...preVis },
    });
  },

  nextStep: () => {
    const { tourIdx, tourSteps } = get();
    const next = Math.min(tourIdx + 1, tourSteps.length - 1);
    set({ tourIdx: next });
  },

  prevStep: () => {
    const { tourIdx } = get();
    set({ tourIdx: Math.max(tourIdx - 1, 0) });
  },

  showStep: (idx) => {
    const { data, tourSteps } = get();
    if (!data || !tourSteps[idx]) return;
    const step = tourSteps[idx];

    // Turn off all layers, turn on only this folder
    const newVis: Record<number, boolean> = {};
    data.folders.forEach((_, fi) => { newVis[fi] = false; });
    newVis[step.fi] = true;

    const newOpen: Record<number, boolean> = {};
    data.folders.forEach((_, fi) => { newOpen[fi] = false; });
    newOpen[step.fi] = true;

    const tourFocus = step.type === 'poi' ? { fi: step.fi, pi: step.pi! } : null;
    set({ tourIdx: idx, vis: newVis, openFolders: newOpen, tourFocus });
  },
}));
