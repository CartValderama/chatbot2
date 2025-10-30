"use client";

import * as React from "react";
import * as z from "zod";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/dashboard/data-table";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HealthRecord } from "@/types/database";
import type { AdminUser } from "@/services/adminService";
import { useAdminStore } from "@/stores/adminStore";

interface HealthRecordsManagementProps {
  healthRecords: HealthRecord[];
  patients: AdminUser[];
}

const healthRecordSchema = z.object({
  user_id: z.string().min(1, "Please select a patient"),
  heart_rate: z.string().optional(),
  blood_pressure: z.string().optional(),
  blood_sugar: z.string().optional(),
  temperature: z.string().optional(),
  notes: z.string().optional(),
});

type HealthRecordFormValues = z.infer<typeof healthRecordSchema>;

export function HealthRecordsManagement({
  healthRecords,
  patients,
}: HealthRecordsManagementProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<number | null>(
    null
  );
  const [editingRecord, setEditingRecord] = React.useState<HealthRecord | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    fetchUsersHealthRecords,
  } = useAdminStore();
  const [formData, setFormData] = React.useState<HealthRecordFormValues>({
    user_id: "",
    heart_rate: "",
    blood_pressure: "",
    blood_sugar: "",
    temperature: "",
    notes: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof HealthRecordFormValues, string>>
  >({});

  // Create a map of patient IDs to patient names
  const patientMap = React.useMemo(() => {
    const map = new Map<number, string>();
    patients.forEach((patient) => {
      map.set(patient.user_id, `${patient.first_name} ${patient.last_name}`);
    });
    return map;
  }, [patients]);

  // Populate form when editing
  React.useEffect(() => {
    if (editingRecord) {
      setFormData({
        user_id: String(editingRecord.user_id),
        heart_rate: editingRecord.heart_rate?.toString() || "",
        blood_pressure: editingRecord.blood_pressure || "",
        blood_sugar: editingRecord.blood_sugar?.toString() || "",
        temperature: editingRecord.temperature?.toString() || "",
        notes: editingRecord.notes || "",
      });
      setFormOpen(true);
    } else {
      setFormData({
        user_id: "",
        heart_rate: "",
        blood_pressure: "",
        blood_sugar: "",
        temperature: "",
        notes: "",
      });
    }
    setErrors({});
  }, [editingRecord]);

  const handleChange = (field: keyof HealthRecordFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Check if form is valid (at least patient and one health metric)
  const isFormValid = React.useMemo(() => {
    const hasPatient = formData.user_id !== "";
    const hasAtLeastOneMetric =
      formData.heart_rate !== "" ||
      formData.blood_pressure !== "" ||
      formData.blood_sugar !== "" ||
      formData.temperature !== "" ||
      formData.notes !== "";
    return hasPatient && hasAtLeastOneMetric;
  }, [formData]);

  const validate = (): boolean => {
    const result = healthRecordSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof HealthRecordFormValues, string>> =
        {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as keyof HealthRecordFormValues] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const recordData = {
        user_id: parseInt(formData.user_id),
        date_time: new Date().toISOString(),
        heart_rate: formData.heart_rate
          ? parseInt(formData.heart_rate)
          : undefined,
        blood_pressure: formData.blood_pressure || undefined,
        blood_sugar: formData.blood_sugar
          ? parseFloat(formData.blood_sugar)
          : undefined,
        temperature: formData.temperature
          ? parseFloat(formData.temperature)
          : undefined,
        notes: formData.notes || undefined,
      };

      if (editingRecord) {
        const result = await updateHealthRecord(
          editingRecord.record_id,
          recordData
        );

        if (result.success) {
          toast.success("Health record updated successfully!");
          await fetchUsersHealthRecords(); // Refresh the table
          handleCloseForm();
        } else {
          toast.error(result.error || "Failed to update health record");
        }
      } else {
        const result = await createHealthRecord(recordData);

        if (result.success) {
          toast.success("Health record created successfully!");
          await fetchUsersHealthRecords(); // Refresh the table
          handleCloseForm();
        } else {
          toast.error(result.error || "Failed to create health record");
        }
      }
    } catch (error) {
      console.error("Error submitting health record:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRecord(null);
    setIsSubmitting(false);
    setFormData({
      user_id: "",
      heart_rate: "",
      blood_pressure: "",
      blood_sugar: "",
      temperature: "",
      notes: "",
    });
    setErrors({});
  };

  const handleEditClick = (record: HealthRecord) => {
    setEditingRecord(record);
  };

  const handleDeleteClick = (recordId: number) => {
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    const result = await deleteHealthRecord(recordToDelete);
    if (result.success) {
      toast.success("Health record deleted successfully");
      await fetchUsersHealthRecords(); // Refresh the table
    } else {
      toast.error(result.error || "Failed to delete health record");
    }
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Define columns for the data table
  const columns: ColumnDef<HealthRecord>[] = React.useMemo(
    () => [
      {
        id: "patientName",
        accessorFn: (row) => patientMap.get(row.user_id) || "Unknown Patient",
        header: "Patient",
        cell: ({ row }) => (
          <div className="font-medium capitalize">
            {patientMap.get(row.original.user_id) || "Unknown Patient"}
          </div>
        ),
      },
      {
        accessorKey: "heart_rate",
        header: "Heart Rate",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.heart_rate ? `${row.original.heart_rate} bpm` : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "blood_pressure",
        header: "Blood Pressure",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.blood_pressure ? row.original.blood_pressure : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "temperature",
        header: "Temperature",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.temperature ? `${row.original.temperature}°F` : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "blood_sugar",
        header: "Blood Sugar",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.blood_sugar
              ? `${row.original.blood_sugar} mg/dL`
              : "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "date_time",
        header: "Recorded",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {formatDate(row.original.date_time)}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original)}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.record_id)}
            >
              <IconTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    [patientMap]
  );

  const isEditing = !!editingRecord;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Health Records</h2>
          <p className="text-muted-foreground">
            Manage patient health records and vital signs.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="h-4 w-4" />
          New Health Record
        </Button>
      </div>

      {/* Health Records Table */}
      <DataTable
        columns={columns}
        data={healthRecords}
        searchKey="patientName"
        searchPlaceholder="Search by patient name..."
        emptyMessage="No health records found."
        entityName="health record"
        getRowId={(row) => String(row.record_id)}
      />

      {/* Health Record Form Drawer */}
      <Drawer open={formOpen} onOpenChange={handleCloseForm} direction="right">
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none ">
          <DrawerHeader>
            <DrawerTitle className="text-xl">
              {isEditing ? "Edit Health Record" : "Create New Health Record"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Update the health record details below."
                : "Fill in the patient vitals and health information."}
            </DrawerDescription>
          </DrawerHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-4 overflow-y-auto "
          >
            {/* Patient Selection */}
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

            {/* Heart Rate and Temperature */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                <Input
                  id="heart_rate"
                  type="number"
                  placeholder="e.g., 72"
                  value={formData.heart_rate}
                  onChange={(e) => handleChange("heart_rate", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 98.6"
                  value={formData.temperature}
                  onChange={(e) => handleChange("temperature", e.target.value)}
                />
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="blood_pressure">Blood Pressure (mmHg)</Label>
              <Input
                id="blood_pressure"
                type="text"
                placeholder="e.g., 120/80"
                value={formData.blood_pressure}
                onChange={(e) => handleChange("blood_pressure", e.target.value)}
              />
            </div>

            {/* Blood Sugar */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="blood_sugar">Blood Sugar (mg/dL)</Label>
              <Input
                id="blood_sugar"
                type="number"
                step="0.01"
                placeholder="e.g., 110"
                value={formData.blood_sugar}
                onChange={(e) => handleChange("blood_sugar", e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                placeholder="Additional health notes or observations..."
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
                  Please select a patient and enter at least one health metric
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
                ? "Update Health Record"
                : "Create Health Record"}
            </Button>
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              health record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
