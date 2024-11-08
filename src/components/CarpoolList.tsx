import React, { useState } from 'react';
import { Car, Calendar, MapPin, Users, ChevronRight, Trash2, UserMinus, Mail, Phone } from 'lucide-react';
import { useCarpoolStore } from '../store/carpoolStore';
import { useUserStore } from '../store/userStore';
import { Pagination } from './Pagination';
import type { Carpool, User } from '../types';

const ITEMS_PER_PAGE = 25;

interface CarpoolListProps {
  dateRange: {
    start: string;
    end: string;
  };
  filter: 'all' | 'mine';
  userId?: string;
}

// Function to extract timestamp from MongoDB ObjectId
const getTimestampFromId = (id: string): number => {
  // If it's a valid MongoDB ObjectId (24 hex chars), extract timestamp
  if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
    return parseInt(id.substring(0, 8), 16) * 1000;
  }
  // Return a default timestamp for non-MongoDB IDs
  return 0;
};

export function CarpoolList({ dateRange, filter, userId }: CarpoolListProps) {
  const [selectedCarpool, setSelectedCarpool] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const carpools = useCarpoolStore(state => state.carpools);
  const { users, currentUser } = useUserStore();
  const { joinCarpool, leaveCarpool } = useCarpoolStore();

  // Ensure carpools and users are arrays before processing
  const carpoolsList = Array.isArray(carpools) ? carpools : [];
  const usersList = Array.isArray(users) ? users : [];

  const filteredCarpools = carpoolsList
    .filter(carpool => {
      // Date filter
      const departureTime = new Date(carpool.departureTime);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;

      if (start && departureTime < start) return false;
      if (end && departureTime > end) return false;

      // User filter
      if (filter === 'mine' && userId) {
        const carpoolId = carpool._id || carpool.id;
        const userMatches = userId === carpool.driverId || 
                          (carpool.currentPassengers && carpool.currentPassengers.includes(userId));
        return userMatches;
      }

      return true;
    })
    // Sort by departure time (most recent first)
    .sort((a, b) => {
      // First try to sort by departure time
      const timeA = new Date(a.departureTime).getTime();
      const timeB = new Date(b.departureTime).getTime();
      if (timeA !== timeB) return timeB - timeA;

      // If departure times are equal, sort by creation time
      const timestampA = getTimestampFromId(a._id || a.id);
      const timestampB = getTimestampFromId(b._id || b.id);
      return timestampB - timestampA;
    });

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredCarpools.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCarpools = filteredCarpools.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleJoinCarpool = async (carpoolId: string) => {
    if (!currentUser) {
      alert('Debe iniciar sesión para unirse a un viaje');
      return;
    }

    try {
      const success = await joinCarpool(carpoolId, currentUser._id);
      if (!success) {
        alert('No se pudo unir al viaje. Por favor, inténtelo de nuevo.');
      }
    } catch (error) {
      console.error('Error joining carpool:', error);
      alert('Error al unirse al viaje');
    }
  };

  const handleLeaveCarpool = async (carpoolId: string, userId: string) => {
    try {
      await leaveCarpool(carpoolId, userId);
    } catch (error) {
      console.error('Error leaving carpool:', error);
      alert('Error al abandonar el viaje');
    }
  };

  const handleDeleteCarpool = async (carpoolId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este viaje?')) {
      try {
        await useCarpoolStore.getState().deleteCarpool(carpoolId);
      } catch (error) {
        console.error('Error deleting carpool:', error);
        alert('Error al eliminar el viaje');
      }
    }
  };

  if (!carpoolsList.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando viajes compartidos...</p>
      </div>
    );
  }

  if (filteredCarpools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay viajes compartidos que coincidan con los filtros seleccionados.</p>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col min-h-[calc(100vh-16rem)]">
      <div className="divide-y divide-gray-200 flex-grow">
        {paginatedCarpools.map((carpool) => {
          const carpoolId = carpool._id || carpool.id;
          const driver = usersList.find(u => u._id === carpool.driverId);
          const passengers = usersList.filter(u => 
            carpool.currentPassengers?.includes(u._id)
          );
          const isDriver = currentUser && currentUser._id === carpool.driverId;
          const isPassenger = currentUser && carpool.currentPassengers?.includes(currentUser._id);
          const canJoin = currentUser && !isDriver && !isPassenger && 
                         carpool.currentPassengers && 
                         carpool.currentPassengers.length < carpool.maxPassengers;

          return (
            <div key={carpoolId} className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedCarpool(selectedCarpool === carpoolId ? null : carpoolId)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{driver?.name}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Conductor
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDateTime(carpool.departureTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{carpool.currentPassengers?.length || 0}/{carpool.maxPassengers}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-500">
                        <p>Desde: {carpool.origin.address}</p>
                        <p>Hasta: {carpool.destination.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight 
                  className={`h-5 w-5 text-gray-400 transform transition-transform ${
                    selectedCarpool === carpoolId ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {selectedCarpool === carpoolId && (
                <div className="mt-4 pl-8 border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Pasajeros:</h4>
                    {isDriver && (
                      <button
                        onClick={() => handleDeleteCarpool(carpoolId)}
                        className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar Viaje
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {passengers.map((passenger) => (
                      <div key={passenger._id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">{passenger.name}</p>
                          {isDriver && (
                            <>
                              {passenger.email && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {passenger.email}
                                </p>
                              )}
                              {passenger.phone && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {passenger.phone}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        {isDriver && (
                          <button
                            onClick={() => handleLeaveCarpool(carpoolId, passenger._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar pasajero"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {passengers.length === 0 && (
                      <p className="text-sm text-gray-500">No hay pasajeros registrados</p>
                    )}
                  </div>
                  {canJoin && (
                    <button
                      onClick={() => handleJoinCarpool(carpoolId)}
                      className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Unirme al viaje
                    </button>
                  )}
                  {isPassenger && (
                    <button
                      onClick={() => handleLeaveCarpool(carpoolId, currentUser._id)}
                      className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Abandonar viaje
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCarpools.length > ITEMS_PER_PAGE && (
        <div className="border-t border-gray-200 px-4 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}