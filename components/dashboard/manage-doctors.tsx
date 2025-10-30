"use client";

import * as React from "react";
import { z } from "zod";
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
import type { Doctor } from "@/types/database";
import { useAdminStore } from "@/stores/adminStore";

const doctorSchema = z.object({
  name: z.string().min(1, "Doctor name is required"),
  speciality: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  hospital: z.string().optional(),
  license_number: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export function ManageDoctors() {
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [doctorToDelete, setDoctorToDelete] = React.useState<number | null>(
    null
  );
  const [editingDoctor, setEditingDoctor] = React.useState<Doctor | null>(null);
  const [formData, setFormData] = React.useState<DoctorFormValues>({
    name: "",
    speciality: "",
    phone: "",
    email: "",
    hospital: "",
    license_number: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof DoctorFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    doctors,
    doctorsLoading,
    fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  } = useAdminStore();

  // Fetch doctors on mount
  React.useEffect(() => {
    fetchDoctors();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (editingDoctor) {
      setFormData({
        name: editingDoctor.name,
        speciality: editingDoctor.speciality ?? "",
        phone: editingDoctor.phone ?? "",
        email: editingDoctor.email ?? "",
        hospital: editingDoctor.hospital ?? "",
        license_number: editingDoctor.license_number ?? "",
      });
      setFormOpen(true);
    } else {
      setFormData({
        name: "",
        speciality: "",
        phone: "",
        email: "",
        hospital: "",
        license_number: "",
      });
    }
    setErrors({});
  }, [editingDoctor]);

  const handleChange = (field: keyof DoctorFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Check if form is valid (name is required)
  const isFormValid = React.useMemo(() => {
    return formData.name.trim() !== "";
  }, [formData.name]);

  const validate = (): boolean => {
    const result = doctorSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof DoctorFormValues, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0])
          newErrors[err.path[0] as keyof DoctorFormValues] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!validate()) return;

    setIsSubmitting(true);
    const doctorData = {
      name: formData.name,
      speciality: formData.speciality || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      hospital: formData.hospital || undefined,
      license_number: formData.license_number || undefined,
    };

    try {
      const result = editingDoctor
        ? await updateDoctor(editingDoctor.doctor_id, doctorData)
        : await createDoctor(doctorData);

      if (result.success) {
        toast.success(
          editingDoctor
            ? "Doctor updated successfully!"
            : "Doctor created successfully!"
        );
        await fetchDoctors();
        setFormOpen(false);
        // Reset form data
        setFormData({
          name: "",
          speciality: "",
          phone: "",
          email: "",
          hospital: "",
          license_number: "",
        });
        setErrors({});
        setEditingDoctor(null);
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting doctor:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Only close if not currently submitting
      if (!isSubmitting) {
        setFormOpen(false);
        setEditingDoctor(null);
        setFormData({
          name: "",
          speciality: "",
          phone: "",
          email: "",
          hospital: "",
          license_number: "",
        });
        setErrors({});
      }
    } else {
      setFormOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;
    const result = await deleteDoctor(doctorToDelete);
    if (result.success) {
      toast.success("Doctor deleted");
      await fetchDoctors();
    } else toast.error(result.error || "Failed to delete doctor");

    setDeleteDialogOpen(false);
    setDoctorToDelete(null);
  };

  const columns: ColumnDef<Doctor>[] = React.useMemo(
    () => [
      { accessorKey: "name", header: "Doctor Name" },
      {
        accessorKey: "speciality",
        header: "Speciality",
        cell: ({ row }) => row.original.speciality || "N/A",
      },
      {
        accessorKey: "hospital",
        header: "Hospital",
        cell: ({ row }) => row.original.hospital || "N/A",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone || "N/A",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "N/A",
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingDoctor(row.original)}
            >
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDoctorToDelete(row.original.doctor_id);
                setDeleteDialogOpen(true);
              }}
            >
              <IconTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (doctorsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading doctors...</p>
      </div>
    );
  }

  const isEditing = !!editingDoctor;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Doctors</h2>
          <p className="text-muted-foreground">
            Add, edit, and manage doctors.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="h-4 w-4" /> New Doctor
        </Button>
      </div>

      {/* Doctors Table */}
      <DataTable
        columns={columns}
        data={doctors}
        searchKey="name"
        searchPlaceholder="Search doctors..."
        emptyMessage="No doctors found."
        entityName="doctor"
        getRowId={(row) => String(row.doctor_id)}
      />

      {/* Doctor Form Drawer */}
      <Drawer open={formOpen} onOpenChange={handleOpenChange} direction="right">
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit Doctor" : "New Doctor"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Update the doctor details."
                : "Fill in the doctor details."}
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-4 overflow-y-auto"
          >
            {[
              "name",
              "speciality",
              "phone",
              "email",
              "hospital",
              "license_number",
            ].map((field) => (
              <div key={field} className="flex flex-col gap-2">
                <Label htmlFor={field}>
                  {field
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  {field === "name" ? " *" : ""}
                </Label>
                <Input
                  id={field}
                  type={field === "email" ? "email" : "text"}
                  placeholder={`Enter ${field.replace("_", " ")}`}
                  value={formData[field as keyof DoctorFormValues]}
                  onChange={(e) =>
                    handleChange(
                      field as keyof DoctorFormValues,
                      e.target.value
                    )
                  }
                />
                {errors[field as keyof DoctorFormValues] && (
                  <p className="text-sm text-red-500">
                    {errors[field as keyof DoctorFormValues]}
                  </p>
                )}
              </div>
            ))}
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
                  Please enter a doctor name (*)
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
                ? "Update Doctor"
                : "Create Doctor"}
            </Button>
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The doctor will be permanently
              deleted.
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
