"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./data-table";
import { PrescriptionForm } from "./prescription-form";
import { Button } from "@/components/ui/button";

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
import { useAdminStore } from "@/stores/adminStore";
import type { Doctor, Prescription } from "@/types/database";
import type { AdminUser } from "@/services/adminService";

interface ManagePrescriptionsProps {
  patients: AdminUser[];
  prescriptions: Prescription[];
  doctors: Doctor[];
  editingPrescription?: Prescription | null;
  onClearEdit?: () => void;
  onEditPrescription?: (prescription: Prescription) => void;
}

export function ManagePrescriptions({
  patients,
  prescriptions,
  doctors,
  editingPrescription,
  onClearEdit,
  onEditPrescription,
}: ManagePrescriptionsProps) {
  const [prescriptionFormOpen, setPrescriptionFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<
    number | null
  >(null);
  const {
    medicines,
    createPrescription,
    updatePrescription,
    deletePrescription,
    fetchPrescriptions,
    fetchMedicines,
  } = useAdminStore();

  // Compute whether form should be open (either explicitly opened or editing)
  const isFormOpen = prescriptionFormOpen || !!editingPrescription;

  // Fetch medicines when form is opened
  useEffect(() => {
    if (isFormOpen) {
      fetchMedicines();
    }
  }, [isFormOpen, fetchMedicines]);

  const handleSubmitPrescription = async (data: {
    user_id: string;
    doctor_id: string;
    medicine_id: string;
    dosage: string;
    frequency: string;
    instructions?: string;
    start_date: string;
    end_date?: string;
  }) => {
    try {
      if (editingPrescription) {
        // Update existing prescription
        const result = await updatePrescription(
          editingPrescription.prescription_id,
          {
            user_id: parseInt(data.user_id),
            doctor_id: parseInt(data.doctor_id),
            medicine_id: parseInt(data.medicine_id),
            dosage: data.dosage,
            frequency: data.frequency,
            instructions: data.instructions,
            start_date: data.start_date,
            end_date: data.end_date,
          }
        );

        if (result.success) {
          toast.success("Prescription updated successfully!");
          await fetchPrescriptions(); // Refresh the table
          setPrescriptionFormOpen(false);
          onClearEdit?.();
        } else {
          toast.error(result.error || "Failed to update prescription");
        }
      } else {
        // Create new prescription
        const result = await createPrescription({
          user_id: parseInt(data.user_id),
          doctor_id: parseInt(data.doctor_id),
          medicine_id: parseInt(data.medicine_id),
          dosage: data.dosage,
          frequency: data.frequency,
          instructions: data.instructions,
          start_date: data.start_date,
          end_date: data.end_date,
        });

        if (result.success) {
          toast.success("Prescription created successfully!");
          await fetchPrescriptions(); // Refresh the table
          setPrescriptionFormOpen(false);
        } else {
          toast.error(result.error || "Failed to create prescription");
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleSubmitPrescription:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleFormClose = (open: boolean) => {
    if (!open) {
      // Close the form
      setPrescriptionFormOpen(false);
      // Clear editing state if we're editing
      if (editingPrescription) {
        onClearEdit?.();
      }
    } else {
      setPrescriptionFormOpen(true);
    }
  };

  const handleDeleteClick = React.useCallback((prescriptionId: number) => {
    setPrescriptionToDelete(prescriptionId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;

    const result = await deletePrescription(prescriptionToDelete);
    if (result.success) {
      toast.success("Prescription deleted successfully");
      await fetchPrescriptions(); // Refresh the table
    } else {
      toast.error(result.error || "Failed to delete prescription");
    }
    setDeleteDialogOpen(false);
    setPrescriptionToDelete(null);
  };

  const handleEditClick = React.useCallback(
    (prescription: Prescription) => {
      if (onEditPrescription) {
        onEditPrescription(prescription);
      }
    },
    [onEditPrescription]
  );

  // Create a map of patient IDs to patient names
  const patientMap = React.useMemo(() => {
    const map = new Map<number, string>();
    patients.forEach((patient) => {
      map.set(patient.user_id, `${patient.first_name} ${patient.last_name}`);
    });
    return map;
  }, [patients]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Define columns for prescriptions table
  const columns: ColumnDef<Prescription>[] = React.useMemo(
    () => [
      {
        id: "patient",
        accessorFn: (row) => patientMap.get(row.user_id) || "Unknown Patient",
        header: "Patient",
        cell: ({ row }) => (
          <div className="font-medium capitalize">
            {patientMap.get(row.original.user_id) || "Unknown Patient"}
          </div>
        ),
      },
      {
        id: "medicine",
        accessorFn: (row) => row.medicine?.name || "Unknown Medicine",
        header: "Medicine",
        cell: ({ row }) => (
          <div>{row.original.medicine?.name || "Unknown Medicine"}</div>
        ),
      },
      {
        accessorKey: "dosage",
        header: "Dosage",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.dosage}</div>
        ),
      },
      {
        accessorKey: "frequency",
        header: "Frequency",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.frequency}</div>
        ),
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {formatDate(row.original.start_date)}
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
              onClick={() => handleDeleteClick(row.original.prescription_id)}
            >
              <IconTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    [patientMap, handleEditClick, handleDeleteClick]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Prescriptions
          </h2>
          <p className="text-muted-foreground">
            View and manage prescriptions for your patients.
          </p>
        </div>
        <Button onClick={() => setPrescriptionFormOpen(true)}>
          <IconPlus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {/* Prescriptions Table with DataTable */}
      <DataTable
        columns={columns}
        data={prescriptions}
        searchKey="patient"
        searchPlaceholder="Search prescriptions by patient or medicine..."
        emptyMessage="No prescriptions found."
        entityName="prescription"
        getRowId={(row) => String(row.prescription_id)}
      />

      {/* Prescription Form */}
      <PrescriptionForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        patients={patients}
        doctors={doctors} // ✅ pass doctors
        medicines={medicines}
        onSubmit={handleSubmitPrescription}
        editPrescription={editingPrescription}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              prescription.
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
