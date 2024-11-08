import React, { useState } from 'react';
import { AlertCircle, Phone, Calendar, Mail } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { ASSISTANCE_CATEGORIES } from '../types';
import type { AssistanceCategory, User, AssistanceRequest } from '../types';
import { Pagination } from './Pagination';

const ITEMS_PER_PAGE = 25;

interface AssistanceListProps {
  categories: Set<AssistanceCategory>;
  subcategories: Set<string>;
  dateRange: {
    start: string;
    end: string;
  };
  userId?: string;
}

interface FilteredRequest {
  user: User;
  request: AssistanceRequest;
}

// Function to extract timestamp from MongoDB ObjectId
const getTimestampFromId = (id: string): number => {
  // If it's a valid MongoDB ObjectId (24 hex chars), extract timestamp
  if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
    return parseInt(id.substring(0, 8), 16) * 1000;
  }
  // Return a default timestamp for non-MongoDB IDs
  return 0;
};

export function AssistanceList({ categories, subcategories, dateRange, userId }: AssistanceListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { users, currentUser } = useUserStore();
  const canViewContactDetails = !!currentUser;

  // Ensure users is an array before processing
  const usersList = Array.isArray(users) ? users : [];

  const filteredRequests = usersList.reduce<FilteredRequest[]>((acc, user) => {
    if (!user?.assistanceRequests?.length) return acc;

    // Filter by user if specified
    // Compare both _id and id to handle MongoDB IDs
    if (userId && user._id !== userId && user.id !== userId) return acc;

    const validRequests = user.assistanceRequests.filter(request => {
      // Filter by categories
      if (categories.size > 0 && !categories.has(request.category)) {
        return false;
      }

      // Filter by subcategories if any are selected
      if (subcategories.size > 0 && !request.subcategories.some(sub => subcategories.has(sub))) {
        return false;
      }

      // Filter by date range
      if (dateRange.start || dateRange.end) {
        const requestDate = new Date(request.createdAt);
        if (dateRange.start && requestDate < new Date(dateRange.start)) return false;
        if (dateRange.end && requestDate > new Date(dateRange.end)) return false;
      }

      return true;
    });

    return [...acc, ...validRequests.map(request => ({ user, request }))];
  }, [])
  // Sort by recency (most recent first)
  .sort((a, b) => {
    // First try to sort by request creation date
    const dateA = new Date(a.request.createdAt).getTime();
    const dateB = new Date(b.request.createdAt).getTime();
    if (dateA !== dateB) return dateB - dateA;

    // If dates are equal (or invalid), fallback to user ID timestamp
    const timestampA = getTimestampFromId(a.user._id || a.user.id);
    const timestampB = getTimestampFromId(b.user._id || b.user.id);
    return timestampB - timestampA;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!usersList.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando solicitudes de ayuda...</p>
      </div>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron solicitudes de ayuda que coincidan con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedRequests.map(({ user, request }, index) => (
        <div
          key={`${user.id || user._id}-${index}`}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user.name || 'Anónimo'}
              </h3>
              {canViewContactDetails && (
                <div className="mt-1 space-y-1">
                  {user.phone && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {user.phone}
                    </p>
                  )}
                  {user.email && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </p>
                  )}
                </div>
              )}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              request.urgency === 'alta' ? 'bg-red-100 text-red-800' :
              request.urgency === 'media' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
            </span>
          </div>

          <div className="mt-3">
            <p className="text-sm font-medium text-gray-900">
              {ASSISTANCE_CATEGORIES[request.category].label}
            </p>
            <ul className="mt-1 space-y-1">
              {request.subcategories.map(sub => (
                <li key={sub} className="text-sm text-gray-600">
                  • {ASSISTANCE_CATEGORIES[request.category].subcategories[sub]}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-2">{request.description}</p>
          </div>

          <div className="mt-3 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(request.createdAt).toLocaleString()}
          </div>

          {user.location && (
            <p className="mt-2 text-sm text-gray-600">
              📍 {user.location.address}
            </p>
          )}
        </div>
      ))}

      {filteredRequests.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}