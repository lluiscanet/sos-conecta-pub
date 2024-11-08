export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  radius?: number;
}

export type VolunteerCategory = 
  | 'rescate_primeros_auxilios'
  | 'apoyo_medico'
  | 'distribucion_logistica'
  | 'limpieza_recuperacion'
  | 'apoyo_comunitario'
  | 'donaciones'
  | 'apoyo_administrativo'
  | 'comunicacion'
  | 'apoyo_general'
  | 'reparacion_vivienda_vehiculos'
  | 'servicios_educativos'
  | 'otros';

export type VolunteerSubcategory =
  | 'personal_rescate'
  | 'asistente_rescate'
  | 'profesional_salud'
  | 'asistente_salud'
  | 'coordinador_logistica'
  | 'distribuidor_transportista'
  | 'apoyo_general_logistica'
  | 'trabajador_limpieza'
  | 'voluntario_limpieza'
  | 'consejero_social'
  | 'asistente_acompanamiento'
  | 'coordinador_donaciones'
  | 'recolector_donaciones'
  | 'personal_administrativo'
  | 'asistente_registro'
  | 'voluntario_comunicacion'
  | 'asistente_difusion'
  | 'apoyo_tareas_basicas'
  | 'disponibilidad_general'
  | 'albanileria'
  | 'fontaneria'
  | 'electricista'
  | 'mecanico'
  | 'suministro_materiales'
  | 'apoyo_escolar'
  | 'cuidado_infantil'
  | 'otros_servicios';

export interface VolunteerSkill {
  category: VolunteerCategory;
  subcategories: VolunteerSubcategory[];
  hasExperience: boolean;
}

export type AssistanceCategory =
  | 'alojamiento'
  | 'alimentos'
  | 'ropa_mobiliario'
  | 'atencion_medica'
  | 'reparacion_vivienda'
  | 'educacion_cuidado'
  | 'asesoria_legal'
  | 'apoyo_comunitario'
  | 'empleo_capacitacion'
  | 'transporte'
  | 'otros';

export type AssistanceSubcategory =
  | 'alojamiento_temporal'
  | 'reubicacion'
  | 'alimentos_emergencia'
  | 'articulos_higiene'
  | 'ropa'
  | 'mobiliario'
  | 'atencion_medica_no_urgente'
  | 'apoyo_psicologico'
  | 'reparacion_danos'
  | 'materiales_construccion'
  | 'apoyo_escolar'
  | 'cuidado_infantil'
  | 'recuperacion_documentos'
  | 'asesoria_seguros'
  | 'apoyo_comunitario_general'
  | 'acompanamiento'
  | 'busqueda_empleo'
  | 'capacitacion'
  | 'transporte_local'
  | 'reubicacion_vehiculos'
  | 'otros_servicios';

export interface AssistanceRequest {
  category: AssistanceCategory;
  subcategories: AssistanceSubcategory[];
  description: string;
  urgency: 'baja' | 'media' | 'alta';
  createdAt: string;
}

export interface TemporaryHousing {
  id: string;
  address: string;
  location: Location;
  startDate: string;
  endDate: string;
  maxOccupancy: number;
  isShared: boolean;
  description?: string;
  status: 'available' | 'occupied' | 'expired';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: ('voluntario' | 'solicitante')[];
  location?: Location;
  skills?: VolunteerSkill[];
  assistanceRequests?: AssistanceRequest[];
  temporaryHousing?: TemporaryHousing[];
  hasAccount: boolean;
  password?: string;
}

