import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapView } from './MapView';
import { Users, UserSearch, Filter, Car, MapPin, ChevronLeft, ChevronRight, Calendar, HandHeart, Home } from 'lucide-react';
import { CarpoolMap } from '../components/CarpoolMap';
import { CarpoolList } from '../components/CarpoolList';
import { CarpoolForm } from '../components/CarpoolForm';
import { AssistanceList } from '../components/AssistanceList';
import { AssistanceMap } from '../components/AssistanceMap';
import { VolunteerDirectory } from '../components/VolunteerDirectory';
import { TemporaryHousingList } from '../components/TemporaryHousingList';
import { TemporaryHousingMap } from '../components/TemporaryHousingMap';
import { TemporaryHousingForm } from '../components/TemporaryHousingForm';
import { DateRangePicker } from '../components/DateRangePicker';
import { VOLUNTEER_CATEGORIES, ASSISTANCE_CATEGORIES, VolunteerCategory, AssistanceCategory } from '../types';
import { useUserStore } from '../store/userStore';

type CarpoolViewType = 'list' | 'map';
type MapPointType = 'all' | 'origins' | 'destinations';
type AssistanceViewType = 'list' | 'map';
type VolunteerViewType = 'list' | 'map';
type HousingViewType = 'list' | 'map';
type CarpoolFilterType = 'all' | 'mine';

