import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { VolunteerDirectory } from '../components/VolunteerDirectory';
import { VolunteerCategory, VOLUNTEER_CATEGORIES } from '../types';

type VolunteerViewType = 'list' | 'map';

export function VolunteersPage() {
  const [view, setView] = useState<VolunteerViewType>('list');
  const [categories, setCategories] = useState<Set<VolunteerCategory>>(new Set());
  const [subcategories, setSubcategories] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showExperiencedOnly, setShowExperiencedOnly] = useState(false);

  const handleCategoryChange = (category: VolunteerCategory) => {
    const newCategories = new Set(categories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
      // Remove all subcategories of this category
      const newSubcategories = new Set(subcategories);
      Object.keys(VOLUNTEER_CATEGORIES[category].subcategories).forEach(sub => {
        newSubcategories.delete(sub);
      });
      setSubcategories(newSubcategories);
    } else {
      newCategories.add(category);
    }
    setCategories(newCategories);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    const newSubcategories = new Set(subcategories);
    if (newSubcategories.has(subcategory)) {
      newSubcategories.delete(subcategory);
    } else {
      newSubcategories.add(subcategory);
    }
    setSubcategories(newSubcategories);
  };

  const clearFilters = () => {
    setCategories(new Set());
    setSubcategories(new Set());
    setShowExperiencedOnly(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="h-full flex flex-row">
        {/* Filter Sidebar */}
        <div className={`relative bg-white border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <div
            className="absolute top-0 right-0 translate-x-full bg-white rounded-r-lg border border-l-0 p-1 cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </div>

          <div className={`h-full overflow-y-auto ${isSidebarOpen ? 'opacity-100 p-4' : 'opacity-0'}`}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtros
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Limpiar
                  </button>
                </h3>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showExperiencedOnly}
                    onChange={(e) => setShowExperiencedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Solo voluntarios con experiencia
                  </span>
                </label>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-gray-900">Áreas de Voluntariado</h4>
                {Object.entries(VOLUNTEER_CATEGORIES).map(([key, category]) => {
                  const isSelected = categories.has(key as VolunteerCategory);
                  return (
                    <div key={key} className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCategoryChange(key as VolunteerCategory)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{category.label}</span>
                      </label>

                      {isSelected && (
                        <div className="ml-6 space-y-2">
                          {Object.entries(category.subcategories).map(([subKey, subLabel]) => (
                            <label key={subKey} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={subcategories.has(subKey)}
                                onChange={() => handleSubcategoryChange(subKey)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-600">{subLabel}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Directorio de Voluntarios
              </h2>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    view === 'list'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    view === 'map'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Mapa
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-12rem)]">
              <VolunteerDirectory
                view={view}
                categories={categories}
                subcategories={subcategories}
                experiencedOnly={showExperiencedOnly}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}