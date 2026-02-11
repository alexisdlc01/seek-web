import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { ErrorDto } from '../client';

export type ErrorType<_Error> = AxiosError<ErrorDto>;

export const AXIOS_INSTANCE = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true
});

export const customInstance = async <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    return await AXIOS_INSTANCE({
        ...config,
        ...options,
    }).then(({ data }) => data);
};

export default customInstance;
