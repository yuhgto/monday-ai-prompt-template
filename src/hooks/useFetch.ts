import { useCallback, useState } from "react";

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

enum HttpRequestStatus {
  IDLE = "idle",
  ACTIVE = "active",
  FAILED = "failed",
  SUCCESS = "success",
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function useFetch<T>() {
  const [status, setStatus] = useState<HttpRequestStatus>(
    HttpRequestStatus.IDLE
  );
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();

  const loading = status === HttpRequestStatus.ACTIVE;

  const fetchData = useCallback(async (url: string, options:Record<string, any>) => {
    if (!url) {
      return null;
    }

    setStatus(HttpRequestStatus.ACTIVE);
    setData(undefined);
    setError(undefined);

    let responseData;
    try {
      const response = await fetch(url, options);
      responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error);
      }

      setData(responseData);
      setStatus(HttpRequestStatus.SUCCESS);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      setError(errorMessage);
      setStatus(HttpRequestStatus.FAILED);
    }

    return responseData;
  }, []);

  return { data, status, error, loading, fetchData };
}

export { useFetch };
