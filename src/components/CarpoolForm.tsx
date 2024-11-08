import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Clock, Users, Car } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useCarpoolStore } from '../store/carpoolStore';
import { geocodeAddress } from '../utils/geocoding';

const schema = z.object({
  origin: z.string().min(5, 'Ingrese una dirección de origen válida'),
  destination: z.string().min(5, 'Ingrese una dirección de destino válida'),
  departureTime: z.string().min(1, 'La fecha y hora son obligatorias'),
  maxPassengers: z.number().min(1).max(8),
  description: z.string().optional()
});

export function CarpoolForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      maxPassengers: 4,
      departureTime: new Date().toISOString().slice(0, 16)
    }
  });

  const currentUser = useUserStore(state => state.currentUser);
  const addCarpool = useCarpoolStore(state => state.addCarpool);

  const onSubmit = async (data: any) => {
    if (!currentUser) {
      alert('Debe iniciar sesión para crear un viaje compartido');
      return;
    }

    try {
      const originLocation = await geocodeAddress(data.origin);
      const destinationLocation = await geocodeAddress(data.destination);

      if (!originLocation || !destinationLocation) {
        setError('origin', {
          type: 'manual',
          message: 'No se pudieron verificar las direcciones'
        });
        return;
      }

      const newCarpool = {
        id: crypto.randomUUID(),
        driverId: currentUser.id,
        origin: originLocation,
        destination: destinationLocation,
        departureTime: data.departureTime,
        maxPassengers: data.maxPassengers,
        currentPassengers: [],
        description: data.description || '',
        status: 'active' as const
      };

      addCarpool(newCarpool);
      onClose();
    } catch (error) {
      console.error('Error creating carpool:', error);
      setError('origin', {
        type: 'manual',
        message: 'Error al crear el viaje compartido'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="inline-block w-4 h-4 mr-1" />
            Dirección de Origen
          </label>
          <input
            type="text"
            {...register('origin')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Dirección de salida"
          />
          {errors.origin && <p className="text-red-500 text-sm">{errors.origin.message?.toString()}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="inline-block w-4 h-4 mr-1" />
            Dirección de Destino
          </label>
          <input
            type="text"
            {...register('destination')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Dirección de llegada"
          />
          {errors.destination && <p className="text-red-500 text-sm">{errors.destination.message?.toString()}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Clock className="inline-block w-4 h-4 mr-1" />
            Fecha y Hora de Salida
          </label>
          <input
            type="datetime-local"
            {...register('departureTime')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.departureTime && <p className="text-red-500 text-sm">{errors.departureTime.message?.toString()}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Users className="inline-block w-4 h-4 mr-1" />
            Número Máximo de Pasajeros
          </label>
          <input
            type="number"
            {...register('maxPassengers', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            min="1"
            max="8"
          />
          {errors.maxPassengers && <p className="text-red-500 text-sm">{errors.maxPassengers.message?.toString()}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción (opcional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Detalles adicionales del viaje..."
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <Car className="w-4 h-4 mr-2" />
          Crear Viaje
        </button>
      </div>
    </form>
  );
}