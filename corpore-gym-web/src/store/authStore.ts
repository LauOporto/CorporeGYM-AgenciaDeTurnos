import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'user' | 'admin';
  telefono?: string;
  cuota_al_dia?: boolean;
  pago_pendiente?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  let parsedUser = null;
  try {
    const stored = localStorage.getItem('gym_user');
    parsedUser = stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  } catch (e) {
    parsedUser = null;
  }

  return {
    token: localStorage.getItem('gym_token') !== 'undefined' ? localStorage.getItem('gym_token') : null,
    user: parsedUser,
    setAuth: (token, user) => {
      localStorage.setItem('gym_token', token || '');
      localStorage.setItem('gym_user', JSON.stringify(user || null));
      set({ token, user });
    },
    logout: () => {
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_user');
      set({ token: null, user: null });
    },
    refreshUser: async () => {
      const currentToken = localStorage.getItem('gym_token');
      const currentUserStr = localStorage.getItem('gym_user');
      if (!currentToken || !currentUserStr || currentUserStr === 'undefined') return;
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (!currentUser?.id) return;
        const { data } = await api.get(`/users/${currentUser.id}`);
        if (data?.ok) {
           const updatedUser = { ...currentUser, ...data.data };
           localStorage.setItem('gym_user', JSON.stringify(updatedUser));
           set({ user: updatedUser });
        }
      } catch (err) {
        console.error('Error refreshing session', err);
      }
    }
  };
});
