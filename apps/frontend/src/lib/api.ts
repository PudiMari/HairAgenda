const API_URL = import.meta.env.VITE_API_URL || "https://hair-agenda-backend.vercel.app";

export const fetchHealthStatus = async () => {
  const response = await fetch(`${API_URL}/api/health/`);
  return response.json();
};

export interface AppointmentPayload {
  professional: number; // ID of the professional profile (database ID)
  client_user_id?: string;
  client_name: string;
  client_whatsapp: string;
  service: number; // ID of the service
  date_time: string; // ISO 8601 string
}

export interface Service {
  id: number;
  professional: number;
  name: string;
  description: string;
  price: string;
  duration_minutes: number;
}

export interface ProfessionalBlock {
  id: number;
  professional: number;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  end_time: string | null; // HH:MM:SS
  reason: string;
  created_at: string;
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
  console.log("[API] Creating appointment with payload:", {
    ...payload,
    // Hide parts of phone for privacy in logs if needed, but for now full log is better for debugging
  });

  const response = await fetch(`${API_URL}/api/appointments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("[API] Create appointment failed:", response.status, errorData);
    throw new Error(errorData.detail || errorData.non_field_errors?.[0] || 'Erro ao criar agendamento.');
  }

  const data = await response.json();
  console.log("[API] Appointment created successfully:", data);
  return data;
};

export const updateAppointmentStatus = async (id: number, status: string) => {
  const response = await fetch(`${API_URL}/api/appointments/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Erro ao atualizar status');
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
export const fetchProfessionalBlocks = async (professionalId: number | string): Promise<ProfessionalBlock[]> => {
  const response = await fetch(`${API_URL}/api/professional-blocks/?professional_id=${professionalId}&t=${Date.now()}`);
  if (!response.ok) throw new Error('Erro ao buscar bloqueios de datas.');
  return response.json();
};

export const createProfessionalBlock = async (data: { 
  professional: number; 
  date: string; 
  start_time?: string | null;
  end_time?: string | null;
  reason?: string 
}) => {
  const response = await fetch(`${API_URL}/api/professional-blocks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao criar bloqueio de data.');
  return response.json();
};

export const deleteProfessionalBlock = async (id: number) => {
  const response = await fetch(`${API_URL}/api/professional-blocks/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao excluir bloqueio de data.');
};

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface PortfolioItem {
  id: number;
  professional: number;
  image_url: string;
  title: string;
  category: string;
  category_display: string;
  order: number;
  created_at: string;
}

export const PORTFOLIO_CATEGORIES = [
  { value: 'corte',      label: 'Corte' },
  { value: 'coloracao',  label: 'Coloração' },
  { value: 'tratamento', label: 'Tratamento' },
  { value: 'penteado',   label: 'Penteado' },
  { value: 'unhas',      label: 'Unhas' },
  { value: 'maquiagem',  label: 'Maquiagem' },
  { value: 'outro',      label: 'Outro' },
];

export const fetchPortfolioItems = async (
  professionalId: number | string
): Promise<PortfolioItem[]> => {
  const response = await fetch(
    `${API_URL}/api/portfolio-items/?professional_id=${professionalId}&t=${Date.now()}`
  );
  if (!response.ok) throw new Error('Erro ao buscar portfólio.');
  return response.json();
};

export const createPortfolioItem = async (data: {
  professional: number;
  image_url: string;
  title: string;
  category: string;
  order?: number;
}): Promise<PortfolioItem> => {
  const response = await fetch(`${API_URL}/api/portfolio-items/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao adicionar item ao portfólio.');
  return response.json();
};


export const deletePortfolioItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/portfolio-items/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erro ao remover item do portfólio.');
};

// ─── Scheduling Logic ────────────────────────────────────────────────────────

export interface Slot {
  time: string;
  is_recommended: boolean;
}

export const fetchAvailableSlots = async (
  userId: string,
  date: string,
  serviceId: number | string
): Promise<Slot[]> => {
  const response = await fetch(
    `${API_URL}/api/professional-profile/${userId}/available-slots/?date=${date}&service_id=${serviceId}&t=${Date.now()}`
  );
  if (!response.ok) throw new Error('Erro ao buscar horários disponíveis.');
  return response.json();
};

export const checkConflicts = async (professionalId: number, params: { type: 'opening_hour' | 'block', data: any }) => {
  const response = await fetch(`${API_URL}/api/professional-profile/${professionalId}/check-conflicts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error('Erro ao checar conflitos.');
  return response.json();
};
