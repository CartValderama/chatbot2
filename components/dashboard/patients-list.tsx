"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import type { DoctorPatient } from "@/services/doctorService";
import type { Prescription } from "@/types/patient";

interface PatientsListProps {
  patients: DoctorPatient[];
  prescriptions: Prescription[];
}

interface PatientTableData extends DoctorPatient {
  prescriptionCount: number;
}

export function PatientsList({
  patients,
  prescriptions,
}: PatientsListProps) {
  // Create a map to count prescriptions per patient
  const prescriptionCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    prescriptions.forEach((prescription) => {
      const count = map.get(prescription.patient_id) || 0;
      map.set(prescription.patient_id, count + 1);
    });
    return map;
  }, [prescriptions]);

  // Transform patients data to include prescription count
  const tableData: PatientTableData[] = React.useMemo(
    () =>
      patients.map((patient) => ({
        ...patient,
        prescriptionCount: prescriptionCountMap.get(patient.user_id) || 0,
      })),
    [patients, prescriptionCountMap]
  );

  // Define columns for the data table
  const columns: ColumnDef<PatientTableData>[] = React.useMemo(
    () => [
      {
        id: "patientName",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        header: "Patient Name",
        cell: ({ row }) => (
          <div className="font-medium capitalize">
            {row.original.first_name} {row.original.last_name}
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.email}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.phone || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "prescriptionCount",
        header: () => <div className="text-center">Prescriptions</div>,
        cell: ({ row }) => (
          <div className="text-muted-foreground text-center">
            {row.original.prescriptionCount}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: () => (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            Active
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold">Your Patients</h3>
        <p className="text-sm text-muted-foreground">
          All patients under your care
        </p>
      </div>
      <DataTable
        columns={columns}
        data={tableData}
        searchKey="patientName"
        searchPlaceholder="Search patients by name..."
        emptyMessage="No patients found."
        entityName="patient"
        getRowId={(row) => row.user_id}
      />
    </div>
  );
}
