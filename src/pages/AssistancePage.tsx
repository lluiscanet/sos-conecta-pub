import React, { useState, useEffect } from 'react';
import { HandHeart, ChevronLeft, ChevronRight, Calendar, Filter, User, Plus } from 'lucide-react';
import { AssistanceList } from '../components/AssistanceList';
import { AssistanceMap } from '../components/AssistanceMap';
import { DateRangePicker } from '../components/DateRangePicker';
import { AssistanceCategory, ASSISTANCE_CATEGORIES } from '../types';
import { useUserStore } from '../store/userStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/api';

type AssistanceViewType = 'list' | 'map';

export function AssistancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, setUsers } = useUserStore();
  const [view, setView] = useState<AssistanceViewType>('list');
  const [categories, setCategories] = useState<Set<AssistanceCategory>>(new Set());
  const [subcategories, setSubcategories] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMyRequests, setShowMyRequests] = useState(false);
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
  }, [setUsers, refreshKey]); // Add refreshKey to dependencies

  const handleCategoryChange = (category: AssistanceCategory) => {
    const newCategories = new Set(categories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
      // Remove all subcategories of this category
      const newSubcategories = new Set(subcategories);
      Object.keys(ASSISTANCE_CATEGORIES[category].subcategories).forEach(sub => {
        newSubcategories.delete(sub);
      });
      setSubcategories(newSubcategories);
    } else {
      newCategories.add(category);
    }
    setCategories(newCategories);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    const newSubcategories = new Set(subcategories);
    if (newSubcategories.has(subcategory)) {
      newSubcategories.delete(subcategory);
    } else {
      newSubcategories.add(subcategory);
    }
    setSubcategories(newSubcategories);
  };

  const clearFilters = () => {
    setCategories(new Set());
    setSubcategories(new Set());
    setDateRange({ start: '', end: '' });
    setShowMyRequests(false);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading assistance requests...</p>
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
            onClick={handleRefresh}
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
                      checked={showMyRequests}
                      onChange={(e) => setShowMyRequests(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Mis solicitudes
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
                          : 'Filtrar por fecha'}
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
                  <h4 className="font-medium text-sm text-gray-900">Categorías</h4>
                  {Object.entries(ASSISTANCE_CATEGORIES).map(([key, category]) => {
                    const isSelected = categories.has(key as AssistanceCategory);
                    return (
                      <div key={key} className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCategoryChange(key as AssistanceCategory)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{category.label}</span>
                        </label>

                        {isSelected && (
                          <div className="ml-6 space-y-2">
                            {Object.entries(category.subcategories).map(([subKey, subLabel]) => (
                              <label key={subKey} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={subcategories.has(subKey)}
                                  onChange={() => handleSubcategoryChange(subKey)}
                                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-600">{subLabel}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                <HandHeart className="h-5 w-5 mr-2" />
                Solicitudes de Ayuda
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
                {currentUser && (
                  <button
                    onClick={() => navigate('/request')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Solicitud
                  </button>
                )}
              </div>
            </div>

            <div className="h-[calc(100vh-12rem)]">
              {view === 'list' ? (
                <AssistanceList
                  categories={categories}
                  subcategories={subcategories}
                  dateRange={dateRange}
                  userId={showMyRequests ? currentUser?.id : undefined}
                />
              ) : (
                <div className="h-full bg-white rounded-lg shadow">
                  <AssistanceMap
                    categories={categories}
                    subcategories={subcategories}
                    dateRange={dateRange}
                    userId={showMyRequests ? currentUser?.id : undefined}
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