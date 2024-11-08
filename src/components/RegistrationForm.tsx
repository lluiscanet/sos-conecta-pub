import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Heart, Lock, User, Mail } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { geocodeAddress } from '../utils/geocoding';
import { VOLUNTEER_CATEGORIES, VolunteerCategory, VolunteerSubcategory } from '../types';

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Dirección de correo electrónico inválida'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  address: z.string().optional(),
  isVolunteer: z.boolean(),
  skills: z.array(z.object({
    category: z.string(),
    subcategories: z.array(z.string()),
    hasExperience: z.boolean()
  })).optional(),
  radius: z.number().optional().nullable()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export function RegistrationForm() {
  const navigate = useNavigate();
  const { addUser, login } = useUserStore();
  const [isVolunteer, setIsVolunteer] = useState(false);
  const { register, handleSubmit, watch, formState: { errors }, setValue, setError } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      isVolunteer: false,
      skills: [],
      radius: null
    }
  });

  const handleCategoryChange = (category: VolunteerCategory, checked: boolean) => {
    const currentSkills = watch('skills') || [];
    if (checked) {
      const newSkill = {
        category,
        subcategories: [],
        hasExperience: false
      };
      setValue('skills', [...currentSkills, newSkill]);
    } else {
      setValue('skills', currentSkills.filter(skill => skill.category !== category));
    }
  };

  const handleSubcategoryChange = (category: VolunteerCategory, subcategory: VolunteerSubcategory, checked: boolean) => {
    const currentSkills = watch('skills') || [];
    const categorySkill = currentSkills.find(skill => skill.category === category);
    
    if (categorySkill) {
      const updatedSkills = currentSkills.map(skill => {
        if (skill.category === category) {
          return {
            ...skill,
            subcategories: checked
              ? [...skill.subcategories, subcategory]
              : skill.subcategories.filter(sub => sub !== subcategory)
          };
        }
        return skill;
      });
      setValue('skills', updatedSkills);
    }
  };

  const handleExperienceChange = (category: VolunteerCategory, hasExperience: boolean) => {
    const currentSkills = watch('skills') || [];
    const updatedSkills = currentSkills.map(skill => {
      if (skill.category === category) {
        return { ...skill, hasExperience };
      }
      return skill;
    });
    setValue('skills', updatedSkills);
  };

  const selectedSkills = watch('skills') || [];

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
        roles: data.isVolunteer ? ['voluntario'] : [],
        location,
        skills: data.isVolunteer ? data.skills : undefined,
        radius: data.radius || undefined,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Registro de Usuario</h2>
        
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

        <div className="space-y-4">
          <div>
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

          <div>
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
        </div>

        <div className="pt-4 border-t">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('isVolunteer')}
              onChange={(e) => {
                setIsVolunteer(e.target.checked);
                setValue('isVolunteer', e.target.checked);
              }}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Quiero registrarme como voluntario</span>
          </label>
        </div>

        {isVolunteer && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin className="inline-block w-4 h-4 mr-1" />
                Dirección
              </label>
              <input
                type="text"
                {...register('address')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Ingrese su dirección completa"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message?.toString()}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Heart className="inline-block w-4 h-4 mr-1" />
                Áreas de Voluntariado
              </label>
              <div className="space-y-4">
                {Object.entries(VOLUNTEER_CATEGORIES).map(([categoryKey, category]) => {
                  const isSelected = selectedSkills.some(skill => skill.category === categoryKey);
                  const selectedSkill = selectedSkills.find(skill => skill.category === categoryKey);

                  return (
                    <div key={categoryKey} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleCategoryChange(categoryKey as VolunteerCategory, e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="ml-2 font-medium">{category.label}</span>
                        </label>
                        {isSelected && (
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={selectedSkill?.hasExperience || false}
                              onChange={(e) => handleExperienceChange(categoryKey as VolunteerCategory, e.target.checked)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2">Tengo experiencia</span>
                          </label>
                        )}
                      </div>

                      {isSelected && (
                        <div className="ml-6 grid grid-cols-1 gap-2">
                          {Object.entries(category.subcategories).map(([subKey, subLabel]) => (
                            <label key={subKey} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedSkill?.subcategories.includes(subKey)}
                                onChange={(e) => handleSubcategoryChange(
                                  categoryKey as VolunteerCategory,
                                  subKey as VolunteerSubcategory,
                                  e.target.checked
                                )}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="ml-2 text-sm">{subLabel}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="inline-block w-4 h-4 mr-1" />
                Radio de Servicio (kilómetros) - Opcional
              </label>
              <input
                type="number"
                {...register('radius', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="Ingrese radio en kilómetros (opcional)"
              />
              {errors.radius && <p className="text-red-500 text-sm">{errors.radius.message?.toString()}</p>}
            </div>
          </>
        )}

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