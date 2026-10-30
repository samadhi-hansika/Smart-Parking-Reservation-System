import { useState, useEffect, useCallback } from "react";
import { subscribeLocations, getLocations } from "../services/adminService";

export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLocations();
      setLocations(data);
      setError(null);
    } catch (err) {
      console.error("Error refreshing locations:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeLocations(
      (data) => {
        setLocations(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useLocations subscription error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { locations, loading, error, refresh };
}
