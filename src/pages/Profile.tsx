import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { User, Phone, MapPin, Calendar, AlertCircle, Users, HandHeart, Mail, Edit2, Check, X, Trash2, Home } from 'lucide-react';
import { VOLUNTEER_CATEGORIES, ASSISTANCE_CATEGORIES } from '../types';
import { geocodeAddress } from '../utils/geocoding';
import { VolunteerForm } from '../components/VolunteerForm';
import { TemporaryHousingForm } from '../components/TemporaryHousingForm';
import { userService } from '../services/api';

export function Profile() {
  const location = useLocation();
  const { currentUser, updateUser, addVolunteerSkills, updateVolunteerSkills, removeAssistanceRequest, addTemporaryHousing, removeTemporaryHousing, setUsers } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isRegisteringVolunteer, setIsRegisteringVolunteer] = useState(false);
  const [isEditingVolunteer, setIsEditingVolunteer] = useState(false);
  const [isAddingHousing, setIsAddingHousing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.location?.address || ''
  });

  useEffect(() => {
    // Increment refresh key on location changes
    setRefreshKey(prev => prev + 1);
  }, [location]);

  useEffect(() => {
    const fetchLatestData = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const users = await userService.getAllUsers();
        setUsers(users);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error loading data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestData();
  }, [setUsers, refreshKey, currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-xl text-gray-600">Por favor inicie sesión para ver su perfil</p>
        </div>
      </div>
    );
  }

  const handleEditSubmit = async () => {
    try {
      let location = currentUser.location;
      if (editForm.address !== currentUser.location?.address) {
        const newLocation = await geocodeAddress(editForm.address);
        if (!newLocation) {
          setError('No se pudo verificar la dirección. Por favor, intente con una dirección más específica.');
          return;
        }
        location = newLocation;
      }

      await updateUser(currentUser.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        location
      });

      setIsEditing(false);
      setError(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setError('Error al actualizar el perfil. Por favor, inténtelo de nuevo.');
    }
  };

  const handleVolunteerSubmit = async (data: any) => {
    try {
      if (!currentUser.location) {
        setError('Por favor, actualice su perfil con una dirección antes de registrarse como voluntario.');
        return;
      }

      if (data.skills.length === 0) {
        setError('Por favor, seleccione al menos un área de voluntariado.');
        return;
      }

      await addVolunteerSkills(currentUser.id, data.skills);
      await updateUser(currentUser.id, {
        location: {
          ...currentUser.location,
          radius: data.radius
        }
      });

      setIsRegisteringVolunteer(false);
      setError(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setError('Error al registrar como voluntario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleUpdateVolunteerInfo = async (data: any) => {
    try {
      if (data.skills.length === 0) {
        setError('Por favor, seleccione al menos un área de voluntariado.');
        return;
      }

      await updateVolunteerSkills(currentUser.id, data.skills);
      await updateUser(currentUser.id, {
        location: {
          ...currentUser.location!,
          radius: data.radius
        }
      });

      setIsEditingVolunteer(false);
      setError(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setError('Error al actualizar la información de voluntario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleRemoveRequest = async (index: number) => {
    if (confirm('¿Está seguro de que desea eliminar esta solicitud de ayuda?')) {
      try {
        await removeAssistanceRequest(currentUser.id, index);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        setError('Error al eliminar la solicitud. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const handleAddHousing = async (data: any) => {
    try {
      await addTemporaryHousing(currentUser.id, data);
      setIsAddingHousing(false);
      setError(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      setError('Error al agregar la vivienda temporal. Por favor, inténtelo de nuevo.');
    }
  };

  const handleRemoveHousing = async (housingId: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta oferta de vivienda?')) {
      try {
        await removeTemporaryHousing(currentUser.id, housingId);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        setError('Error al eliminar la vivienda. Por favor, inténtelo de nuevo.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Actualizando perfil...</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg">
        {/* Basic Info */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-start">
            {isEditing ? (
              <div className="w-full space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-2" />
                  Editar Perfil
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleEditSubmit}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError(null);
                        setEditForm({
                          name: currentUser.name,
                          email: currentUser.email,
                          phone: currentUser.phone || '',
                          address: currentUser.location?.address || ''
                        });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <User className="h-6 w-6 mr-2" />
                    {currentUser.name}
                  </h2>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {currentUser.email}
                    </p>
                    {currentUser.phone && (
                      <p className="text-gray-600 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {currentUser.phone}
                      </p>
                    )}
                    {currentUser.location && (
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {currentUser.location.address}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Roles and Actions */}
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-4">
            {!currentUser.roles.includes('voluntario') && !isRegisteringVolunteer && (
              <button
                onClick={() => setIsRegisteringVolunteer(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Registrarse como Voluntario
              </button>
            )}
            <Link
              to="/request"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
            >
              <HandHeart className="h-4 w-4 mr-2" />
              Nueva Solicitud de Ayuda
            </Link>
            {!isAddingHousing && (
              <button
                onClick={() => setIsAddingHousing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Ofrecer Vivienda Temporal
              </button>
            )}
          </div>
        </div>

        {/* Temporary Housing Form */}
        {isAddingHousing && (
          <div className="px-6 py-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Ofrecer Vivienda Temporal</h3>
            <TemporaryHousingForm
              onSubmit={handleAddHousing}
              onCancel={() => {
                setIsAddingHousing(false);
                setError(null);
              }}
              error={error}
            />
          </div>
        )}

        {/* Temporary Housing List */}
        {currentUser.temporaryHousing && currentUser.temporaryHousing.length > 0 && (
          <div className="px-6 py-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Viviendas Temporales Ofrecidas</h3>
            <div className="space-y-4">
              {currentUser.temporaryHousing.map((housing) => (
                <div key={housing.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{housing.address}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        {new Date(housing.startDate).toLocaleDateString()} - {new Date(housing.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <Users className="inline-block h-4 w-4 mr-1" />
                        Capacidad: {housing.maxOccupancy} personas
                      </p>
                      {housing.description && (
                        <p className="text-sm text-gray-600 mt-2">{housing.description}</p>
                      )}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          housing.status === 'available' ? 'bg-green-100 text-green-800' :
                          housing.status === 'occupied' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {housing.status === 'available' ? 'Disponible' :
                           housing.status === 'occupied' ? 'Ocupada' : 'Expirada'}
                        </span>
                        {housing.isShared && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Espacio compartido
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveHousing(housing.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar oferta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer Registration Form */}
        {isRegisteringVolunteer && (
          <div className="px-6 py-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Registro de Voluntario</h3>
            <VolunteerForm
              onSubmit={handleVolunteerSubmit}
              onCancel={() => {
                setIsRegisteringVolunteer(false);
                setError(null);
              }}
              error={error}
            />
          </div>
        )}

        {/* Volunteer Information */}
        {currentUser.roles.includes('voluntario') && currentUser.skills && (
          <div className="px-6 py-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Información de Voluntario</h3>
              {!isEditingVolunteer && (
                <button
                  onClick={() => setIsEditingVolunteer(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </button>
              )}
            </div>
            
            {isEditingVolunteer ? (
              <VolunteerForm
                initialSkills={currentUser.skills}
                initialRadius={currentUser.location?.radius}
                onSubmit={handleUpdateVolunteerInfo}
                onCancel={() => {
                  setIsEditingVolunteer(false);
                  setError(null);
                }}
                submitLabel="Actualizar información"
                error={error}
              />
            ) : (
              <div className="space-y-4">
                {currentUser.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium">{VOLUNTEER_CATEGORIES[skill.category].label}</h4>
                    <ul className="mt-2 space-y-1">
                      {skill.subcategories.map(sub => (
                        <li key={sub} className="text-sm text-gray-600">
                          • {VOLUNTEER_CATEGORIES[skill.category].subcategories[sub]}
                          {skill.hasExperience && ' (Con experiencia)'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {currentUser.location?.radius && (
                  <p className="text-sm text-gray-600">
                    Radio de servicio: {currentUser.location.radius} km
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assistance Requests */}
        {currentUser.assistanceRequests && currentUser.assistanceRequests.length > 0 && (
          <div className="px-6 py-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Solicitudes de Ayuda</h3>
            <div className="space-y-4">
              {currentUser.assistanceRequests.map((request, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{ASSISTANCE_CATEGORIES[request.category].label}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.urgency === 'alta' ? 'bg-red-100 text-red-800' :
                        request.urgency === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                      <button
                        onClick={() => handleRemoveRequest(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar solicitud"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {request.subcategories.map(sub => (
                      <li key={sub} className="text-sm text-gray-600">
                        • {ASSISTANCE_CATEGORIES[request.category].subcategories[sub]}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">{request.description}</p>
                  {request.createdAt && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Solicitado el: {new Date(request.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}