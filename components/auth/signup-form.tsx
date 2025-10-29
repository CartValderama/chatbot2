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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { type SignupData } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface SignupFormProps extends React.ComponentProps<"form"> {
  setView: Dispatch<SetStateAction<"login" | "signup">>;
}

export function SignupForm({ className, setView, ...props }: SignupFormProps) {
  const { register, handleSubmit, watch, setValue } = useForm<SignupData>({
    defaultValues: { userType: "patient" },
  });

  const { signup, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const userType = watch("userType");

  useEffect(() => {
    if (error) {
      alert(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: SignupData) => {
    const success = await signup(data);

    if (success) {
      alert(
        "Signup successful! Please check your email to confirm, then you can login."
      );
      // Switch to login tab
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
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Field className=" gap-2">
          <Tabs
            value={userType}
            onValueChange={(value) =>
              setValue("userType", value as "patient" | "doctor")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>
          </Tabs>
        </Field>
        <div className="flex gap-4">
          {/* First Name */}
          <Field className="flex-1 gap-2">
            <FieldLabel htmlFor="firstName" className="text-xs">
              First Name
            </FieldLabel>
            <Input
              id="firstName"
              placeholder="John"
              {...register("firstName", { required: true })}
            />
          </Field>

          {/* Last Name */}
          <Field className="flex-1 gap-2">
            <FieldLabel htmlFor="lastName" className="text-xs">
              Last Name
            </FieldLabel>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register("lastName", { required: true })}
            />
          </Field>
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
            placeholder="Enter your password 8+ characters"
            required
            {...register("password", { required: true })}
          />
        </Field>
        <Field className="gap-2">
          <FieldLabel htmlFor="confirm-password" className="text-xs">
            Phone (Optional)
          </FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register("phone")}
          />
        </Field>
        {userType === "doctor" && (
          <>
            <Field className="gap-2">
              <FieldLabel htmlFor="specialty" className="text-xs">
                Specialty
              </FieldLabel>
              <Input
                id="specialty"
                placeholder="e.g., Cardiology"
                {...register("specialty", { required: true })}
              />
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="hospital" className="text-xs">
                Hospital
              </FieldLabel>
              <Input
                id="hospital"
                placeholder="Hospital name"
                {...register("hospital", { required: true })}
              />
            </Field>
          </>
        )}
        <Field>
          <Button type="submit">
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Button
              type="button"
              variant={"link"}
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
