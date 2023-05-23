import { useCallback } from "react";
import { useFetch } from "./useFetch";

export type PromptsApiPayloadType = {
  prompts: string | string[];
  items: { id: string }[];
  n: number;
};

export function useAiApi<T, K>(route: string, sessionToken: string) {
    const fetcher = useFetch();

    const fullUrl = '/api' + route;

    const fetchData = useCallback(
      (body: T) => {
        const defaultOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : sessionToken ?? '',
            }
        }
        const options = {
            ...defaultOptions,
            body: JSON.stringify(body)
        };
  
        return fetcher.fetchData(fullUrl, options);
      },
      [sessionToken, fetcher, fullUrl]
    );
    return { ...fetcher, fetchData}
}