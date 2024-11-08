import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Calendar, Users, Home, Check, X } from 'lucide-react';
import { geocodeAddress } from '../utils/geocoding';

const schema = z.object({
  address: z.string().min(5, 'La dirección es requerida'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  maxOccupancy: z.number().min(1, 'La capacidad debe ser al menos 1'),
  isShared: z.boolean(),
  description: z.string().optional()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"]
});

interface TemporaryHousingFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
}

export function TemporaryHousingForm({ onSubmit, onCancel, error }: TemporaryHousingFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      maxOccupancy: 1,
      isShared: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  const handleFormSubmit = async (data: any) => {
    try {
      const location = await geocodeAddress(data.address);
      if (!location) {
        throw new Error('No se pudo verificar la dirección');
      }
      
      await onSubmit({
        ...data,
        location,
        id: crypto.randomUUID(),
        status: 'available'
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="inline-block w-4 h-4 mr-1" />
            Dirección
          </label>
          <input
            type="text"
            {...register('address')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Dirección completa de la vivienda"
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              Fecha de inicio
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.startDate && (
              <p className="text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="inline-block w-4 h-4 mr-1" />
              Fecha de fin
            </label>
            <input
              type="date"
              {...register('endDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.endDate && (
              <p className="text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Users className="inline-block w-4 h-4 mr-1" />
              Capacidad máxima
            </label>
            <input
              type="number"
              {...register('maxOccupancy', { valueAsNumber: true })}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.maxOccupancy && (
              <p className="text-sm text-red-600">{errors.maxOccupancy.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('isShared')}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Espacio compartido</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Home className="inline-block w-4 h-4 mr-1" />
            Descripción (opcional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Detalles adicionales sobre la vivienda..."
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <Check className="h-4 w-4 mr-2" />
          Ofrecer Vivienda
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </button>
      </div>
    </form>
  );
}