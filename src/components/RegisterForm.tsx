import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { geocodeAddress } from '../utils/geocoding';

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Dirección de correo electrónico inválida'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export function RegisterForm() {
  const navigate = useNavigate();
  const { addUser, login } = useUserStore();
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    try {
      let location = undefined;
      if (data.address) {
        location = await geocodeAddress(data.address);
        if (!location) {
          setError('address', {
            type: 'manual',
            message: 'No se pudo verificar la dirección. Por favor, intente con una dirección más específica.'
          });
          return;
        }
      }

      const newUser = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        roles: [],
        location,
        hasAccount: true,
        password: data.password
      };

      addUser(newUser);
      await login(data.email, data.password);
      navigate('/profile');
    } catch (error) {
      console.error('Error during registration:', error);
      setError('root', {
        type: 'manual',
        message: 'Error al procesar el registro. Por favor, inténtelo de nuevo.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <User className="inline-block w-4 h-4 mr-1" />
            Nombre Completo
          </label>
          <input
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Mail className="inline-block w-4 h-4 mr-1" />
            Correo Electrónico
          </label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Lock className="inline-block w-4 h-4 mr-1" />
            Contraseña
          </label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message?.toString()}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Lock className="inline-block w-4 h-4 mr-1" />
            Confirmar Contraseña
          </label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message?.toString()}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Phone className="inline-block w-4 h-4 mr-1" />
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="+34 XXXXXXXXX"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message?.toString()}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="inline-block w-4 h-4 mr-1" />
            Dirección (opcional)
          </label>
          <input
            type="text"
            {...register('address')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Ingrese su dirección completa"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message?.toString()}</p>}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Crear Cuenta
        </button>
      </div>
    </form>
  );
}