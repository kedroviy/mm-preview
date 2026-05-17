"use client";

import { InputText } from "@mm-preview/ui";
import {
  Controller,
  type FieldPath,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";
import type { AuthFormData } from "../types/auth";

interface AuthFormFieldProps {
  name: FieldPath<AuthFormData>;
  label: string;
  type?: "email" | "password" | "text";
  placeholder: string;
  rules?: RegisterOptions<AuthFormData, FieldPath<AuthFormData>>;
  disabled?: boolean;
}

export function AuthFormField({
  name,
  label,
  type = "text",
  placeholder,
  rules,
  disabled = false,
}: AuthFormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<AuthFormData>();

  const fieldError = errors[name];
  const inputId = String(name);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="font-medium">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <InputText
            id={inputId}
            type={type}
            {...field}
            value={field.value || ""}
            disabled={disabled}
            className={
              fieldError ? "p-invalid !bg-red-50 dark:!bg-red-900/20" : ""
            }
            placeholder={placeholder}
          />
        )}
      />
      {fieldError?.message && (
        <small className="p-error text-red-600 dark:text-red-400">
          {fieldError.message}
        </small>
      )}
    </div>
  );
}
