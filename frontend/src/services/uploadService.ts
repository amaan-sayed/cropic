import api from './api';

export const uploadService = {
  submitObservation: async (formData: FormData) => {
    // We don't need to manually attach the token; our api.ts interceptor does it automatically!
    const response = await api.post('/upload/submit', formData, {
      headers: {
        // This tells the server to expect a file, not just text
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};