import { useUserStore } from '../store/userStore';
import { User } from '../types';

export interface Stats {
  volunteers: number;
  assistanceRequests: number;
  temporaryHousing: number;
}

export function useStats(): Stats {
  const { users } = useUserStore();

  if (!Array.isArray(users)) {
    return {
      volunteers: 0,
      assistanceRequests: 0,
      temporaryHousing: 0
    };
  }

  return {
    volunteers: users.filter((user: User) => 
      Array.isArray(user?.roles) && user.roles.includes('voluntario')
    ).length,
    
    assistanceRequests: users.reduce((total: number, user: User) => 
      total + (Array.isArray(user?.assistanceRequests) ? user.assistanceRequests.length : 0), 
    0),
    
    temporaryHousing: users.reduce((total: number, user: User) => 
      total + (Array.isArray(user?.temporaryHousing) ? user.temporaryHousing.length : 0), 
    0)
  };
}