import { useCallback, useRef, useState } from "react";
import { NotificationContext } from "./useNotification";

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const notify = useCallback((message, type = "info", duration = 3000) => {
    if (!message) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setNotification({ message, type });

    if (duration) {
      timeoutRef.current = setTimeout(() => {
        setNotification(null);
        timeoutRef.current = null;
      }, duration);
    }
  }, []);

  const value = { notify };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div className={`toast toast--${notification.type || "info"}`}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}
