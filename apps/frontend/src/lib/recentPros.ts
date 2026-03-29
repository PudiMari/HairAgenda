import { ProfessionalProfile } from "./api";

export const registerProfessionalVisit = (user_id: string | undefined, profile: ProfessionalProfile) => {
  const recentKey = `recent_pros_${user_id || 'guest'}`;
  const recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
  
  const newEntry = {
    id: profile.user_id,
    name: profile.name,
    photo: profile.photo_url,
    location: profile.location
  };
  
  const filtered = recent.filter((p: any) => p.id !== newEntry.id);
  const updated = [newEntry, ...filtered].slice(0, 5);
  localStorage.setItem(recentKey, JSON.stringify(updated));
};
