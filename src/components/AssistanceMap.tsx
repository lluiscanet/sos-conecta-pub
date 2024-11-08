import React, { useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { MapPin, Phone, AlertCircle, Mail } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { ASSISTANCE_CATEGORIES } from '../types';
import type { AssistanceCategory } from '../types';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface AssistanceMapProps {
  categories: Set<AssistanceCategory>;
  subcategories: Set<string>;
  dateRange: {
    start: string;
    end: string;
  };
  userId?: string;
}

export function AssistanceMap({ categories, subcategories, dateRange, userId }: AssistanceMapProps) {
  const [popupInfo, setPopupInfo] = useState<User | null>(null);
  const currentUser = useUserStore(state => state.currentUser);
  const users = useUserStore(state => state.users);

  const filteredUsers = users.filter(user => {
    if (!user.assistanceRequests?.length || !user.location) return false;

    // Filter by user if specified
    // Compare both _id and id to handle MongoDB IDs
    if (userId && user._id !== userId && user.id !== userId) return false;

    return user.assistanceRequests.some(request => {
      // Filter by categories
      if (categories.size > 0 && !categories.has(request.category)) {
        return false;
      }

      // Filter by subcategories if any are selected
      if (subcategories.size > 0 && !request.subcategories.some(sub => subcategories.has(sub))) {
        return false;
      }

      // Filter by date range
      if (dateRange.start || dateRange.end) {
        const requestDate = new Date(request.createdAt);
        if (dateRange.start && requestDate < new Date(dateRange.start)) return false;
        if (dateRange.end && requestDate > new Date(dateRange.end)) return false;
      }

      return true;
    });
  });

  const canViewContactDetails = !!currentUser;

  return (
    <Map
      initialViewState={{
        latitude: 39.4699,
        longitude: -0.3763,
        zoom: 13
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />

      {filteredUsers.map((user) => (
        user.location && (
          <Marker
            key={user.id || user._id}
            latitude={user.location.latitude}
            longitude={user.location.longitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(user);
            }}
          >
            <MapPin className="h-6 w-6 text-red-500" />
          </Marker>
        )
      ))}

      {popupInfo && popupInfo.location && (
        <Popup
          anchor="top"
          latitude={popupInfo.location.latitude}
          longitude={popupInfo.location.longitude}
          onClose={() => setPopupInfo(null)}
          className="min-w-[200px]"
        >
          <div className="p-2">
            <h3 className="font-semibold text-lg">{popupInfo.name || 'Anónimo'}</h3>
            
            {canViewContactDetails && (
              <div className="mt-2 space-y-1">
                {popupInfo.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {popupInfo.phone}
                  </p>
                )}
                {popupInfo.email && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {popupInfo.email}
                  </p>
                )}
              </div>
            )}
            
            {popupInfo.assistanceRequests?.map((request, index) => {
              // Filter by categories and subcategories
              if (categories.size > 0 && !categories.has(request.category)) return null;
              if (subcategories.size > 0 && !request.subcategories.some(sub => subcategories.has(sub))) return null;

              // Filter by date range
              if (dateRange.start || dateRange.end) {
                const requestDate = new Date(request.createdAt);
                if (dateRange.start && requestDate < new Date(dateRange.start)) return null;
                if (dateRange.end && requestDate > new Date(dateRange.end)) return null;
              }

              return (
                <div key={index} className="mt-2">
                  <p className="text-sm text-gray-600">
                    <strong>Tipo de ayuda:</strong> {ASSISTANCE_CATEGORIES[request.category].label}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Urgencia:</strong>{' '}
                    <span className={
                      request.urgency === 'alta' ? 'text-red-600' :
                      request.urgency === 'media' ? 'text-orange-500' :
                      'text-yellow-500'
                    }>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Descripción:</strong> {request.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Solicitado el: {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
            
            <p className="text-xs text-gray-500 mt-2">{popupInfo.location.address}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
}