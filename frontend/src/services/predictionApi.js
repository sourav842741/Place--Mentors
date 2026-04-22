import api from "./api";

export const predictionApi = {
  // Generate prediction
  predictPlacement: async (data) => {
    const res = await api.post(
      "/api/prediction/predict-placement",
      data,
      {
        withCredentials: true,
      }
    );

    return res.data;
  },

  // Get prediction history
  getHistory: async () => {
    const res = await api.get(
      "/api/prediction/history",
      {
        withCredentials: true,
      }
    );

    return res.data;
  },
};

export default predictionApi;