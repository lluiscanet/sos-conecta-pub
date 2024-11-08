import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { AssistanceRequestForm } from './components/AssistanceRequestForm';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { AssistancePage } from './pages/AssistancePage';
import { VolunteersPage } from './pages/VolunteersPage';
import { CarpoolsPage } from './pages/CarpoolsPage';
import { HousingPage } from './pages/HousingPage';
import { useUserStore } from './store/userStore';
import { useCarpoolStore } from './store/carpoolStore';
import { userService } from './services/api';

function App() {
  const { setUsers } = useUserStore();
  const { fetchCarpools } = useCarpoolStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get all users with retry mechanism
        const retryGetUsers = async (attempts = 3) => {
          try {
            const users = await userService.getAllUsers();
            setUsers(users);
          } catch (error) {
            if (attempts > 1) {
              console.log(`Retrying users fetch... (${attempts - 1} attempts remaining)`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              return retryGetUsers(attempts - 1);
            }
            throw error;
          }
        };

        // Get all carpools with retry mechanism
        const retryGetCarpools = async (attempts = 3) => {
          try {
            await fetchCarpools();
          } catch (error) {
            if (attempts > 1) {
              console.log(`Retrying carpools fetch... (${attempts - 1} attempts remaining)`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              return retryGetCarpools(attempts - 1);
            }
            throw error;
          }
        };

        await Promise.all([
          retryGetUsers(),
          retryGetCarpools()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/request" element={<AssistanceRequestForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/assistance" element={<AssistancePage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
            <Route path="/carpools" element={<CarpoolsPage />} />
            <Route path="/housing" element={<HousingPage />} />
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;