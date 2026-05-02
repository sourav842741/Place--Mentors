import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SERVER_URL } from '../config/api';

// RTK Query API
export const notesApi = createApi({
  reducerPath: 'notesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notes'],
  endpoints: (builder) => ({
    // List notes
    getMyNotes: builder.query({
      query: () => '/api/notes/getnotes',
      providesTags: ['Notes'],
    }),

    // Single note
    getSingleNote: builder.query({
      query: (id) => `/api/notes/${id}`,
      providesTags: ['Notes'],
    }),

    // Generate new
    generateNotes: builder.mutation({
      query: (formData) => ({
        url: '/api/notes/generate-notes',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Notes'],
    }),

    // PDF download
    generatePDF: builder.mutation({
      query: (aiResponse) => ({
        url: '/api/pdf/generate-pdf',
        method: 'POST',
        body: { result: aiResponse },
        responseHandler: async (response) => response.blob(),
      }),
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetMyNotesQuery,
  useGetSingleNoteQuery,
  useGenerateNotesMutation,
  useGeneratePDFMutation,
} = notesApi;
