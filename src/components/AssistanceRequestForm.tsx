import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, Phone, Mail, User } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { geocodeAddress } from '../utils/geocoding';
import { AssistanceCategory, AssistanceSubcategory, ASSISTANCE_CATEGORIES } from '../types';

const schema = z.object({
  name: z.string().optional(),
  isAnonymous: z.boolean(),
  phone: z.string().min(9, 'El número de teléfono debe tener al menos 9 dígitos'),
  email: z.string().email('Dirección de correo electrónico inválida').optional().or(z.literal('')),
  assistanceRequest: z.object({
    category: z.string(),
    subcategories: z.array(z.string()).min(1, 'Seleccione al menos una subcategoría'),
    description: z.string().min(10, 'Por favor proporcione más detalles sobre sus necesidades'),
  }),
  address: z.string().min(5, 'Por favor ingrese una dirección válida'),
  urgency: z.enum(['baja', 'media', 'alta'])
});

export function AssistanceRequestForm() {
  const navigate = useNavigate();
  const { currentUser, addUser, addAssistanceRequest, updateUser } = useUserStore();
  const { register, handleSubmit, watch, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      isAnonymous: false,
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: currentUser?.location?.address || '',
      assistanceRequest: {
        subcategories: []
      }
    }
  });

  const isAnonymous = watch('isAnonymous');
  const selectedCategory = watch('assistanceRequest.category');

  const onSubmit = async (data: any) => {
    try {
      const geoLocation = await geocodeAddress(data.address);
      
      if (!geoLocation) {
        setError('address', {
          type: 'manual',
          message: 'No se pudo verificar la dirección. Por favor, intente con una dirección más específica.'
        });
        return;
      }

      const assistanceRequest = {
        category: data.assistanceRequest.category as AssistanceCategory,
        subcategories: data.assistanceRequest.subcategories as AssistanceSubcategory[],
        description: data.assistanceRequest.description,
        urgency: data.urgency,
        createdAt: new Date().toISOString()
      };

      if (currentUser) {
        // Update existing user with new request and location if changed
        const updates = {
          phone: data.phone,
          location: geoLocation,
          roles: [...new Set([...currentUser.roles, 'solicitante'])]
        };
        updateUser(currentUser.id, updates);
        addAssistanceRequest(currentUser.id, assistanceRequest);
      } else {
        // Create new user with the request
        const newUser = {
          id: crypto.randomUUID(),
          name: isAnonymous ? undefined : data.name,
          email: data.email || undefined, // Only include email if provided
          phone: data.phone,
          roles: ['solicitante'],
          location: geoLocation,
          assistanceRequests: [assistanceRequest],
          hasAccount: false
        };
        addUser(newUser);
      }
      
      navigate('/assistance');
    } catch (error) {
      console.error('Error during assistance request:', error);
      setError('root', {
        type: 'manual',
        message: 'Error al procesar la solicitud. Por favor, inténtelo de nuevo.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Solicitud de Ayuda</h2>

        {!currentUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  {...register('isAnonymous')}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                />
                Mantener solicitud anónima
              </label>
            </div>

            {!isAnonymous && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nombre (opcional)</label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Su nombre"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Phone className="inline-block w-4 h-4 mr-1" />
            Teléfono de contacto
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="+34 XXXXXXXXX"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message?.toString()}</p>}
        </div>

        {!currentUser && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Mail className="inline-block w-4 h-4 mr-1" />
              Correo Electrónico (opcional)
            </label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo de Asistencia</label>
            <select
              {...register('assistanceRequest.category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            >
              <option value="">Seleccione una categoría</option>
              {Object.entries(ASSISTANCE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.label}</option>
              ))}
            </select>
            {errors.assistanceRequest?.category && (
              <p className="text-red-500 text-sm">{errors.assistanceRequest.category.message?.toString()}</p>
            )}
          </div>

          {selectedCategory && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Subcategorías</label>
              <div className="space-y-2">
                {Object.entries(ASSISTANCE_CATEGORIES[selectedCategory as AssistanceCategory].subcategories).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('assistanceRequest.subcategories')}
                      value={key}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              {errors.assistanceRequest?.subcategories && (
                <p className="text-red-500 text-sm">{errors.assistanceRequest.subcategories.message?.toString()}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Descripción de Necesidades</label>
          <textarea
            {...register('assistanceRequest.description')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Por favor describa lo que necesita..."
          />
          {errors.assistanceRequest?.description && (
            <p className="text-red-500 text-sm">{errors.assistanceRequest.description.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="inline-block w-4 h-4 mr-1" />
            Ubicación
          </label>
          <input
            type="text"
            {...register('address')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Ingrese su dirección completa"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <AlertCircle className="inline-block w-4 h-4 mr-1" />
            Nivel de Urgencia
          </label>
          <select
            {...register('urgency')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="baja">Baja - En los próximos días</option>
            <option value="media">Media - En las próximas 24 horas</option>
            <option value="alta">Alta - Necesito ayuda inmediata</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Enviar Solicitud de Ayuda
        </button>
      </div>
    </form>
  );
}