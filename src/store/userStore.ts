import { create } from 'zustand';
import { userService } from '../services/api';
import { User, VolunteerSkill, AssistanceRequest, TemporaryHousing } from '../types';

interface UserStore {
  users: User[];
  currentUser: User | null;
  token: string | null;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  addVolunteerSkills: (userId: string, skills: VolunteerSkill[]) => Promise<void>;
  updateVolunteerSkills: (userId: string, skills: VolunteerSkill[]) => Promise<void>;
  addAssistanceRequest: (userId: string, request: AssistanceRequest) => Promise<void>;
  removeAssistanceRequest: (userId: string, requestIndex: number) => Promise<void>;
  addTemporaryHousing: (userId: string, housing: TemporaryHousing) => Promise<void>;
  updateTemporaryHousing: (userId: string, housingId: string, updates: Partial<TemporaryHousing>) => Promise<void>;
  removeTemporaryHousing: (userId: string, housingId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null,
  token: localStorage.getItem('token'),
  
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  setUsers: (users) => set({ users }),
  
  addUser: async (user) => {
    try {
      const { user: newUser, token } = await userService.register(user);
      const newUserWithId = { ...newUser, id: newUser._id };
      localStorage.setItem('currentUser', JSON.stringify(newUserWithId));
      set((state) => ({ 
        users: [...state.users, newUserWithId],
        currentUser: newUserWithId,
        token
      }));
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const updatedUser = await userService.updateProfile(userId, updates);
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  addVolunteerSkills: async (userId, skills) => {
    try {
      const updatedUser = await userService.addVolunteerSkills(userId, skills);
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error adding volunteer skills:', error);
      throw error;
    }
  },

  updateVolunteerSkills: async (userId, skills) => {
    try {
      const updatedUser = await userService.updateProfile(userId, { skills });
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error updating volunteer skills:', error);
      throw error;
    }
  },

  addAssistanceRequest: async (userId, request) => {
    try {
      const updatedUser = await userService.addAssistanceRequest(userId, request);
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error adding assistance request:', error);
      throw error;
    }
  },

  removeAssistanceRequest: async (userId, requestIndex) => {
    try {
      const user = get().users.find(u => u._id === userId || u.id === userId);
      if (!user?.assistanceRequests) return;

      const updatedRequests = [...user.assistanceRequests];
      updatedRequests.splice(requestIndex, 1);
      
      const updatedUser = await userService.updateProfile(userId, {
        assistanceRequests: updatedRequests
      });
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error removing assistance request:', error);
      throw error;
    }
  },

  addTemporaryHousing: async (userId, housing) => {
    try {
      const updatedUser = await userService.addTemporaryHousing(userId, housing);
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));

      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error adding temporary housing:', error);
      throw error;
    }
  },

  updateTemporaryHousing: async (userId, housingId, updates) => {
    try {
      const user = get().users.find(u => u._id === userId || u.id === userId);
      if (!user?.temporaryHousing) return;

      const updatedHousing = user.temporaryHousing.map(h =>
        h.id === housingId ? { ...h, ...updates } : h
      );

      const updatedUser = await userService.updateProfile(userId, {
        temporaryHousing: updatedHousing
      });
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error updating temporary housing:', error);
      throw error;
    }
  },

  removeTemporaryHousing: async (userId, housingId) => {
    try {
      const user = get().users.find(u => u._id === userId || u.id === userId);
      if (!user?.temporaryHousing) return;

      const updatedHousing = user.temporaryHousing.filter(h => h.id !== housingId);
      
      const updatedUser = await userService.updateProfile(userId, {
        temporaryHousing: updatedHousing
      });
      const updatedUserWithId = { ...updatedUser, id: updatedUser._id };
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithId));
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUserWithId : user
        ),
        currentUser: state.currentUser?.id === userId ? updatedUserWithId : state.currentUser
      }));
    } catch (error) {
      console.error('Error removing temporary housing:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const { user, token } = await userService.login(email, password);
      const userWithId = { ...user, id: user._id };
      set({ 
        currentUser: userWithId,
        token
      });
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userWithId));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    set({ 
      currentUser: null,
      token: null
    });
  }
}));