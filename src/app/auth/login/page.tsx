"use client";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ErrorMessage } from "@hookform/error-message";
import BaseLayout from "@/components/layout/BaseLayout";
import { Button, Input, Text } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { AuthRepository } from "@/http/repositories/auth.repository";
import { useMutation } from "@tanstack/react-query";
import { ensureCSRF } from "@/utils/ensureCSRF";
import { showNotification } from "@mantine/notifications";
import { AxiosError } from "axios";

const LoginPage = () => {
  const api = new AuthRepository();
  const loginMutation = useMutation({
    mutationFn: (payload: ILoginFormPayload) => api.login(payload),
  });

  const form = useForm<ILoginFormPayload>({
    resolver: yupResolver(formValidationSchema),
  });

  const onSubmit = async (data: ILoginFormPayload) => {
    await ensureCSRF(() => {
      loginMutation.mutate(data, {
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: (e) => {
          if (e instanceof AxiosError) {
            showNotification({
              title: e.response?.data?.message || "Login failed",
              message: "",
              color: "red",
            });
          } else {
            showNotification({
              title: "Error",
              message: "Login failed",
              color: "red",
            });
          }
        },
      });
    });
  };

  return (
    <BaseLayout>
      <div className="max-w-96 mx-auto my-10">
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Input.Wrapper
            error={
              <ErrorMessage name={"email"} errors={form?.formState?.errors} />
            }
          >
            <Input
              placeholder="Email"
              type="email"
              size="lg"
              variant="filled"
              {...form.register("email")}
            />
          </Input.Wrapper>
          <Input.Wrapper
            error={
              <ErrorMessage
                name={"password"}
                errors={form?.formState?.errors}
              />
            }
          >
            <Input
              placeholder="Password"
              type="password"
              size="lg"
              variant="filled"
              {...form.register("password")}
            />
          </Input.Wrapper>
          <Button type="submit" size="lg" loading={loginMutation?.isPending}>
            লগইন
          </Button>
        </form>

        <div className="mt-10 flex flex-col gap-3">
          <Link className="text-lg" href={"/auth/forgot-password"}>
            পাসসোয়ার্ড ভুলে গেছেন?
          </Link>

          <Link className="text-lg" href={"/auth/register"}>
            একাউন্ট নিবন্ধন করুন
          </Link>
        </div>
      </div>
    </BaseLayout>
  );
};

const formValidationSchema = yup.object({
  email: yup.string().email().required().label("Email"),
  password: yup.string().min(6).max(32).required().label("Password"),
});

type ILoginFormPayload = yup.InferType<typeof formValidationSchema>;

export default LoginPage;
