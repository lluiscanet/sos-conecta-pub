import axios from 'axios';

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  validateStatus: (status) => status >= 200 && status < 500,
  maxRedirects: 5,
  maxContentLength: 50 * 1000 * 1000, // 50MB
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(new Error('Failed to setup request'));
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired - please login again'));
    }

    if (error.response) {
      // Server responded with error status
      const errorMessage =
        error.response.data?.message || error.response.data?.error || 'Server error occurred';
      console.error('API Error:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('Request timeout:', error.message);
      return Promise.reject(new Error('Request timed out - please try again'));
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      return Promise.reject(
        new Error('Network error - please check your connection')
      );
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
      return Promise.reject(new Error('Failed to make request'));
    }
  }
);

// Retry mechanism for failed requests
const retryRequest = async (
  fn: () => Promise<any>,
  retries = 3,
  delay = 1000
) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

export const userService = {
  getAllUsers: async () => {
    return retryRequest(async () => {
      try {
        const response = await api.get('/users');
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    });
  },

  register: async (userData: any) => {
    return retryRequest(async () => {
      try {
        const response = await api.post('/users/register', userData);
        return {
          user: response.data.user,
          token: response.data.token,
        };
      } catch (error) {
        console.error('Error registering user:', error);
        throw error;
      }
    });
  },

  login: async (email: string, password: string) => {
    return retryRequest(async () => {
      try {
        const response = await api.post('/users/login', { email, password });
        return {
          user: response.data.user,
          token: response.data.token,
        };
      } catch (error) {
        console.error('Error logging in:', error);
        throw error;
      }
    });
  },

  updateProfile: async (userId: string, updates: any) => {
    return retryRequest(async () => {
      try {
        const response = await api.patch(`/users/${userId}`, updates);
        return response.data;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    });
  },

  addVolunteerSkills: async (userId: string, skills: any) => {
    return retryRequest(async () => {
      try {
        const response = await api.post(`/users/${userId}/skills`, { skills });
        return response.data;
      } catch (error) {
        console.error('Error adding volunteer skills:', error);
        throw error;
      }
    });
  },

  addAssistanceRequest: async (userId: string, request: any) => {
    return retryRequest(async () => {
      try {
        const response = await api.post(`/users/${userId}/assistance`, request);
        return response.data;
      } catch (error) {
        console.error('Error adding assistance request:', error);
        throw error;
      }
    });
  },

  addTemporaryHousing: async (userId: string, housing: any) => {
    return retryRequest(async () => {
      try {
        const response = await api.post(`/users/${userId}/housing`, housing);
        return response.data;
      } catch (error) {
        console.error('Error adding temporary housing:', error);
        throw error;
      }
    });
  },
};

export const carpoolService = {
  create: async (carpoolData: any) => {
    return retryRequest(async () => {
      try {
        const response = await api.post('/carpools', carpoolData);
        return response.data;
      } catch (error) {
        console.error('Error creating carpool:', error);
        throw error;
      }
    });
  },

  getAll: async () => {
    return retryRequest(async () => {
      try {
        const response = await api.get('/carpools');
        return response.data;
      } catch (error) {
        console.error('Error fetching carpools:', error);
        throw error;
      }
    });
  },

  join: async (carpoolId: string, userId: string) => {
    return retryRequest(async () => {
      try {
        const response = await api.post(`/carpools/${carpoolId}/join`, {
          userId,
        });
        return response.data;
      } catch (error) {
        console.error('Error joining carpool:', error);
        throw error;
      }
    });
  },

  leave: async (carpoolId: string, userId: string) => {
    return retryRequest(async () => {
      try {
        const response = await api.post(`/carpools/${carpoolId}/leave`, {
          userId,
        });
        return response.data;
      } catch (error) {
        console.error('Error leaving carpool:', error);
        throw error;
      }
    });
  },

  delete: async (carpoolId: string) => {
    return retryRequest(async () => {
      try {
        const response = await api.delete(`/carpools/${carpoolId}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting carpool:', error);
        throw error;
      }
    }, 3, 2000); // Increased delay between retries for deletion
  },
};