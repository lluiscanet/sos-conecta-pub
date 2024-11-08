import React, { useState } from 'react';
import { Calendar, Users, MapPin, Home, User, Mail } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { Pagination } from './Pagination';
import { TemporaryHousing } from '../types';

const ITEMS_PER_PAGE = 25;

interface TemporaryHousingListProps {
  dateRange: {
    start: string;
    end: string;
  };
  filter: 'all' | 'mine';
  userId?: string;
  occupancyRange: {
    min: number;
    max: number;
  };
  sharedOnly: boolean;
  privateOnly: boolean;
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

export function TemporaryHousingList({
  dateRange,
  filter,
  userId,
  occupancyRange,
  sharedOnly,
  privateOnly
}: TemporaryHousingListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { users, currentUser } = useUserStore();

  // Handle case where users is not yet loaded
  if (!Array.isArray(users)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando viviendas temporales...</p>
      </div>
    );
  }

  const allHousing = users.reduce<Array<{
    housing: TemporaryHousing;
    owner: typeof users[0];
  }>>((acc, user) => {
    if (!user?.temporaryHousing?.length) return acc;
    return [
      ...acc,
      ...user.temporaryHousing.map(housing => ({
        housing,
        owner: user
      }))
    ];
  }, []);

  const filteredHousing = allHousing
    .filter(({ housing, owner }) => {
      // Filter by date range
      if (dateRange.start || dateRange.end) {
        const startDate = new Date(housing.startDate);
        const endDate = new Date(housing.endDate);
        const filterStart = dateRange.start ? new Date(dateRange.start) : null;
        const filterEnd = dateRange.end ? new Date(dateRange.end) : null;

        if (filterStart && endDate < filterStart) return false;
        if (filterEnd && startDate > filterEnd) return false;
      }

      // Filter by user's own housing
      if (filter === 'mine' && userId && owner._id !== userId && owner.id !== userId) return false;

      // Filter by occupancy
      if (housing.maxOccupancy < occupancyRange.min || housing.maxOccupancy > occupancyRange.max) return false;

      // Filter by space type
      if (sharedOnly && !housing.isShared) return false;
      if (privateOnly && housing.isShared) return false;

      // Only show available housing
      return housing.status === 'available';
    })
    // Sort by creation time first, then by start date if timestamps are equal
    .sort((a, b) => {
      // First try to sort by creation time (using ObjectId timestamp)
      const timestampA = getTimestampFromId(a.owner._id || a.owner.id);
      const timestampB = getTimestampFromId(b.owner._id || b.owner.id);
      
      if (timestampA !== timestampB) {
        return timestampB - timestampA; // Most recent first
      }
      
      // If creation times are equal, sort by start date
      const startDateA = new Date(a.housing.startDate).getTime();
      const startDateB = new Date(b.housing.startDate).getTime();
      return startDateA - startDateB; // Earlier availability dates first
    });

  const totalPages = Math.ceil(filteredHousing.length / ITEMS_PER_PAGE);
  const paginatedHousing = filteredHousing.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (filteredHousing.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay viviendas temporales disponibles que coincidan con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedHousing.map(({ housing, owner }) => (
        <div
          key={housing.id}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Home className={`h-5 w-5 mr-2 ${housing.isShared ? 'text-orange-500' : 'text-red-500'}`} />
                {housing.isShared ? 'Espacio Compartido' : 'Vivienda Completa'}
              </h3>
              <div className="mt-2 space-y-2">
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {housing.location.address}
                </p>
                <p className="text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(housing.startDate).toLocaleDateString()} - {new Date(housing.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Capacidad: {housing.maxOccupancy} personas
                </p>
                <div className="space-y-1">
                  <p className="text-gray-600 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Ofrecido por: {owner.name}
                  </p>
                  {currentUser && owner.email && (
                    <p className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {owner.email}
                    </p>
                  )}
                </div>
              </div>
              {housing.description && (
                <p className="mt-3 text-gray-600">{housing.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {filteredHousing.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}