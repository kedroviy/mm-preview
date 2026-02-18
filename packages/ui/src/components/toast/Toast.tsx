"use client";

import { Toast as PrimeToast } from "primereact/toast";
import { useEffect, useRef } from "react";
import type { ToastMessage } from "../../services/notification";
import { notificationService } from "../../services/notification";

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

  // biome-ignore lint/suspicious/noExplicitAny: PrimeReact 10 Toast type is not fully typed yet
  return <PrimeToast ref={toastRef as any} />;
}
