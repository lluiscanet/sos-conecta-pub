import React, { useState } from 'react';
import { Car, ChevronLeft, ChevronRight, Calendar, Filter, User } from 'lucide-react';
import { CarpoolMap } from '../components/CarpoolMap';
import { CarpoolList } from '../components/CarpoolList';
import { CarpoolForm } from '../components/CarpoolForm';
import { DateRangePicker } from '../components/DateRangePicker';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';

type CarpoolViewType = 'list' | 'map';
type MapPointType = 'all' | 'origins' | 'destinations';
type CarpoolFilterType = 'all' | 'mine';

export function CarpoolsPage() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const [view, setView] = useState<CarpoolViewType>('map');
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mapPointType, setMapPointType] = useState<MapPointType>('all');
  const [filter, setFilter] = useState<CarpoolFilterType>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleCreateCarpool = () => {
    if (!currentUser) {
      if (confirm('Debe iniciar sesión para crear un viaje compartido. ¿Desea iniciar sesión ahora?')) {
        navigate('/register');
      }
      return;
    }
    setShowForm(true);
  };

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
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setFilter('all');
                    }}
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
                      Mis viajes
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

                {view === 'map' && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Mostrar en el mapa</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={mapPointType === 'all'}
                          onChange={() => setMapPointType('all')}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Todos los puntos</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={mapPointType === 'origins'}
                          onChange={() => setMapPointType('origins')}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Solo orígenes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={mapPointType === 'destinations'}
                          onChange={() => setMapPointType('destinations')}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Solo destinos</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Viajes Compartidos
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
                  onClick={handleCreateCarpool}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Crear Viaje
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-12rem)]">
              {showForm ? (
                <div className="bg-white rounded-lg shadow p-4">
                  <CarpoolForm onClose={() => setShowForm(false)} />
                </div>
              ) : view === 'list' ? (
                <CarpoolList
                  dateRange={dateRange}
                  filter={filter}
                  userId={currentUser?.id}
                />
              ) : (
                <div className="h-full bg-white rounded-lg shadow">
                  <CarpoolMap 
                    dateRange={dateRange}
                    showType={mapPointType}
                    userId={currentUser?.id}
                    filter={filter}
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