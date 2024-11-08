import React, { useState } from 'react';
import Map, { Marker, NavigationControl, Popup, Source, Layer } from 'react-map-gl';
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react';
import { useCarpoolStore } from '../store/carpoolStore';
import { useUserStore } from '../store/userStore';
import { Carpool } from '../types';
import { CarpoolDetails } from './CarpoolDetails';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface CarpoolMapProps {
  dateRange: {
    start: string;
    end: string;
  };
  showType: 'all' | 'origins' | 'destinations';
  filter?: 'all' | 'mine';
  userId?: string;
}

export function CarpoolMap({ dateRange, showType, userId, filter = 'all' }: CarpoolMapProps) {
  const [popupInfo, setPopupInfo] = useState<{
    carpool: Carpool;
    isOrigin: boolean;
  } | null>(null);
  const [selectedCarpoolId, setSelectedCarpoolId] = useState<string | null>(null);
  const carpoolsData = useCarpoolStore(state => state.carpools);
  const { currentUser } = useUserStore();

  // Ensure carpools is always an array
  const carpools = Array.isArray(carpoolsData) ? carpoolsData : [];

  const filteredCarpools = carpools.filter(carpool => {
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
  });

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const shouldShowOrigin = showType === 'all' || showType === 'origins';
  const shouldShowDestination = showType === 'all' || showType === 'destinations';

  // Generate GeoJSON for the route lines
  const routeLines = {
    type: 'FeatureCollection',
    features: showType === 'all' ? filteredCarpools.map(carpool => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [carpool.origin.longitude, carpool.origin.latitude],
          [carpool.destination.longitude, carpool.destination.latitude]
        ]
      }
    })) : []
  };

  return (
    <>
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

        {/* Route lines */}
        {showType === 'all' && (
          <Source type="geojson" data={routeLines}>
            <Layer
              id="route-lines"
              type="line"
              paint={{
                'line-color': '#6366f1',
                'line-width': 2,
                'line-opacity': 0.6,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {filteredCarpools.map((carpool) => {
          const carpoolId = carpool._id || carpool.id;
          return (
            <React.Fragment key={carpoolId}>
              {shouldShowOrigin && (
                <Marker
                  latitude={carpool.origin.latitude}
                  longitude={carpool.origin.longitude}
                  anchor="bottom"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({ carpool, isOrigin: true });
                  }}
                >
                  <MapPin className="h-6 w-6 text-blue-500" />
                </Marker>
              )}

              {shouldShowDestination && (
                <Marker
                  latitude={carpool.destination.latitude}
                  longitude={carpool.destination.longitude}
                  anchor="bottom"
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({ carpool, isOrigin: false });
                  }}
                >
                  <MapPin className="h-6 w-6 text-green-500" />
                </Marker>
              )}
            </React.Fragment>
          );
        })}

        {popupInfo && (
          <Popup
            anchor="top"
            latitude={popupInfo.isOrigin ? popupInfo.carpool.origin.latitude : popupInfo.carpool.destination.latitude}
            longitude={popupInfo.isOrigin ? popupInfo.carpool.origin.longitude : popupInfo.carpool.destination.longitude}
            onClose={() => setPopupInfo(null)}
            className="min-w-[300px]"
          >
            <div className="p-2">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  {popupInfo.isOrigin ? 'Punto de Origen' : 'Punto de Destino'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDateTime(popupInfo.carpool.departureTime)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Origen</p>
                      <p className="text-sm text-gray-600">{popupInfo.carpool.origin.address}</p>
                    </div>
                  </div>
                  <div className="flex justify-center my-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Destino</p>
                      <p className="text-sm text-gray-600">{popupInfo.carpool.destination.address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      {popupInfo.carpool.maxPassengers - (popupInfo.carpool.currentPassengers?.length || 0)} asientos disponibles
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    popupInfo.carpool.status === 'active' ? 'bg-green-100 text-green-800' :
                    popupInfo.carpool.status === 'full' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {popupInfo.carpool.status === 'active' ? 'Disponible' :
                     popupInfo.carpool.status === 'full' ? 'Completo' :
                     'Cancelado'}
                  </span>
                </div>

                {popupInfo.carpool.description && (
                  <p className="text-sm text-gray-600 border-t pt-2">
                    {popupInfo.carpool.description}
                  </p>
                )}

                <button
                  onClick={() => {
                    const carpoolId = popupInfo.carpool._id || popupInfo.carpool.id;
                    setSelectedCarpoolId(carpoolId);
                    setPopupInfo(null);
                  }}
                  className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </Popup>
        )}

        {/* Compact Legend */}
        <div className="absolute bottom-8 left-8 bg-white px-3 py-2 rounded-lg shadow-lg text-xs">
          <div className="flex gap-3">
            {shouldShowOrigin && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span>Origen</span>
              </div>
            )}
            {shouldShowDestination && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-green-500" />
                <span>Destino</span>
              </div>
            )}
            {showType === 'all' && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-indigo-400"></div>
                <span>Ruta</span>
              </div>
            )}
          </div>
        </div>
      </Map>

      {selectedCarpoolId && (
        <CarpoolDetails
          carpoolId={selectedCarpoolId}
          onClose={() => setSelectedCarpoolId(null)}
        />
      )}
    </>
  );
}