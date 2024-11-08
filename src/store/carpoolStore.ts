import { create } from 'zustand';
import { carpoolService } from '../services/api';
import { Carpool } from '../types';

interface CarpoolStore {
  carpools: Carpool[];
  addCarpool: (carpool: Carpool) => Promise<void>;
  deleteCarpool: (carpoolId: string) => Promise<void>;
  joinCarpool: (carpoolId: string, userId: string) => Promise<boolean>;
  leaveCarpool: (carpoolId: string, userId: string) => Promise<void>;
  getCarpoolsByUser: (userId: string) => Carpool[];
  fetchCarpools: () => Promise<void>;
}

export const useCarpoolStore = create<CarpoolStore>((set, get) => ({
  carpools: [],
  
  fetchCarpools: async () => {
    try {
      const carpools = await carpoolService.getAll();
      set({ carpools });
    } catch (error) {
      console.error('Error fetching carpools:', error);
      throw error;
    }
  },

  addCarpool: async (carpool) => {
    try {
      const newCarpool = await carpoolService.create(carpool);
      set((state) => ({ 
        carpools: [...state.carpools, { ...newCarpool, id: newCarpool._id }] 
      }));
    } catch (error) {
      console.error('Error adding carpool:', error);
      throw error;
    }
  },

  deleteCarpool: async (carpoolId) => {
    try {
      await carpoolService.delete(carpoolId);
      set((state) => ({
        carpools: state.carpools.filter(c => c._id !== carpoolId && c.id !== carpoolId)
      }));
    } catch (error) {
      console.error('Error deleting carpool:', error);
      throw error;
    }
  },

  joinCarpool: async (carpoolId, userId) => {
    try {
      const updatedCarpool = await carpoolService.join(carpoolId, userId);
      set((state) => ({
        carpools: state.carpools.map(c => 
          (c._id === carpoolId || c.id === carpoolId) ? { ...updatedCarpool, id: updatedCarpool._id } : c
        )
      }));
      return true;
    } catch (error) {
      console.error('Error joining carpool:', error);
      return false;
    }
  },

  leaveCarpool: async (carpoolId, userId) => {
    try {
      const updatedCarpool = await carpoolService.leave(carpoolId, userId);
      set((state) => ({
        carpools: state.carpools.map(c => 
          (c._id === carpoolId || c.id === carpoolId) ? { ...updatedCarpool, id: updatedCarpool._id } : c
        )
      }));
    } catch (error) {
      console.error('Error leaving carpool:', error);
      throw error;
    }
  },

  getCarpoolsByUser: (userId) => {
    return get().carpools.filter(c => 
      c.driverId === userId || c._id === userId || 
      (c.currentPassengers && c.currentPassengers.includes(userId))
    );
  }
}));