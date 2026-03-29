---
name: new-form
description: Scaffold a React Hook Form with Zod validation, useMutation, and toast notifications
---

Create a form component using React Hook Form + Zod + TanStack Query mutation in techdiary.dev.

## Rules

- Always `"use client"` at the top
- Use `zodResolver` from `@hookform/resolvers/zod`
- Reuse the existing Zod schema from `src/backend/services/inputs/<domain>.input.ts` — do not duplicate schema definitions
- Use `filterUndefined()` for default values to avoid uncontrolled→controlled warnings
- Submit handler must be typed as `SubmitHandler<z.infer<typeof Schema>>`
- Call server action via `useMutation`, never call it directly in `onSubmit`
- Show toast on success and error
- Use shadcn/ui Form primitives: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`

## Template

```tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as <domain>Actions from "@/backend/services/<domain>.action";
import { <Domain>Input } from "@/backend/services/inputs/<domain>.input";
import { filterUndefined } from "@/lib/utils";

type FormValues = z.infer<typeof <Domain>Input.<schemaName>>;

interface Props {
  // initial data if editing
}

export const <Name>Form: React.FC<Props> = ({ /* props */ }) => {
  const form = useForm<FormValues>({
    defaultValues: filterUndefined({
      field: "",
    }),
    resolver: zodResolver(<Domain>Input.<schemaName>),
  });

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => <domain>Actions.<actionName>(payload),
    onSuccess: () => {
      toast("Saved successfully");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message ?? "Something went wrong");
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (payload) => {
    mutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
};
```

## Steps

1. Ask for the domain, the Zod schema to use, and the list of form fields with their types.
2. Ask if this is a create or edit form (edit forms receive initial data as props).
3. Ask where to place the component (feature directory or shared components).
4. Generate the form component.
