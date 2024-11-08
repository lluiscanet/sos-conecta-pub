import React from 'react';
import { useStats } from '../hooks/useStats';

export function StatsSection() {
  const stats = useStats();

  return (
    <div className="bg-red-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Juntos hacemos la diferencia
          </h2>
          <p className="mt-3 text-xl text-red-200 sm:mt-4">
            Nuestra comunidad crece cada día, uniendo fuerzas para ayudar a quienes más lo necesitan.
          </p>
        </div>
        <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
          <div className="flex flex-col">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-red-200">Voluntarios</dt>
            <dd className="order-1 text-5xl font-extrabold text-white">{stats.volunteers}</dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-red-200">Solicitudes</dt>
            <dd className="order-1 text-5xl font-extrabold text-white">{stats.assistanceRequests}</dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-red-200">Viviendas</dt>
            <dd className="order-1 text-5xl font-extrabold text-white">{stats.temporaryHousing}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}