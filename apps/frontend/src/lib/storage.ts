import { supabase } from './supabase';

/**
 * Uploads a file to a Supabase bucket and returns the public URL.
 * @param file The file to upload
 * @param bucket The bucket name (default: 'portfolio')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, bucket: string = 'portfolio'): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase não está configurado.');
  }

  // Generate a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  // Upload the file
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error('[Storage] Upload error:', error);
    throw new Error(`Falha no upload: ${error.message}. Verifique se o bucket "${bucket}" existe e está público.`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}
