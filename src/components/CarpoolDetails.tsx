import React from 'react';
import { X, Phone, Mail, Users, MapPin, Calendar, UserMinus, UserPlus } from 'lucide-react';
import { useCarpoolStore } from '../store/carpoolStore';
import { useUserStore } from '../store/userStore';

interface CarpoolDetailsProps {
  carpoolId: string;
  onClose: () => void;
}

export function CarpoolDetails({ carpoolId, onClose }: CarpoolDetailsProps) {
  const carpool = useCarpoolStore(state => state.carpools.find(c => c._id === carpoolId || c.id === carpoolId));
  const { users, currentUser } = useUserStore();
  const { joinCarpool, leaveCarpool } = useCarpoolStore();
  
  if (!carpool) return null;

  const passengers = users.filter(user => carpool.currentPassengers.includes(user._id || user.id));
  const driver = users.find(user => user._id === carpool.driverId || user.id === carpool.driverId);
  const isDriver = currentUser?._id === carpool.driverId;
  const isPassenger = currentUser && carpool.currentPassengers.includes(currentUser._id || currentUser.id);
  const canJoin = currentUser && !isDriver && !isPassenger && carpool.currentPassengers.length < carpool.maxPassengers;
  const canLeave = currentUser && !isDriver && isPassenger;

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const handleJoinCarpool = async () => {
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

  const handleLeaveCarpool = async () => {
    if (!currentUser) return;
    try {
      await leaveCarpool(carpoolId, currentUser._id);
    } catch (error) {
      console.error('Error leaving carpool:', error);
      alert('Error al abandonar el viaje');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg relative max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold pr-8">Detalles del Viaje</h2>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Route Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Ruta</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Origen</p>
                    <p className="text-sm text-gray-600">{carpool.origin.address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Destino</p>
                    <p className="text-sm text-gray-600">{carpool.destination.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">Salida: {formatDateTime(carpool.departureTime)}</p>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Conductor</h3>
              {driver && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{driver.name}</p>
                  {/* Only show contact details to passengers */}
                  {isPassenger && (
                    <>
                      {driver.email && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                          {driver.email}
                        </p>
                      )}
                      {driver.phone && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                          {driver.phone}
                        </p>
                      )}
                    </>
                  )}
                  {!isPassenger && !isDriver && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      Los datos de contacto estarán disponibles al unirse al viaje
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Passengers Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Pasajeros ({passengers.length}/{carpool.maxPassengers})
              </h3>
              <div className="space-y-3">
                {passengers.map(passenger => (
                  <div key={passenger._id || passenger.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{passenger.name}</p>
                    {/* Only show contact details to the driver */}
                    {isDriver && (
                      <>
                        {passenger.email && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                            {passenger.email}
                          </p>
                        )}
                        {passenger.phone && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                            {passenger.phone}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {passengers.length === 0 && (
                  <p className="text-gray-500 text-center py-3">
                    Aún no hay pasajeros registrados
                  </p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {carpool.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Información Adicional</h3>
                <p className="text-gray-600">{carpool.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(canJoin || canLeave) && (
          <div className="p-6 border-t mt-auto">
            {canJoin && (
              <button
                onClick={handleJoinCarpool}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Unirme al viaje
              </button>
            )}
            {canLeave && (
              <button
                onClick={handleLeaveCarpool}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Abandonar viaje
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}