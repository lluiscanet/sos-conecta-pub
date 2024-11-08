import React, { useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { MapPin, Calendar, Users, Home, User, Mail } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { TemporaryHousing } from '../types';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface TemporaryHousingMapProps {
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

export function TemporaryHousingMap({
  dateRange,
  filter,
  userId,
  occupancyRange,
  sharedOnly,
  privateOnly
}: TemporaryHousingMapProps) {
  const [popupInfo, setPopupInfo] = useState<{
    housing: TemporaryHousing;
    owner: any;
  } | null>(null);
  const { users, currentUser } = useUserStore();

  // Ensure users is always an array
  const usersList = Array.isArray(users) ? users : [];

  const availableHousing = usersList.reduce<Array<{
    housing: TemporaryHousing;
    owner: typeof usersList[0];
  }>>((acc, user) => {
    if (!user.temporaryHousing?.length) return acc;
    return [
      ...acc,
      ...user.temporaryHousing
        .filter(housing => {
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
          if (filter === 'mine' && userId  && user._id !== userId && user.id !== userId) return false;

          // Filter by occupancy
          if (housing.maxOccupancy < occupancyRange.min || housing.maxOccupancy > occupancyRange.max) return false;

          // Filter by space type
          if (sharedOnly && !housing.isShared) return false;
          if (privateOnly && housing.isShared) return false;

          // Only show available housing
          return housing.status === 'available';
        })
        .map(housing => ({
          housing,
          owner: user
        }))
    ];
  }, []);

  return (
    <Map
      initialViewState={{
        latitude: 39.4699,
        longitude: -0.3763,
        zoom: 12
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />

      {availableHousing.map(({ housing, owner }) => (
        <Marker
          key={housing.id}
          latitude={housing.location.latitude}
          longitude={housing.location.longitude}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setPopupInfo({ housing, owner });
          }}
        >
          <Home className={`h-6 w-6 ${housing.isShared ? 'text-orange-500' : 'text-red-500'}`} />
        </Marker>
      ))}

      {popupInfo && (
        <Popup
          anchor="top"
          latitude={popupInfo.housing.location.latitude}
          longitude={popupInfo.housing.location.longitude}
          onClose={() => setPopupInfo(null)}
          className="min-w-[250px]"
        >
          <div className="p-2">
            <h3 className="font-semibold text-lg flex items-center">
              <Home className={`h-4 w-4 mr-1 ${popupInfo.housing.isShared ? 'text-orange-500' : 'text-red-500'}`} />
              {popupInfo.housing.isShared ? 'Espacio Compartido' : 'Vivienda Completa'}
            </h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {popupInfo.housing.location.address}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(popupInfo.housing.startDate).toLocaleDateString()} - {new Date(popupInfo.housing.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Capacidad: {popupInfo.housing.maxOccupancy} personas
              </p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Ofrecido por: {popupInfo.owner.name}
                </p>
                {currentUser && popupInfo.owner.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {popupInfo.owner.email}
                  </p>
                )}
              </div>
              {popupInfo.housing.description && (
                <p className="text-sm text-gray-600 mt-2">{popupInfo.housing.description}</p>
              )}
            </div>
          </div>
        </Popup>
      )}

      <div className="absolute bottom-8 left-8 bg-white px-3 py-2 rounded-lg shadow-lg text-xs">
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <Home className="h-3 w-3 text-red-500" />
            <span>Vivienda Completa</span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="h-3 w-3 text-orange-500" />
            <span>Espacio Compartido</span>
          </div>
        </div>
      </div>
    </Map>
  );
}