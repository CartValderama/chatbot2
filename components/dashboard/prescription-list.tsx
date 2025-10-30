"use client";

import * as React from "react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/data-table";
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
import type { Prescription } from "@/types/database";
import type { AdminUser } from "@/services/adminService";
import { useAdminStore } from "@/stores/adminStore";

interface PrescriptionListProps {
  prescriptions: Prescription[];
  patients: AdminUser[];
  onEdit: (prescription: Prescription) => void;
}

export function PrescriptionList({
  prescriptions,
  patients,
  onEdit,
}: PrescriptionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = React.useState<
    number | null
  >(null);
  const { deletePrescription } = useAdminStore();
  // Create a map of patient IDs to patient names for quick lookup
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

  const handleDeleteClick = (prescriptionId: number) => {
    setPrescriptionToDelete(prescriptionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;

    const result = await deletePrescription(prescriptionToDelete);
    if (result.success) {
      toast.success("Prescription deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete prescription");
    }
    setDeleteDialogOpen(false);
    setPrescriptionToDelete(null);
  };

  // Define columns for the data table
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
              onClick={() => onEdit(row.original)}
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
    [patientMap, onEdit]
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold">Recent Prescriptions</h3>
          <p className="text-sm text-muted-foreground">
            Your latest prescription orders
          </p>
        </div>
        <DataTable
          columns={columns}
          data={prescriptions}
          searchKey="patient"
          searchPlaceholder="Search prescriptions by patient..."
          emptyMessage="No prescriptions found."
          entityName="prescription"
          getRowId={(row) => String(row.prescription_id)}
        />
      </div>

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
    </>
  );
}
