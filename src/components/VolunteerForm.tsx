import React from 'react';
import { Check, X } from 'lucide-react';
import { VOLUNTEER_CATEGORIES, VolunteerCategory, VolunteerSubcategory } from '../types';

interface VolunteerFormProps {
  initialSkills?: Array<{
    category: VolunteerCategory;
    subcategories: VolunteerSubcategory[];
    hasExperience: boolean;
  }>;
  initialRadius?: number;
  onSubmit: (data: {
    skills: Array<{
      category: VolunteerCategory;
      subcategories: VolunteerSubcategory[];
      hasExperience: boolean;
    }>;
    radius: number;
  }) => void;
  onCancel: () => void;
  submitLabel?: string;
  error?: string | null;
}

export function VolunteerForm({
  initialSkills = [],
  initialRadius = 5,
  onSubmit,
  onCancel,
  submitLabel = "Registrarse como Voluntario",
  error
}: VolunteerFormProps) {
  const [volunteerForm, setVolunteerForm] = React.useState({
    skills: initialSkills,
    radius: initialRadius
  });

  const handleCategoryChange = (category: VolunteerCategory, checked: boolean) => {
    if (checked) {
      setVolunteerForm(prev => ({
        ...prev,
        skills: [...prev.skills, { category, subcategories: [], hasExperience: false }]
      }));
    } else {
      setVolunteerForm(prev => ({
        ...prev,
        skills: prev.skills.filter(skill => skill.category !== category)
      }));
    }
  };

  const handleSubcategoryChange = (category: VolunteerCategory, subcategory: VolunteerSubcategory, checked: boolean) => {
    setVolunteerForm(prev => ({
      ...prev,
      skills: prev.skills.map(skill => {
        if (skill.category === category) {
          return {
            ...skill,
            subcategories: checked
              ? [...skill.subcategories, subcategory]
              : skill.subcategories.filter(sub => sub !== subcategory)
          };
        }
        return skill;
      })
    }));
  };

  const handleExperienceChange = (category: VolunteerCategory, hasExperience: boolean) => {
    setVolunteerForm(prev => ({
      ...prev,
      skills: prev.skills.map(skill => {
        if (skill.category === category) {
          return { ...skill, hasExperience };
        }
        return skill;
      })
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Radio de Servicio (kilómetros)</label>
        <input
          type="number"
          value={volunteerForm.radius}
          onChange={(e) => setVolunteerForm(prev => ({ ...prev, radius: parseInt(e.target.value) || 5 }))}
          min="1"
          max="50"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Áreas de Voluntariado</label>
        <div className="space-y-4">
          {Object.entries(VOLUNTEER_CATEGORIES).map(([categoryKey, category]) => {
            const isSelected = volunteerForm.skills.some(skill => skill.category === categoryKey);
            const selectedSkill = volunteerForm.skills.find(skill => skill.category === categoryKey);

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
                          checked={selectedSkill?.subcategories.includes(subKey as VolunteerSubcategory)}
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

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => onSubmit(volunteerForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <Check className="h-4 w-4 mr-2" />
          {submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </button>
      </div>
    </div>
  );
}