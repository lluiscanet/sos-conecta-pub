import React, { useState, useEffect } from 'react';
import { Home, ChevronLeft, ChevronRight, Calendar, Filter, Users, User } from 'lucide-react';
import { TemporaryHousingList } from '../components/TemporaryHousingList';
import { TemporaryHousingMap } from '../components/TemporaryHousingMap';
import { TemporaryHousingForm } from '../components/TemporaryHousingForm';
import { DateRangePicker } from '../components/DateRangePicker';
import { useUserStore } from '../store/userStore';
import { userService } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

type HousingViewType = 'list' | 'map';
type HousingFilterType = 'all' | 'mine';

export function HousingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setUsers } = useUserStore();
  const [view, setView] = useState<HousingViewType>('map');
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filter, setFilter] = useState<HousingFilterType>('all');
  const [occupancyRange, setOccupancyRange] = useState({
    min: 1,
    max: 10
  });
  const [sharedOnly, setSharedOnly] = useState(false);
  const [privateOnly, setPrivateOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Increment refresh key on location changes
    setRefreshKey(prev => prev + 1);
  }, [location]);

  useEffect(() => {
    const fetchLatestData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const users = await userService.getAllUsers();
        setUsers(users);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error loading data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestData();
  }, [setUsers, refreshKey]);

  const handleAddHousing = async (data: any) => {
    try {
      await useUserStore.getState().addTemporaryHousing(currentUser!.id, data);
      setShowForm(false);
      setRefreshKey(prev => prev + 1); // Refresh data after successful submission
    } catch (error) {
      console.error('Error adding housing:', error);
      setError('Error adding housing. Please try again.');
    }
  };

  const handleCreateHousing = () => {
    if (!currentUser) {
      if (confirm('Debe iniciar sesión para ofrecer una vivienda temporal. ¿Desea iniciar sesión ahora?')) {
        navigate('/register');
      }
      return;
    }
    setShowForm(true);
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setFilter('all');
    setOccupancyRange({ min: 1, max: 10 });
    setSharedOnly(false);
    setPrivateOnly(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading housing listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="h-full flex flex-row">
        {/* Filter Sidebar */}
        <div className={`relative bg-white border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div
            className="absolute top-0 right-0 translate-x-full bg-white rounded-r-lg border border-l-0 p-1 cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </div>

          <div className={`h-full overflow-y-auto ${isSidebarOpen ? 'opacity-100 p-4' : 'opacity-0'}`}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtros
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Limpiar
                  </button>
                </h3>
              </div>

              {currentUser && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filter === 'mine'}
                      onChange={(e) => setFilter(e.target.checked ? 'mine' : 'all')}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Mis viviendas
                    </span>
                  </label>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {dateRange.start || dateRange.end
                          ? `${dateRange.start ? new Date(dateRange.start).toLocaleDateString() : 'Inicio'} - ${
                              dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'Fin'
                            }`
                          : 'Filtrar por disponibilidad'}
                      </span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transform transition-transform ${showDatePicker ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {showDatePicker && (
                    <div className="absolute z-10 mt-2 w-full">
                      <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={setDateRange}
                        onClose={() => setShowDatePicker(false)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Capacidad</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm text-gray-600">Mínimo de personas</label>
                        <input
                          type="number"
                          min="1"
                          max={occupancyRange.max}
                          value={occupancyRange.min}
                          onChange={(e) => setOccupancyRange(prev => ({
                            ...prev,
                            min: Math.max(1, parseInt(e.target.value) || 1)
                          }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">Máximo de personas</label>
                        <input
                          type="number"
                          min={occupancyRange.min}
                          value={occupancyRange.max}
                          onChange={(e) => setOccupancyRange(prev => ({
                            ...prev,
                            max: Math.max(prev.min, parseInt(e.target.value) || prev.min)
                          }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tipo de espacio</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={sharedOnly}
                          onChange={(e) => {
                            setSharedOnly(e.target.checked);
                            if (e.target.checked) setPrivateOnly(false);
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Solo espacios compartidos</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={privateOnly}
                          onChange={(e) => {
                            setPrivateOnly(e.target.checked);
                            if (e.target.checked) setSharedOnly(false);
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Solo viviendas completas</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Viviendas Temporales
              </h2>
              <div className="flex space-x-4">
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setView('list')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                      view === 'list'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setView('map')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                      view === 'map'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Mapa
                  </button>
                </div>
                <button
                  onClick={handleCreateHousing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ofrecer Vivienda
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-12rem)]">
              {showForm ? (
                <div className="bg-white rounded-lg shadow p-4">
                  <TemporaryHousingForm
                    onSubmit={handleAddHousing}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              ) : view === 'list' ? (
                <TemporaryHousingList
                  dateRange={dateRange}
                  filter={filter}
                  userId={currentUser?.id}
                  occupancyRange={occupancyRange}
                  sharedOnly={sharedOnly}
                  privateOnly={privateOnly}
                  refreshKey={refreshKey}
                />
              ) : (
                <div className="h-full bg-white rounded-lg shadow">
                  <TemporaryHousingMap
                    dateRange={dateRange}
                    filter={filter}
                    userId={currentUser?.id}
                    occupancyRange={occupancyRange}
                    sharedOnly={sharedOnly}
                    privateOnly={privateOnly}
                    refreshKey={refreshKey}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}