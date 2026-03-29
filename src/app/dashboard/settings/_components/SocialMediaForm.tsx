"use client";

import { User } from "@/backend/models/domain-models";
import { UserActionInput } from "@/backend/services/inputs/user.input";
import * as userActions from "@/backend/services/user.action";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/use-translation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";

interface Props {
  user: User;
}

const SocialMediaForm: React.FC<Props> = ({ user }) => {
  const { _t } = useTranslation();
  const mutation = useMutation({
    mutationFn: (
      payload: z.infer<typeof UserActionInput.updateMyProfileInput>
    ) => userActions.updateMyProfile(payload),
    onSuccess: () => {
      toast.success(_t("Social links updated successfully"));
    },
    onError: (error) => {
      toast.error(_t("Failed to update social links"));
      console.error("Error updating social links:", error);
    },
  });

  const form = useForm({
    mode: "all",
    defaultValues: {
      social_links: {
        github: user?.social_links?.github,
        x: user?.social_links?.x,
        linkedin: user?.social_links?.linkedin,
        facebook: user?.social_links?.facebook,
        instagram: user?.social_links?.instagram,
        youtube: user?.social_links?.youtube,
      },
    },
    resolver: zodResolver(UserActionInput.updateMyProfileInput),
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof UserActionInput.updateMyProfileInput>
  > = (data) => {
    mutation.mutate({
      social_links: {
        github: data.social_links?.github,
        x: data.social_links?.x,
        linkedin: data.social_links?.linkedin,
        facebook: data.social_links?.facebook,
        instagram: data.social_links?.instagram,
        youtube: data.social_links?.youtube,
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="social_links.github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Github")}</FormLabel>
              <FormControl>
                <Input className="py-6" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_links.facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Facebook")}</FormLabel>
              <FormControl>
                <Input className="py-6" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_links.instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Instagram")}</FormLabel>
              <FormControl>
                <Input className="py-6" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_links.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("LinkedIn")}</FormLabel>
              <FormControl>
                <Input className="py-6" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_links.x"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("X")}</FormLabel>
              <FormControl>
                <Input className="py-6" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_links.youtube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Youtube")}</FormLabel>
              <FormControl>
                <Input className="py-6" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={mutation.isPending || !form.formState.isValid}
        >
          {mutation.isPending && <Loader className="animate-spin" />}
          {_t("Save")}
        </Button>
      </form>
    </Form>
  );
};

export default SocialMediaForm;
