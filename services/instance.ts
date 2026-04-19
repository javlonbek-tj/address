import axios, { AxiosError } from 'axios';

export type ApiErrorResponse = {
  success: false;
  message?: string;
  error?: string;
};

export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const responseData = error.response?.data;
    const status = error.response?.status;

    if (status === 403) {
      window.location.href = '/unauthorized';
      return new Promise(() => {});
    } else if (responseData?.message) {
      error.message = responseData.message;
    } else {
      error.message = 'Xatolik yuz berdi';
    }

    return Promise.reject(error);
  }
);
