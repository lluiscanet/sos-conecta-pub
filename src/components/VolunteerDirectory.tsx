import React, { useState } from 'react';
import { MapPin, Phone, Mail, Users } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { VOLUNTEER_CATEGORIES, VolunteerCategory, User } from '../types';
import { Pagination } from './Pagination';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ITEMS_PER_PAGE = 25;

interface VolunteerDirectoryProps {
  view: 'list' | 'map';
  categories: Set<VolunteerCategory>;
  subcategories: Set<string>;
  experiencedOnly: boolean;
}

const isValidLocation = (location: any): boolean => {
  return (
    location &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
};

// Function to extract timestamp from MongoDB ObjectId
const getTimestampFromId = (id: string): number => {
  // If it's a valid MongoDB ObjectId (24 hex chars), extract timestamp
  if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
    return parseInt(id.substring(0, 8), 16) * 1000;
  }
  // Return a default timestamp for non-MongoDB IDs
  return 0;
};

export function VolunteerDirectory({ view, categories, subcategories, experiencedOnly }: VolunteerDirectoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [popupInfo, setPopupInfo] = useState<User | null>(null);
  const { users } = useUserStore();

  // Ensure users is an array before processing
  const usersList = Array.isArray(users) ? users : [];

  // Base volunteer filtering
  const volunteers = usersList.filter(user => {
    if (!user?.roles?.includes('voluntario') || !user?.skills?.length) return false;

    // Filter by categories
    if (categories.size > 0) {
      const hasMatchingCategory = user.skills.some(skill => categories.has(skill.category));
      if (!hasMatchingCategory) return false;
    }

    // Filter by subcategories
    if (subcategories.size > 0) {
      const hasMatchingSubcategory = user.skills.some(skill =>
        skill.subcategories.some(sub => subcategories.has(sub))
      );
      if (!hasMatchingSubcategory) return false;
    }

    // Filter by experience
    if (experiencedOnly) {
      const hasExperience = user.skills.some(skill => skill.hasExperience);
      if (!hasExperience) return false;
    }

    // For map view, require valid coordinates
    if (view === 'map' && !isValidLocation(user.location)) {
      return false;
    }

    return true;
  })
  // Sort by recency (most recent first)
  .sort((a, b) => {
    const timestampA = getTimestampFromId(a._id || a.id);
    const timestampB = getTimestampFromId(b._id || b.id);
    return timestampB - timestampA;
  });

  const totalPages = Math.ceil(volunteers.length / ITEMS_PER_PAGE);
  const paginatedVolunteers = volunteers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!usersList.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando directorio de voluntarios...</p>
      </div>
    );
  }

  if (volunteers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {view === 'map' 
            ? 'No hay voluntarios con ubicación disponible que coincidan con los filtros seleccionados.'
            : 'No se encontraron voluntarios que coincidan con los filtros seleccionados.'}
        </p>
      </div>
    );
  }

  if (view === 'map') {
    return (
      <div className="h-[calc(100vh-12rem)] bg-white rounded-lg shadow relative">
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

          {volunteers.map((volunteer) => (
            <Marker
              key={volunteer.id || volunteer._id}
              latitude={volunteer.location!.latitude}
              longitude={volunteer.location!.longitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(volunteer);
              }}
            >
              <MapPin className="h-6 w-6 text-green-500" />
            </Marker>
          ))}

          {popupInfo?.location && (
            <Popup
              anchor="top"
              latitude={popupInfo.location.latitude}
              longitude={popupInfo.location.longitude}
              onClose={() => setPopupInfo(null)}
              className="min-w-[200px]"
            >
              <div className="p-2">
                <h3 className="font-semibold text-lg">{popupInfo.name}</h3>
                {popupInfo.skills?.map((skill, index) => {
                  // Filter by categories and subcategories
                  if (categories.size > 0 && !categories.has(skill.category)) return null;
                  if (subcategories.size > 0 && !skill.subcategories.some(sub => subcategories.has(sub))) return null;
                  if (experiencedOnly && !skill.hasExperience) return null;

                  return (
                    <div key={index} className="mt-2">
                      <p className="text-sm font-medium">{VOLUNTEER_CATEGORIES[skill.category].label}</p>
                      <ul className="mt-1 space-y-1">
                        {skill.subcategories.map(sub => (
                          <li key={sub} className="text-sm text-gray-600">
                            • {VOLUNTEER_CATEGORIES[skill.category].subcategories[sub]}
                            {skill.hasExperience && ' (Con experiencia)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                {popupInfo.phone && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {popupInfo.phone}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">{popupInfo.location.address}</p>
                {popupInfo.location.radius && (
                  <p className="text-xs text-gray-500">
                    Radio de servicio: {popupInfo.location.radius}km
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedVolunteers.map((volunteer) => (
        <div
          key={volunteer.id || volunteer._id}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{volunteer.name}</h3>
              <div className="mt-1 space-y-1">
                {volunteer.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {volunteer.phone}
                  </p>
                )}
                {volunteer.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {volunteer.email}
                  </p>
                )}
                {volunteer.location && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {volunteer.location.address}
                    {volunteer.location.radius && (
                      <span className="ml-1">
                        (Radio: {volunteer.location.radius}km)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {volunteer.skills && (
            <div className="mt-4 space-y-3">
              {volunteer.skills
                .filter(skill => {
                  // Filter by categories
                  if (categories.size > 0 && !categories.has(skill.category)) return false;
                  // Filter by subcategories
                  if (subcategories.size > 0 && !skill.subcategories.some(sub => subcategories.has(sub))) return false;
                  // Filter by experience
                  if (experiencedOnly && !skill.hasExperience) return false;
                  return true;
                })
                .map((skill, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium">{VOLUNTEER_CATEGORIES[skill.category].label}</p>
                    <ul className="mt-1 space-y-1">
                      {skill.subcategories.map(sub => (
                        <li key={sub} className="text-sm text-gray-600">
                          • {VOLUNTEER_CATEGORIES[skill.category].subcategories[sub]}
                          {skill.hasExperience && ' (Con experiencia)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}

      {volunteers.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}