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

export const fetchServices = async (): Promise<Service[]> => {
  const response = await fetch(`${API_URL}/api/services/?t=${Date.now()}`);
  if (!response.ok) throw new Error('Erro ao buscar serviços.');
  return response.json();
};

export const fetchAppointments = async (clientId?: string): Promise<any[]> => {
  const url = clientId 
    ? `${API_URL}/api/appointments/?client_id=${clientId}&t=${Date.now()}`
    : `${API_URL}/api/appointments/?t=${Date.now()}`;
    
  const response = await fetch(url);
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

export const fetchProfessionalProfile = async (userId: string): Promise<ProfessionalProfile> => {
  const response = await fetch(`${API_URL}/api/professional-profile/${userId}/?t=${Date.now()}`);
  if (!response.ok) throw new Error('Perfil não encontrado.');
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
