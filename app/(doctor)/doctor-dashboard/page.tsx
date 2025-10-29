"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDoctorStore } from "@/store/doctorStore";
import { useEffect, useState } from "react";
import {
  IconTrendingUp,
  IconUsers,
  IconPrescription,
  IconFileText,
} from "@tabler/icons-react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { ManagePrescriptions } from "@/components/dashboard/manage-prescriptions";
import { ManageMedicines } from "@/components/dashboard/manage-medicines";
import { PatientsList } from "@/components/dashboard/patients-list";
import { HealthRecordsManagement } from "@/components/dashboard/health-records-management";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Prescription } from "@/types/patient";

export default function DoctorDashboard() {
  const { profile, isLoading, isAuthorized } = useAuth("doctor");
  const {
    patients,
    prescriptions,
    patientsHealthRecords,
    isLoading: dataLoading,
    fetchAllDoctorData,
    clearDoctorData,
  } = useDoctorStore();

  const [activeView, setActiveView] = useState<
    "dashboard" | "manage-prescriptions" | "health-records" | "manage-medicines"
  >("dashboard");
  const [editingPrescription, setEditingPrescription] =
    useState<Prescription | null>(null);

  useEffect(() => {
    if (isAuthorized && profile?.user_id) {
      fetchAllDoctorData(profile.user_id);
    }

    return () => {
      clearDoctorData();
    };
  }, [isAuthorized, profile?.user_id, fetchAllDoctorData, clearDoctorData]);

  const handleEditPrescription = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setActiveView("manage-prescriptions");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized || !profile) {
    return null;
  }

  // Prepare user data for sidebar
  const sidebarUser = profile
    ? {
        name: `Dr. ${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        avatar: "/avatars/doctor.jpg",
      }
    : undefined;

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} onNavigate={setActiveView} />
      <SidebarInset>
        <SiteHeader />
        <main className="@container/main flex flex-1 flex-col gap-6 p-6">
          {dataLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">
                Loading dashboard data...
              </div>
            </div>
          ) : activeView === "dashboard" ? (
            <>
              {/* Stat Cards Grid */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Patients</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {patients.length}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />+{patients.length}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Active patients <IconUsers className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Patients under your care
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Prescriptions</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {prescriptions.length}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        {prescriptions.length}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Total issued <IconPrescription className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      All prescription orders
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Health Records</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {patientsHealthRecords.length}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        Tracked
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Patient vitals <IconFileText className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Records monitored
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Patients List */}
              <PatientsList patients={patients} prescriptions={prescriptions} />
            </>
          ) : activeView === "manage-prescriptions" ? (
            <ManagePrescriptions
              patients={patients}
              prescriptions={prescriptions}
              doctorId={profile?.user_id || ""}
              editingPrescription={editingPrescription}
              onClearEdit={() => setEditingPrescription(null)}
              onEditPrescription={handleEditPrescription}
            />
          ) : activeView === "health-records" ? (
            <HealthRecordsManagement
              healthRecords={patientsHealthRecords}
              patients={patients}
            />
          ) : activeView === "manage-medicines" ? (
            <ManageMedicines />
          ) : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
