"use client";

import * as React from "react";
import { useState } from "react";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./data-table";
import { ReminderForm } from "./reminder-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Reminder, Prescription } from "@/types/database";
import type { AdminUser } from "@/services/adminService";

interface ManageRemindersProps {
  patients: AdminUser[];
  prescriptions: Prescription[];
  reminders: Reminder[];
  editingReminder?: Reminder | null;
  onClearEdit?: () => void;
  onEditReminder?: (reminder: Reminder) => void;
}

export function ManageReminders({
  patients,
  prescriptions,
  reminders,
  editingReminder,
  onClearEdit,
  onEditReminder,
}: ManageRemindersProps) {
  const [reminderFormOpen, setReminderFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<number | null>(null);
  const { createReminder, updateReminder, deleteReminder, fetchReminders } =
    useAdminStore();

  // Compute whether form should be open (either explicitly opened or editing)
  const isFormOpen = reminderFormOpen || !!editingReminder;

  const handleSubmitReminder = async (data: {
    user_id: string;
    prescription_id: string;
    reminder_datetime: string;
    status: "Pending" | "Sent" | "Acknowledged" | "Missed";
    notes?: string;
  }) => {
    try {
      if (editingReminder) {
        // Update existing reminder
        const result = await updateReminder(editingReminder.reminder_id, {
          user_id: parseInt(data.user_id),
          prescription_id: parseInt(data.prescription_id),
          reminder_datetime: new Date(data.reminder_datetime).toISOString(),
          status: data.status,
          notes: data.notes,
        });

        if (result.success) {
          toast.success("Reminder updated successfully!");
          await fetchReminders(); // Refresh the table
          setReminderFormOpen(false);
          onClearEdit?.();
        } else {
          toast.error(result.error || "Failed to update reminder");
        }
      } else {
        // Create new reminder
        const result = await createReminder({
          user_id: parseInt(data.user_id),
          prescription_id: parseInt(data.prescription_id),
          reminder_datetime: new Date(data.reminder_datetime).toISOString(),
          status: data.status,
          notes: data.notes,
        });

        if (result.success) {
          toast.success("Reminder created successfully!");
          await fetchReminders(); // Refresh the table
          setReminderFormOpen(false);
        } else {
          toast.error(result.error || "Failed to create reminder");
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleSubmitReminder:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleFormClose = (open: boolean) => {
    if (!open) {
      // Close the form
      setReminderFormOpen(false);
      // Clear editing state if we're editing
      if (editingReminder) {
        onClearEdit?.();
      }
    } else {
      setReminderFormOpen(true);
    }
  };

  const handleDeleteClick = React.useCallback((reminderId: number) => {
    setReminderToDelete(reminderId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!reminderToDelete) return;

    const result = await deleteReminder(reminderToDelete);
    if (result.success) {
      toast.success("Reminder deleted successfully");
      await fetchReminders(); // Refresh the table
    } else {
      toast.error(result.error || "Failed to delete reminder");
    }
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  const handleEditClick = React.useCallback(
    (reminder: Reminder) => {
      if (onEditReminder) {
        onEditReminder(reminder);
      }
    },
    [onEditReminder]
  );

  // Create a map of patient IDs to patient names
  const patientMap = React.useMemo(() => {
    const map = new Map<number, string>();
    patients.forEach((patient) => {
      map.set(patient.user_id, `${patient.first_name} ${patient.last_name}`);
    });
    return map;
  }, [patients]);

  // Create a map of prescription IDs to prescription details
  const prescriptionMap = React.useMemo(() => {
    const map = new Map<number, Prescription>();
    prescriptions.forEach((prescription) => {
      map.set(prescription.prescription_id, prescription);
    });
    return map;
  }, [prescriptions]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "outline";
      case "Sent":
        return "secondary";
      case "Acknowledged":
        return "default";
      case "Missed":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600";
      case "Sent":
        return "text-blue-600";
      case "Acknowledged":
        return "text-green-600";
      case "Missed":
        return "text-red-600";
      default:
        return "";
    }
  };

  // Define columns for reminders table
  const columns: ColumnDef<Reminder>[] = React.useMemo(
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
        id: "prescription",
        accessorFn: (row) => {
          const prescription = prescriptionMap.get(row.prescription_id);
          return prescription?.medicine?.name || "Unknown Prescription";
        },
        header: "Prescription",
        cell: ({ row }) => {
          const prescription = prescriptionMap.get(
            row.original.prescription_id
          );
          return (
            <div>
              <div>
                {prescription?.medicine?.name || "Unknown Prescription"}
              </div>
              {prescription && (
                <div className="text-xs text-muted-foreground">
                  {prescription.dosage} - {prescription.frequency}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "reminder_datetime",
        header: "Reminder Date & Time",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {formatDateTime(row.original.reminder_datetime)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={getStatusVariant(row.original.status) as "outline"}
            className={getStatusColor(row.original.status)}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <div className="text-muted-foreground truncate max-w-[200px]">
            {row.original.notes || "-"}
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
              onClick={() => handleDeleteClick(row.original.reminder_id)}
            >
              <IconTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    [patientMap, prescriptionMap, handleEditClick, handleDeleteClick]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Manage Reminders
          </h2>
          <p className="text-muted-foreground">
            Create and manage medication reminders for your patients.
          </p>
        </div>
        <Button onClick={() => setReminderFormOpen(true)}>
          <IconPlus className="h-4 w-4" />
          New Reminder
        </Button>
      </div>

      {/* Reminders Table with DataTable */}
      <DataTable
        columns={columns}
        data={reminders}
        searchKey="patient"
        searchPlaceholder="Search reminders by patient or prescription..."
        emptyMessage="No reminders found."
        entityName="reminder"
        getRowId={(row) => String(row.reminder_id)}
      />

      {/* Reminder Form */}
      <ReminderForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        patients={patients}
        prescriptions={prescriptions}
        onSubmit={handleSubmitReminder}
        editReminder={editingReminder}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              reminder.
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