export function Dashboard() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useUserStore();
  const [volunteerCategories, setVolunteerCategories] = useState<Set<VolunteerCategory>>(new Set());
  const [seekerCategories, setSeekerCategories] = useState<Set<AssistanceCategory>>(new Set());
  const [carpoolView, setCarpoolView] = useState<CarpoolViewType>('list');
  const [assistanceView, setAssistanceView] = useState<AssistanceViewType>('list');
  const [volunteerView, setVolunteerView] = useState<VolunteerViewType>('list');
  const [housingView, setHousingView] = useState<HousingViewType>('list');
  const [showCarpoolForm, setShowCarpoolForm] = useState(false);
  const [showHousingForm, setShowHousingForm] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [assistanceDateRange, setAssistanceDateRange] = useState({
    start: '',
    end: ''
  });
  const [housingDateRange, setHousingDateRange] = useState({
    start: '',
    end: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssistanceDatePicker, setShowAssistanceDatePicker] = useState(false);
  const [showHousingDatePicker, setShowHousingDatePicker] = useState(false);
  const [mapPointType, setMapPointType] = useState<MapPointType>('all');
  const [activeTab, setActiveTab] = useState('assistance');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [carpoolFilter, setCarpoolFilter] = useState<CarpoolFilterType>('all');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'carpools') {
      setActiveTab('carpools');
    }
  }, [searchParams]);

  const handleAddHousing = async (data: any) => {
    try {
      await useUserStore.getState().addTemporaryHousing(currentUser!.id, data);
      setShowHousingForm(false);
    } catch (error) {
      console.error('Error adding housing:', error);
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'assistance':
        return (
          <div className="h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Solicitudes de Ayuda</h2>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setAssistanceView('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    assistanceView === 'list'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setAssistanceView('map')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    assistanceView === 'map'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Mapa
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-12rem)] overflow-y-auto">
              {assistanceView === 'list' ? (
                <AssistanceList
                  categories={seekerCategories}
                  dateRange={assistanceDateRange}
                />
              ) : (
                <div className="h-full bg-white rounded-lg shadow">
                  <AssistanceMap
                    categories={seekerCategories}
                    dateRange={assistanceDateRange}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'volunteers':
        return (
          <div className="h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Directorio de Voluntarios</h2>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setVolunteerView('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    volunteerView === 'list'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setVolunteerView('map')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    volunteerView === 'map'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Mapa
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-12rem)] overflow-y-auto">
              <VolunteerDirectory
                view={volunteerView}
                categories={volunteerCategories}
              />
            </div>
          </div>
        );

      case 'carpools':
        return (
          <div className="h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Viajes Compartidos</h2>
              <div className="flex space-x-4">
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setCarpoolView('list')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                      carpoolView === 'list'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setCarpoolView('map')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                      carpoolView === 'map'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Mapa
                  </button>
                </div>
                {currentUser && (
                  <>
                    <div className="flex rounded-md shadow-sm">
                      <button
                        onClick={() => setCarpoolFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                          carpoolFilter === 'all'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setCarpoolFilter('mine')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                          carpoolFilter === 'mine'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Mis Viajes
                      </button>
                    </div>
                    <button
                      onClick={() => setShowCarpoolForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Crear Viaje
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {showCarpoolForm ? (
              <div className="bg-white rounded-lg shadow p-4">
                <CarpoolForm onClose={() => setShowCarpoolForm(false)} />
              </div>
            ) : carpoolView === 'list' ? (
              <CarpoolList
                dateRange={dateRange}
                filter={carpoolFilter}
                userId={currentUser?.id}
              />
            ) : (
              <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow">
                <CarpoolMap 
                  dateRange={dateRange}
                  showType={mapPointType}
                  userId={currentUser?.id}
                />
              </div>
            )}
          </div>
        );

      case 'housing':
        return (
          <div className="h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Viviendas Temporales</h2>
              <div className="flex space-x-4">
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setHousingView('list')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                      housingView === 'list'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setHousingView('map')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                      housingView === 'map'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Mapa
                  </button>
                </div>
                {currentUser && (
                  <button
                    onClick={() => setShowHousingForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Ofrecer Vivienda
                  </button>
                )}
              </div>
            </div>

            {showHousingForm ? (
              <div className="bg-white rounded-lg shadow p-4">
                <TemporaryHousingForm
                  onSubmit={handleAddHousing}
                  onCancel={() => setShowHousingForm(false)}
                />
              </div>
            ) : housingView === 'list' ? (
              <TemporaryHousingList dateRange={housingDateRange} />
            ) : (
              <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow">
                <TemporaryHousingMap dateRange={housingDateRange} />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="h-full flex flex-row">
        {/* Sidebar */}
        <div className={`relative bg-white border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div className={`absolute top-0 right-0 translate-x-full bg-white rounded-r-lg border border-l-0 p-1 cursor-pointer`}
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <ChevronLeft className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
          </div>
          
          <div className={`h-full overflow-y-auto ${isSidebarOpen ? 'opacity-100 p-4' : 'opacity-0'}`}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Panel de Control</h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('assistance')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'assistance' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <HandHeart className="h-4 w-4" />
                  <span>Solicitudes de Ayuda</span>
                </button>
                <button
                  onClick={() => setActiveTab('volunteers')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'volunteers' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Directorio de Voluntarios</span>
                </button>
                <button
                  onClick={() => setActiveTab('carpools')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'carpools' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Car className="h-4 w-4" />
                  <span>Viajes Compartidos</span>
                </button>
                <button
                  onClick={() => setActiveTab('housing')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'housing' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Viviendas Temporales</span>
                </button>
              </div>

              {activeTab === 'housing' && (
                <div className="relative">
                  <button
                    onClick={() => setShowHousingDatePicker(!showHousingDatePicker)}
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {housingDateRange.start || housingDateRange.end
                          ? `${housingDateRange.start ? new Date(housingDateRange.start).toLocaleDateString() : 'Inicio'} - ${
                              housingDateRange.end ? new Date(housingDateRange.end).toLocaleDateString() : 'Fin'
                            }`
                          : 'Filtrar por fecha de disponibilidad'}
                      </span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transform transition-transform ${showHousingDatePicker ? 'rotate-90' : ''}`}
                    />
                  </button>
                  
                  {showHousingDatePicker && (
                    <div className="absolute z-10 mt-2 w-full">
                      <DateRangePicker
                        startDate={housingDateRange.start}
                        endDate={housingDateRange.end}
                        onChange={setHousingDateRange}
                        onClose={() => setShowHousingDatePicker(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}