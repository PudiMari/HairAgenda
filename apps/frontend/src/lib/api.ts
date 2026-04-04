const API_URL = import.meta.env.VITE_API_URL || "https://hair-agenda-backend.vercel.app";

export const fetchHealthStatus = async () => {
  const response = await fetch(`${API_URL}/api/health/`);
  return response.json();
};

export interface AppointmentPayload {
  client_user_id?: string;
  client_name: string;
  client_whatsapp: string;
  service: number; // ID of the service
  date_time: string; // ISO 8601 string
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration_minutes: number;
}

export const fetchServices = async (professionalId?: number | string): Promise<Service[]> => {
  const url = professionalId 
    ? `${API_URL}/api/services/?professional_id=${professionalId}&t=${Date.now()}`
    : `${API_URL}/api/services/?t=${Date.now()}`;
    
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro ao buscar serviços.');
  return response.json();
};

export const fetchAppointments = async (filters?: { clientId?: string, professionalId?: string | number }): Promise<any[]> => {
  const params = new URLSearchParams();
  if (filters?.clientId) params.append('client_id', filters.clientId);
  if (filters?.professionalId) params.append('professional_id', filters.professionalId.toString());
  params.append('t', Date.now().toString());
    
  const response = await fetch(`${API_URL}/api/appointments/?${params.toString()}`);
  if (!response.ok) throw new Error('Erro ao buscar agendamentos.');
  return response.json();
};

export const createAppointment = async (payload: AppointmentPayload) => {
  const response = await fetch(`${API_URL}/api/appointments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao realizar agendamento.');
  }

  return response.json();
};
export const createService = async (service: Omit<Service, 'id'>) => {
  const response = await fetch(`${API_URL}/api/services/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
  });
  if (!response.ok) throw new Error('Erro ao criar serviço.');
  return response.json();
};

export const updateService = async (id: number, service: Partial<Service>) => {
  const response = await fetch(`${API_URL}/api/services/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
  });
  if (!response.ok) throw new Error('Erro ao atualizar serviço.');
  return response.json();
};

export const deleteService = async (id: number) => {
  const response = await fetch(`${API_URL}/api/services/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao excluir serviço.');
};

export interface ProfessionalProfile {
  id: number;
  user_id: string;
  name: string;
  description: string;
  photo_url: string | null;
  location: string;
  whatsapp: string;
  instagram: string;
  is_setup_completed: boolean;
}

export interface OpeningHour {
  id: number;
  professional: number;
  day_of_week: number; // 0-6
  is_open: boolean;
  work_start: string; // "HH:MM:SS"
  work_end: string;
  lunch_start: string;
  lunch_end: string;
}

export const fetchProfessionalProfile = async (userId: string): Promise<ProfessionalProfile | null> => {
  const response = await fetch(`${API_URL}/api/professional-profile/${userId}/?t=${Date.now()}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Erro ao buscar perfil.');
  return response.json();
};

export const createProfessionalProfile = async (profile: Omit<ProfessionalProfile, 'id'>) => {
  const response = await fetch(`${API_URL}/api/professional-profile/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error('Erro ao criar perfil.');
  return response.json();
};

export const updateProfessionalProfile = async (id: string | number, profile: Partial<ProfessionalProfile>) => {
  const response = await fetch(`${API_URL}/api/professional-profile/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error('Erro ao atualizar perfil.');
  return response.json();
};

export const fetchOpeningHours = async (professionalId: number): Promise<OpeningHour[]> => {
  const response = await fetch(`${API_URL}/api/opening-hours/?professional_id=${professionalId}&t=${Date.now()}`);
  if (!response.ok) throw new Error('Erro ao buscar horários.');
  return response.json();
};

export const updateOpeningHour = async (id: number, data: Partial<OpeningHour>) => {
  const response = await fetch(`${API_URL}/api/opening-hours/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao atualizar horário.');
  return response.json();
};

export const createOpeningHour = async (data: Omit<OpeningHour, 'id'>) => {
  const response = await fetch(`${API_URL}/api/opening-hours/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao criar horário.');
  return response.json();
};
