const API_URL = import.meta.env.VITE_API_URL || "https://hair-agenda-backend.vercel.app";

export const fetchHealthStatus = async () => {
  const response = await fetch(`${API_URL}/api/health/`);
  return response.json();
};

export interface AppointmentPayload {
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
  const response = await fetch(`${API_URL}/api/services/`);
  if (!response.ok) throw new Error('Erro ao buscar serviços.');
  return response.json();
};

export const fetchAppointments = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/api/appointments/`);
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
