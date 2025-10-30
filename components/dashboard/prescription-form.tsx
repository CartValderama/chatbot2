"use client";

import * as React from "react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Medicine, Prescription, Doctor } from "@/types/database";
import type { AdminUser } from "@/services/adminService";

const prescriptionSchema = z.object({
  user_id: z.string().min(1, "Please select a patient"),
  doctor_id: z.string().min(1, "Please select a doctor"),
  medicine_id: z.string().min(1, "Please select a medicine"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  instructions: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: AdminUser[];
  doctors: Doctor[];
  medicines: Medicine[];
  onSubmit: (data: PrescriptionFormValues) => Promise<void>;
  editPrescription?: Prescription | null;
}

export function PrescriptionForm({
  open,
  onOpenChange,
  patients,
  doctors,
  medicines,
  onSubmit,
  editPrescription,
}: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<PrescriptionFormValues>({
    user_id: "",
    doctor_id: "",
    medicine_id: "",
    dosage: "",
    frequency: "",
    instructions: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof PrescriptionFormValues, string>>
  >({});

  // Populate form when editing
  React.useEffect(() => {
    if (editPrescription) {
      setFormData({
        user_id: String(editPrescription.user_id),
        doctor_id: String(editPrescription.doctor_id),
        medicine_id: String(editPrescription.medicine_id),
        dosage: editPrescription.dosage ? String(editPrescription.dosage) : "",
        frequency: editPrescription.frequency
          ? String(editPrescription.frequency)
          : "",
        instructions: editPrescription.instructions ?? "",
        start_date: editPrescription.start_date,
        end_date: editPrescription.end_date ?? "",
      });
    } else {
      // Reset form when creating new
      setFormData({
        user_id: "",
        doctor_id: "",
        medicine_id: "",
        dosage: "",
        frequency: "",
        instructions: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
    }
    setErrors({});
  }, [editPrescription, open]);

  const handleChange = (field: keyof PrescriptionFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Check if form is valid (all required fields filled)
  const isFormValid = React.useMemo(() => {
    return (
      formData.user_id !== "" &&
      formData.doctor_id !== "" &&
      formData.medicine_id !== "" &&
      formData.dosage !== "" &&
      formData.frequency !== "" &&
      formData.start_date !== "" &&
      formData.end_date !== ""
    );
  }, [formData]);

  const validate = (): boolean => {
    const result = prescriptionSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof PrescriptionFormValues, string>> =
        {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as keyof PrescriptionFormValues] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        user_id: "",
        doctor_id: "",
        medicine_id: "",
        dosage: "",
        frequency: "",
        instructions: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!editPrescription;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
        <DrawerHeader>
          <DrawerTitle className="text-xl">
            {isEditing ? "Edit Prescription" : "Create New Prescription"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? "Update the prescription details below."
              : "Fill in the details below to create a prescription for your patient."}
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4 overflow-y-auto"
        >
          {/* Patient Selection */}
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="user_id">Patient *</Label>
            <Select
              value={formData.user_id}
              onValueChange={(value) => handleChange("user_id", value)}
            >
              <SelectTrigger id="user_id" className="w-full">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem
                    key={patient.user_id}
                    value={String(patient.user_id)}
                  >
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user_id && (
              <p className="text-sm text-red-500">{errors.user_id}</p>
            )}
          </div>

          {/* Doctor Selection */}
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="doctor_id">Doctor *</Label>
            <Select
              value={formData.doctor_id}
              onValueChange={(value) => handleChange("doctor_id", value)}
            >
              <SelectTrigger id="doctor_id" className="w-full">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem
                    key={doctor.doctor_id}
                    value={String(doctor.doctor_id)}
                  >
                    {doctor.name}
                    {doctor.speciality && (
                      <span className="text-muted-foreground text-xs ml-2">
                        - {doctor.speciality}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.doctor_id && (
              <p className="text-sm text-red-500">{errors.doctor_id}</p>
            )}
          </div>

          {/* Medicine Selection */}
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="medicine_id">Medicine *</Label>
            <Select
              value={formData.medicine_id}
              onValueChange={(value) => handleChange("medicine_id", value)}
            >
              <SelectTrigger id="medicine_id" className="w-full">
                <SelectValue placeholder="Select a medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((medicine) => (
                  <SelectItem
                    key={medicine.medicine_id}
                    value={String(medicine.medicine_id)}
                  >
                    {medicine.name}
                    {medicine.type && (
                      <span className="text-muted-foreground text-xs ml-2">
                        ({medicine.type})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.medicine_id && (
              <p className="text-sm text-red-500">{errors.medicine_id}</p>
            )}
          </div>

          {/* Dosage and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg"
                value={formData.dosage}
                onChange={(e) => handleChange("dosage", e.target.value)}
              />
              {errors.dosage && (
                <p className="text-sm text-red-500">{errors.dosage}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Input
                id="frequency"
                placeholder="e.g., Twice daily"
                value={formData.frequency}
                onChange={(e) => handleChange("frequency", e.target.value)}
              />
              {errors.frequency && (
                <p className="text-sm text-red-500">{errors.frequency}</p>
              )}
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="instructions">Instructions (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Provide any additional instructions or notes for the patient.
            </p>
            <textarea
              id="instructions"
              placeholder="Additional instructions for the patient..."
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
            />
          </div>
        </form>

        <DrawerFooter className="mt-0">
          {!isFormValid && !isSubmitting && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">
                Please fill in all required fields (*)
              </p>
            </div>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Prescription"
              : "Create Prescription"}
          </Button>

          <DrawerClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