export const VOLUNTEER_CATEGORIES: Record<VolunteerCategory, {
  label: string;
  subcategories: Record<VolunteerSubcategory, string>;
}> = {
  rescate_primeros_auxilios: {
    label: 'Rescate y Primeros Auxilios',
    subcategories: {
      personal_rescate: 'Personal de rescate',
      asistente_rescate: 'Asistentes de rescate'
    }
  },
  apoyo_medico: {
    label: 'Apoyo Médico y Sanitario',
    subcategories: {
      profesional_salud: 'Profesionales de salud',
      asistente_salud: 'Asistentes de salud'
    }
  },
  distribucion_logistica: {
    label: 'Distribución y Logística',
    subcategories: {
      coordinador_logistica: 'Coordinadores de logística',
      distribuidor_transportista: 'Distribuidores y transportistas',
      apoyo_general_logistica: 'Apoyo general'
    }
  },
  limpieza_recuperacion: {
    label: 'Limpieza y Recuperación',
    subcategories: {
      trabajador_limpieza: 'Trabajadores de limpieza y reconstrucción',
      voluntario_limpieza: 'Voluntarios sin experiencia'
    }
  },
  apoyo_comunitario: {
    label: 'Apoyo Comunitario y Emocional',
    subcategories: {
      consejero_social: 'Consejeros y trabajadores sociales',
      asistente_acompanamiento: 'Asistentes de acompañamiento'
    }
  },
  donaciones: {
    label: 'Donaciones y Recolección de Suministros',
    subcategories: {
      coordinador_donaciones: 'Coordinadores de centros de acopio',
      recolector_donaciones: 'Recolección y empaquetado'
    }
  },
  apoyo_administrativo: {
    label: 'Apoyo Administrativo y de Registro',
    subcategories: {
      personal_administrativo: 'Personal administrativo',
      asistente_registro: 'Asistentes de registro y atención'
    }
  },
  comunicacion: {
    label: 'Comunicación y Difusión',
    subcategories: {
      voluntario_comunicacion: 'Voluntarios de comunicación',
      asistente_difusion: 'Asistentes de difusión'
    }
  },
  reparacion_vivienda_vehiculos: {
    label: 'Reparación y Recuperación de Vivienda y Vehículos',
    subcategories: {
      albanileria: 'Albañilería',
      fontaneria: 'Fontanería',
      electricista: 'Electricista',
      mecanico: 'Mecánico',
      suministro_materiales: 'Suministro de materiales de construcción'
    }
  },
  servicios_educativos: {
    label: 'Servicios Educativos y Cuidado Infantil',
    subcategories: {
      apoyo_escolar: 'Apoyo escolar para niños',
      cuidado_infantil: 'Cuidado infantil'
    }
  },
  apoyo_general: {
    label: 'Apoyo General',
    subcategories: {
      apoyo_tareas_basicas: 'Apoyo en tareas básicas',
      disponibilidad_general: 'Disponibilidad para tareas diversas'
    }
  },
  otros: {
    label: 'Otros Servicios',
    subcategories: {
      otros_servicios: 'Otros tipos de apoyo no listados'
    }
  }
};

export const ASSISTANCE_CATEGORIES: Record<AssistanceCategory, {
  label: string;
  subcategories: Record<AssistanceSubcategory, string>;
}> = {
  alojamiento: {
    label: 'Alojamiento Temporal y Reubicación',
    subcategories: {
      alojamiento_temporal: 'Personas en necesidad de alojamiento temporal',
      reubicacion: 'Familias buscando reubicación'
    }
  },
  alimentos: {
    label: 'Alimentos y Bienes de Primera Necesidad',
    subcategories: {
      alimentos_emergencia: 'Alimentos no perecederos y kits de emergencia',
      articulos_higiene: 'Artículos de higiene y limpieza'
    }
  },
  ropa_mobiliario: {
    label: 'Ropa y Mobiliario Básico',
    subcategories: {
      ropa: 'Ropa para adultos y niños',
      mobiliario: 'Mobiliario básico'
    }
  },
  atencion_medica: {
    label: 'Atención Médica y Psicológica Continuada',
    subcategories: {
      atencion_medica_no_urgente: 'Personas que requieren atención médica no urgente',
      apoyo_psicologico: 'Apoyo psicológico'
    }
  },
  reparacion_vivienda: {
    label: 'Reparación y Recuperación de Vivienda',
    subcategories: {
      reparacion_danos: 'Reparación de viviendas afectadas',
      materiales_construccion: 'Suministro de materiales de construcción'
    }
  },
  educacion_cuidado: {
    label: 'Acceso a Servicios Educativos y de Cuidado Infantil',
    subcategories: {
      apoyo_escolar: 'Apoyo escolar para niños',
      cuidado_infantil: 'Cuidado infantil'
    }
  },
  asesoria_legal: {
    label: 'Asesoría Legal y Documentación',
    subcategories: {
      recuperacion_documentos: 'Asesoría para recuperación de documentos',
      asesoria_seguros: 'Asesoría para reclamos de seguros o ayuda oficial'
    }
  },
  apoyo_comunitario: {
    label: 'Apoyo Comunitario y Conexión Social',
    subcategories: {
      apoyo_comunitario_general: 'Personas que buscan apoyo comunitario',
      acompanamiento: 'Acompañamiento para personas mayores o con movilidad reducida'
    }
  },
  empleo_capacitacion: {
    label: 'Acceso a Empleo y Capacitación',
    subcategories: {
      busqueda_empleo: 'Búsqueda de oportunidades laborales',
      capacitacion: 'Capacitación para reinserción laboral'
    }
  },
  transporte: {
    label: 'Transporte y Movilidad',
    subcategories: {
      transporte_local: 'Necesidad de transporte local',
      reubicacion_vehiculos: 'Reubicación de vehículos dañados'
    }
  },
  otros: {
    label: 'Otros Servicios',
    subcategories: {
      otros_servicios: 'Otros tipos de ayuda no listados'
    }
  }
};