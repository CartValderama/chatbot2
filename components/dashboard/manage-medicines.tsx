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
import type { Medicine } from "@/types/patient";
import { useDoctorStore } from "@/store/doctorStore";

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

export function ManageMedicines() {
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [medicineToDelete, setMedicineToDelete] = React.useState<string | null>(
    null
  );
  const [editingMedicine, setEditingMedicine] = React.useState<Medicine | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { medicines, medicinesLoading, fetchMedicines, createMedicine, updateMedicine, deleteMedicine } =
    useDoctorStore();
  const [formData, setFormData] = React.useState<MedicineFormValues>({
    name: "",
    description: "",
    manufacturer: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof MedicineFormValues, string>>
  >({});

  // Fetch medicines on mount
  React.useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Populate form when editing
  React.useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name,
        description: editingMedicine.description || "",
        manufacturer: editingMedicine.manufacturer || "",
      });
      setFormOpen(true);
    } else {
      setFormData({
        name: "",
        description: "",
        manufacturer: "",
      });
    }
    setErrors({});
  }, [editingMedicine]);

  const handleChange = (field: keyof MedicineFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const result = medicineSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof MedicineFormValues, string>> =
        {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as keyof MedicineFormValues] = err.message;
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
      const medicineData = {
        name: formData.name,
        description: formData.description || undefined,
        manufacturer: formData.manufacturer || undefined,
      };

      if (editingMedicine) {
        const result = await updateMedicine(
          editingMedicine.medicine_id,
          medicineData
        );

        if (result.success) {
          toast.success("Medicine updated successfully!");
          handleCloseForm();
        } else {
          toast.error(result.error || "Failed to update medicine");
        }
      } else {
        const result = await createMedicine(medicineData);

        if (result.success) {
          toast.success("Medicine created successfully!");
          handleCloseForm();
        } else {
          toast.error(result.error || "Failed to create medicine");
        }
      }
    } catch (error) {
      console.error("Error submitting medicine:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingMedicine(null);
    setFormData({
      name: "",
      description: "",
      manufacturer: "",
    });
    setErrors({});
  };

  const handleEditClick = (medicine: Medicine) => {
    setEditingMedicine(medicine);
  };

  const handleDeleteClick = (medicineId: string) => {
    setMedicineToDelete(medicineId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!medicineToDelete) return;

    const result = await deleteMedicine(medicineToDelete);
    if (result.success) {
      toast.success("Medicine deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete medicine");
    }
    setDeleteDialogOpen(false);
    setMedicineToDelete(null);
  };

  // Define columns for the data table
  const columns: ColumnDef<Medicine>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Medicine Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.description || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.manufacturer || "N/A"}
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
              onClick={() => handleDeleteClick(row.original.medicine_id)}
            >
              <IconTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const isEditing = !!editingMedicine;

  if (medicinesLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Medicines</h2>
          <p className="text-muted-foreground">
            Add, edit, and manage the list of available medicines.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="h-4 w-4" />
          New Medicine
        </Button>
      </div>

      {/* Medicines Table */}
      <DataTable
        columns={columns}
        data={medicines}
        searchKey="name"
        searchPlaceholder="Search medicines by name..."
        emptyMessage="No medicines found."
        entityName="medicine"
        getRowId={(row) => row.medicine_id}
      />

      {/* Medicine Form Drawer */}
      <Drawer open={formOpen} onOpenChange={handleCloseForm} direction="right">
        <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit Medicine" : "Create New Medicine"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Update the medicine details below."
                : "Fill in the medicine information."}
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-4 overflow-y-auto flex-1"
          >
            {/* Medicine Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Amoxicillin"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                placeholder="e.g., Antibiotic used to treat bacterial infections..."
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Manufacturer */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="manufacturer">Manufacturer (Optional)</Label>
              <Input
                id="manufacturer"
                type="text"
                placeholder="e.g., Pfizer"
                value={formData.manufacturer}
                onChange={(e) => handleChange("manufacturer", e.target.value)}
              />
            </div>
          </form>

          <DrawerFooter>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Medicine"
                : "Create Medicine"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
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
              medicine.
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
