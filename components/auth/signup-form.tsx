import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/authStore";
import { type SignupData } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SignupFormProps extends React.ComponentProps<"form"> {
  setView: Dispatch<SetStateAction<"login" | "signup">>;
}

export function SignupForm({ className, setView, ...props }: SignupFormProps) {
  const { register, handleSubmit, watch, setValue } = useForm<SignupData>({
    defaultValues: { role: "user" },
  });

  const { signup, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  // eslint-disable-next-line react-hooks/incompatible-library
  const role = watch("role");

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: SignupData) => {
    const success = await signup(data);

    if (success) {
      toast.success(
        "Signup successful! Please check your email to confirm your account before logging in."
      );
      router.push("/auth");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm">
            Fill in the form below to create your account
          </p>
        </div>

        {/* Role selection */}
        <Field className="flex-1 gap-2">
          <FieldLabel htmlFor="role" className="text-xs">
            Choose your role
          </FieldLabel>
          <Tabs
            id="role"
            value={role}
            onValueChange={(value) =>
              setValue("role", value as "admin" | "user")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          </Tabs>
        </Field>

        {/* Name fields */}
        <div className="flex gap-4">
          <Field className="flex-1 gap-2">
            <FieldLabel htmlFor="firstName" className="text-xs">
              First Name
            </FieldLabel>
            <Input
              id="firstName"
              placeholder="John"
              {...register("first_name", { required: true })}
            />
          </Field>

          <Field className="flex-1 gap-2">
            <FieldLabel htmlFor="lastName" className="text-xs">
              Last Name
            </FieldLabel>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register("last_name", { required: true })}
            />
          </Field>
        </div>

        {/* Email */}
        <Field className="gap-2">
          <FieldLabel htmlFor="email" className="text-xs">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email", { required: true })}
          />
        </Field>

        {/* Password */}
        <Field className="gap-2">
          <FieldLabel htmlFor="password" className="text-xs">
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password (8+ characters)"
            {...register("password", { required: true })}
          />
        </Field>

        {/* Optional fields */}
        <Field className="gap-2">
          <FieldLabel htmlFor="phone" className="text-xs">
            Phone (Optional)
          </FieldLabel>
          <Input id="phone" {...register("phone")} />
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="birth_date" className="text-xs">
            Date of Birth (Optional)
          </FieldLabel>
          <Input id="birth_date" type="date" {...register("birth_date")} />
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="address" className="text-xs">
            Address (Optional)
          </FieldLabel>
          <Input id="address" {...register("address")} />
        </Field>

        {/* Submit button */}
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Button
              type="button"
              variant="link"
              onClick={() => setView("login")}
              className="p-0"
            >
              Log in
            </Button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
