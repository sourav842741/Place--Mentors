import api from './api';

//  Generate Notes
export const generateNotesAPI = (data) => api.post('/api/notes/generate-notes', data);

//  Get all notes
export const getMyNotesAPI = () => api.get('/api/notes/getnotes');

//  Get single note
export const getSingleNoteAPI = (id) => api.get(`/api/notes/${id}`);

//  Generate PDF
export const generatePDFAPI = (data) =>
  api.post('/api/pdf/generate-pdf', data, {
    responseType: 'blob',
  });
