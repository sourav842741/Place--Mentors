import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVER_URL } from "../config/api";

export const compilerApi = createApi({
  reducerPath: "compilerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json"); //  IMPORTANT
      return headers;
    },
  }),

  tagTypes: ["Compiler"],

  endpoints: (builder) => ({
    runCode: builder.mutation({
      query: ({ code, language, input }) => ({
        url: "/api/compiler/run",
        method: "POST",
        body: { code, language, input },
      }),
    }),
  }),
});

export const { useRunCodeMutation } = compilerApi;
