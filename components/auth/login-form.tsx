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
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginFormProps extends React.ComponentProps<"form"> {
  setView: Dispatch<SetStateAction<"login" | "signup">>;
}

export function LoginForm({ className, setView, ...props }: LoginFormProps) {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data);

    if (success) {
      // Get the updated profile from store
      const currentProfile = useAuthStore.getState().profile;

      if (currentProfile) {
        toast.success("Login successful! Redirecting...");
        // Redirect based on user role
        const dashboardPath =
          currentProfile.role === "user" ? "/chatbot" : "/admin-dashboard";
        router.push(dashboardPath);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <Field className="gap-2">
          <FieldLabel htmlFor="email" className="text-xs">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            {...register("email", { required: true })}
          />
        </Field>

        <Field className="gap-2">
          <FieldLabel htmlFor="password" className="text-xs">
            Password
          </FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
            {...register("password", { required: true })}
          />
        </Field>

        <Field>
          <Button type="submit">
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              variant={"link"}
              onClick={() => setView("signup")}
              className="p-0"
            >
              Sign up
            </Button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
