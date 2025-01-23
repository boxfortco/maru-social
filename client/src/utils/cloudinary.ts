import { toast } from "@/hooks/use-toast";

const uploadImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'maru_preset');  // Your preset
    
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dz9wyfepq/image/upload',  // Your cloud name
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    console.log('Upload successful:', data);  // This will help debug
    return data;
  } catch (error) {
    console.error('Upload error details:', error);
    throw error;
  }
};

export default uploadImage;
