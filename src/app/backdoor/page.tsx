"use client";

import { UserSessionInput } from "@/backend/services/inputs/session.input";
import { createLoginSessionForBackdoor } from "@/backend/services/session.actions";
import HomepageLayout from "@/components/layout/HomepageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actionPromisify } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod/v4";

const Backdoor = () => {
  const mutation = useMutation({
    mutationFn: (
      input: z.infer<typeof UserSessionInput.createBackdoorLoginSessionInput>
    ) => actionPromisify(createLoginSessionForBackdoor(input)),
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
  });

  const backdoorLoginForm = useForm({
    defaultValues: {
      secret: "",
      user_id: "",
    },
    resolver: zodResolver(UserSessionInput.createBackdoorLoginSessionInput),
  });

  const handleSubmitBackdoorLogin: SubmitHandler<
    z.infer<typeof UserSessionInput.createBackdoorLoginSessionInput>
  > = (data) => {
    mutation.mutate(data);
  };

  return (
    <HomepageLayout>
      <form
        onSubmit={backdoorLoginForm.handleSubmit(handleSubmitBackdoorLogin)}
        className="flex flex-col gap-3 px-2"
      >
        <Input placeholder="uid" {...backdoorLoginForm.register("user_id")} />
        <Input placeholder="secret" {...backdoorLoginForm.register("secret")} />
        <Button type="submit">Process</Button>
      </form>
    </HomepageLayout>
  );
};

export default Backdoor;
