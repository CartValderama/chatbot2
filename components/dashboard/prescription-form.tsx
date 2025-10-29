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
import type { Medicine, Prescription } from "@/types/patient";
import type { DoctorPatient } from "@/services/doctorService";

const prescriptionSchema = z.object({
  patient_id: z.string().min(1, "Please select a patient"),
  medicine_id: z.string().min(1, "Please select a medicine"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  instructions: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: DoctorPatient[];
  medicines: Medicine[];
  doctorId: string;
  onSubmit: (data: PrescriptionFormValues) => Promise<void>;
  editPrescription?: Prescription | null;
}

export function PrescriptionForm({
  open,
  onOpenChange,
  patients,
  medicines,
  onSubmit,
  editPrescription,
}: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<PrescriptionFormValues>({
    patient_id: "",
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
        patient_id: editPrescription.patient_id,
        medicine_id: editPrescription.medicine_id,
        dosage: editPrescription.dosage,
        frequency: editPrescription.frequency,
        instructions: editPrescription.instructions || "",
        start_date: editPrescription.start_date,
        end_date: editPrescription.end_date || "",
      });
    } else {
      // Reset form when creating new
      setFormData({
        patient_id: "",
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
        patient_id: "",
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
          <DrawerTitle>
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
          className="flex flex-col gap-4 px-4 overflow-y-auto flex-1"
        >
          {/* Patient Selection */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="patient_id">Patient *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={(value) => handleChange("patient_id", value)}
            >
              <SelectTrigger id="patient_id">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.user_id} value={patient.user_id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patient_id && (
              <p className="text-sm text-red-500">{errors.patient_id}</p>
            )}
          </div>

          {/* Medicine Selection */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="medicine_id">Medicine *</Label>
            <Select
              value={formData.medicine_id}
              onValueChange={(value) => handleChange("medicine_id", value)}
            >
              <SelectTrigger id="medicine_id">
                <SelectValue placeholder="Select a medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((medicine) => (
                  <SelectItem
                    key={medicine.medicine_id}
                    value={medicine.medicine_id}
                  >
                    {medicine.name}
                    {medicine.manufacturer && (
                      <span className="text-muted-foreground text-xs ml-2">
                        ({medicine.manufacturer})
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
              <Label htmlFor="end_date">End Date (Optional)</Label>
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
            <textarea
              id="instructions"
              placeholder="Additional instructions for the patient..."
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Provide any additional instructions or notes for the patient.
            </p>
          </div>
        </form>

        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Prescription"
              : "Create Prescription"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
