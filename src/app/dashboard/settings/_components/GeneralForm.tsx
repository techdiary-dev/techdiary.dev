"use client";

import * as userActions from "@/backend/services/user.action";
import { DIRECTORY_NAME, User } from "@/backend/models/domain-models";
import { UserActionInput } from "@/backend/services/inputs/user.input";
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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n/use-translation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React, { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod/v4";
import { Loader2, User2 } from "lucide-react";
import { toast } from "sonner";
import ImageDropzoneWithCropper from "@/components/ImageDropzoneWithCropper";
import { filterUndefined } from "@/lib/utils";

// fields
// name -> ✅
// username -> ✅
// email -> ✅
// profile_photo
// education  -> ✅
// designation -> ✅
// bio -> ✅
// websiteUrl -> ✅
// location -> ✅
// social_links
// profile_readme

interface Props {
  user: User;
}

const GeneralForm: React.FC<Props> = ({ user }) => {
  const { _t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const mutation = useMutation({
    mutationFn: (
      payload: z.infer<typeof UserActionInput.updateMyProfileInput>
    ) => userActions.updateMyProfile(payload),
    onSuccess: () => {
      toast(_t("Profile updated successfully"));
    },
  });
  const form = useForm({
    defaultValues: filterUndefined({
      name: user?.name,
      username: user?.username,
      bio: user?.bio,
      email: user?.email,
      websiteUrl: user.website_url,
      profile_photo: user.profile_photo,
      education: user.education,
      designation: user.designation,
      location: user.location,
    }),
    resolver: zodResolver(UserActionInput.updateMyProfileInput),
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof UserActionInput.updateMyProfileInput>
  > = (payload) => {
    mutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Avatar")}</FormLabel>
              <FormControl>
                <div className="size-30">
                  <ImageDropzoneWithCropper
                    enableCropper
                    label=" "
                    aspectRatio={1}
                    Icon={<User2 />}
                    onUploadComplete={(file) => {
                      form.setValue("profile_photo", file, {
                        shouldValidate: true,
                      });
                      setTimeout(() => {
                        formRef.current?.requestSubmit();
                      }, 0);
                    }}
                    onFileDeleteComplete={() => {
                      form.setValue("profile_photo", null, {
                        shouldValidate: true,
                      });
                      setTimeout(() => {
                        formRef.current?.requestSubmit();
                      }, 0);
                    }}
                    prefillFile={field.value}
                    uploadDirectory={DIRECTORY_NAME.USER_AVATARS}
                  />
                </div>
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Name")}</FormLabel>
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Username")}</FormLabel>
              <FormControl>
                <Input
                  disabled
                  className="py-6"
                  placeholder="shadcn"
                  {...field}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Website url")}</FormLabel>
              <FormControl>
                <Input
                  className="py-6"
                  onChange={field.onChange}
                  value={field.value ?? undefined}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Email")}</FormLabel>
              <FormControl>
                <Input disabled className="py-6" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Bio")}</FormLabel>
              <FormControl>
                <Textarea
                  className="py-6"
                  onChange={field.onChange}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Education")}</FormLabel>
              <FormControl>
                <Input
                  className="py-6"
                  onChange={field.onChange}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Designation")}</FormLabel>
              <FormControl>
                <Input
                  className="py-6"
                  onChange={field.onChange}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_t("Location")}</FormLabel>
              <FormControl>
                <Input
                  className="py-6"
                  onChange={field.onChange}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" />}
          {_t("Save")}
        </Button>
      </form>
    </Form>
  );
};

export default GeneralForm;
