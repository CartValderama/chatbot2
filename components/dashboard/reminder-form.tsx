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
import type { Reminder, Prescription, ReminderStatus } from "@/types/database";
import type { AdminUser } from "@/services/adminService";

const reminderSchema = z.object({
  user_id: z.string().min(1, "Please select a patient"),
  prescription_id: z.string().min(1, "Please select a prescription"),
  reminder_datetime: z.string().min(1, "Reminder date and time is required"),
  status: z.enum(["Pending", "Sent", "Acknowledged", "Missed"]),
  notes: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: AdminUser[];
  prescriptions: Prescription[];
  onSubmit: (data: ReminderFormValues) => Promise<void>;
  editReminder?: Reminder | null;
}

export function ReminderForm({
  open,
  onOpenChange,
  patients,
  prescriptions,
  onSubmit,
  editReminder,
}: ReminderFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<ReminderFormValues>({
    user_id: "",
    prescription_id: "",
    reminder_datetime: "",
    status: "Pending",
    notes: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ReminderFormValues, string>>
  >({});

  // Filter prescriptions based on selected patient
  const filteredPrescriptions = React.useMemo(() => {
    if (!formData.user_id) return [];
    return prescriptions.filter(
      (p) => String(p.user_id) === formData.user_id
    );
  }, [formData.user_id, prescriptions]);

  // Populate form when editing
  React.useEffect(() => {
    if (editReminder) {
      setFormData({
        user_id: String(editReminder.user_id),
        prescription_id: String(editReminder.prescription_id),
        reminder_datetime: editReminder.reminder_datetime.slice(0, 16), // Format for datetime-local input
        status: editReminder.status,
        notes: editReminder.notes ?? "",
      });
    } else {
      // Reset form when creating new
      setFormData({
        user_id: "",
        prescription_id: "",
        reminder_datetime: "",
        status: "Pending",
        notes: "",
      });
    }
    setErrors({});
  }, [editReminder, open]);

  const handleChange = (field: keyof ReminderFormValues, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset prescription selection when patient changes
      if (field === "user_id" && value !== prev.user_id) {
        newData.prescription_id = "";
      }

      return newData;
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Check if form is valid (all required fields filled)
  const isFormValid = React.useMemo(() => {
    return (
      formData.user_id !== "" &&
      formData.prescription_id !== "" &&
      formData.reminder_datetime !== ""
    );
  }, [formData]);

  const validate = (): boolean => {
    const result = reminderSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof ReminderFormValues, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as keyof ReminderFormValues] = err.message;
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
        prescription_id: "",
        reminder_datetime: "",
        status: "Pending",
        notes: "",
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!editReminder;

  // Get patient name for a prescription
  const getPatientName = (userId: number) => {
    const patient = patients.find((p) => p.user_id === userId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown";
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
        <DrawerHeader>
          <DrawerTitle className="text-xl">
            {isEditing ? "Edit Reminder" : "Create New Reminder"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? "Update the reminder details below."
              : "Fill in the details below to create a reminder for a patient's prescription."}
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

          {/* Prescription Selection */}
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="prescription_id">Prescription *</Label>
            <Select
              value={formData.prescription_id}
              onValueChange={(value) => handleChange("prescription_id", value)}
              disabled={!formData.user_id}
            >
              <SelectTrigger id="prescription_id" className="w-full">
                <SelectValue placeholder={
                  formData.user_id
                    ? "Select a prescription"
                    : "Select a patient first"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredPrescriptions.map((prescription) => (
                  <SelectItem
                    key={prescription.prescription_id}
                    value={String(prescription.prescription_id)}
                  >
                    {prescription.medicine?.name || "Unknown Medicine"} - {prescription.dosage}
                    <span className="text-muted-foreground text-xs ml-2">
                      ({prescription.frequency})
                    </span>
                  </SelectItem>
                ))}
                {filteredPrescriptions.length === 0 && formData.user_id && (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No prescriptions found for this patient
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.prescription_id && (
              <p className="text-sm text-red-500">{errors.prescription_id}</p>
            )}
          </div>

          {/* Reminder Date and Time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="reminder_datetime">Reminder Date & Time *</Label>
            <Input
              id="reminder_datetime"
              type="datetime-local"
              value={formData.reminder_datetime}
              onChange={(e) => handleChange("reminder_datetime", e.target.value)}
            />
            {errors.reminder_datetime && (
              <p className="text-sm text-red-500">{errors.reminder_datetime}</p>
            )}
          </div>

          {/* Status Selection */}
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value as ReminderStatus)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Add any additional notes or instructions for this reminder.
            </p>
            <textarea
              id="notes"
              placeholder="Additional notes..."
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
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
              ? "Update Reminder"
              : "Create Reminder"}
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
