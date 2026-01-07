"use client";

import { useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { Button } from "@mm-preview/ui";
import { useCreateUser } from "../hooks/useCreateUser";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function UserCreationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserFormData>();

  const { mutate, isPending, isError } = useCreateUser();

  const password = watch("password");

  const onSubmit = (data: UserFormData) => {
    mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>
        
        {isError && (
          <Message severity="error" text="Failed to create account. Please try again." className="mb-4" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <InputText
              id="name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className={errors.name ? "p-invalid" : ""}
              placeholder="Enter your name"
            />
            {errors.name && (
              <small className="p-error">{errors.name.message}</small>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={errors.email ? "p-invalid" : ""}
              placeholder="Enter your email"
            />
            {errors.email && (
              <small className="p-error">{errors.email.message}</small>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <Password
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className={errors.password ? "p-invalid" : ""}
              placeholder="Enter your password"
              toggleMask
              feedback={false}
            />
            {errors.password && (
              <small className="p-error">{errors.password.message}</small>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="font-medium">
              Confirm Password
            </label>
            <Password
              id="confirmPassword"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className={errors.confirmPassword ? "p-invalid" : ""}
              placeholder="Confirm your password"
              toggleMask
              feedback={false}
            />
            {errors.confirmPassword && (
              <small className="p-error">
                {errors.confirmPassword.message}
              </small>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
            size="large"
          >
            {isPending ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}


