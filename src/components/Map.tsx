import React, { useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { MapPin, Phone, AlertCircle } from 'lucide-react';
import type { User, VolunteerCategory, AssistanceCategory } from '../types';
import { useUserStore } from '../store/userStore';
import { VOLUNTEER_CATEGORIES, ASSISTANCE_CATEGORIES } from '../types';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapViewProps {
  filter: 'all' | 'volunteers' | 'seekers';
  volunteerCategories: Set<VolunteerCategory>;
  seekerCategories: Set<AssistanceCategory>;
  seekerDateRange: {
    start: string;
    end: string;
  };
}

export function MapView({
  filter,
  volunteerCategories,
  seekerCategories,
  seekerDateRange
}: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<User | null>(null);
  const currentUser = useUserStore(state => state.currentUser);
  const users = useUserStore(state => state.users);

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    
    if (filter === 'volunteers') {
      if (!user.roles.includes('voluntario')) return false;
      if (volunteerCategories.size === 0) return true;
      return user.skills?.some(skill => volunteerCategories.has(skill.category));
    }
    
    if (filter === 'seekers') {
      if (!user.roles.includes('solicitante')) return false;
      if (!user.assistanceRequests?.length) return false;
      
      // Filter by categories
      if (seekerCategories.size > 0) {
        return user.assistanceRequests.some(request => 
          seekerCategories.has(request.category)
        );
      }
      
      // Filter by date range
      if (seekerDateRange.start || seekerDateRange.end) {
        return user.assistanceRequests.some(request => {
          const requestDate = request.createdAt ? new Date(request.createdAt) : null;
          if (!requestDate) return false;
          
          if (seekerDateRange.start && requestDate < new Date(seekerDateRange.start)) return false;
          if (seekerDateRange.end && requestDate > new Date(seekerDateRange.end)) return false;
          
          return true;
        });
      }
      
      return true;
    }
    
    return false;
  });

  const canViewContactDetails = currentUser?.roles.includes('voluntario');

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
            key={user.id}
            latitude={user.location.latitude}
            longitude={user.location.longitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(user);
            }}
          >
            <MapPin
              className={`h-6 w-6 ${
                user.roles.includes('voluntario')
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            />
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
            <h3 className="font-semibold text-lg">{popupInfo.name}</h3>
            
            {popupInfo.roles.includes('solicitante') && popupInfo.assistanceRequests?.length && (
              <>
                {popupInfo.assistanceRequests.map((request, index) => (
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
                    {request.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Solicitado el: {new Date(request.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
                {canViewContactDetails && popupInfo.phone && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {popupInfo.phone}
                  </p>
                )}
              </>
            )}

            {popupInfo.roles.includes('voluntario') && popupInfo.skills && (
              <>
                <p className="text-sm text-gray-600">Voluntario</p>
                <div className="space-y-2 mt-2">
                  {popupInfo.skills.map((skill, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{VOLUNTEER_CATEGORIES[skill.category].label}</p>
                      <ul className="ml-4 text-gray-600">
                        {skill.subcategories.map(sub => (
                          <li key={sub}>
                            {VOLUNTEER_CATEGORIES[skill.category].subcategories[sub]}
                            {skill.hasExperience && ' (Con experiencia)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {popupInfo.location.radius && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Radio de servicio:</strong> {popupInfo.location.radius}km
                  </p>
                )}
              </>
            )}
            
            <p className="text-xs text-gray-500 mt-2">{popupInfo.location.address}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
}