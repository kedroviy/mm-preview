"use client";

import { Toast as PrimeToast } from "primereact/toast";
import { useEffect, useRef } from "react";
import type { ToastMessage } from "../../services/notification";
import { notificationService } from "../../services/notification";
import "./Toast.css";

export function Toast() {
  // biome-ignore lint/suspicious/noExplicitAny: PrimeReact 10 Toast type is not fully typed yet
  const toastRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(
      (message: ToastMessage) => {
        Promise.resolve().then(() => {
          if (toastRef.current) {
            toastRef.current.show(message);
          }
        });
      },
    );

    return unsubscribe;
  }, []);

  return (
    <div className="mm-toast">
      <PrimeToast
        // biome-ignore lint/suspicious/noExplicitAny: PrimeReact Toast ref type
        ref={toastRef as any}
      />
    </div>
  );
}
