import { supabase } from '../lib/supabase';

// Shrinks a photo before uploading, so it uploads fast on mobile data.
export function compressImage(file, maxSize = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not read that photo.'))),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that photo. Try another one.'));
    };
    img.src = url;
  });
}

// Uploads into a private folder named after the rider. Only the rider and admins can view it.
export async function uploadPrivate(bucket, userId, file, prefix = 'photo') {
  const blob = await compressImage(file);
  const path = `${userId}/${prefix}-${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error('Could not upload the photo. Check your connection and try again.');
  return path;
}