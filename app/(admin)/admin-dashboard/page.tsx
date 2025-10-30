"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStore } from "@/stores/adminStore";
import { useEffect, useState } from "react";
import {
  IconTrendingUp,
  IconUsers,
  IconPrescription,
  IconFileText,
  IconBell,
} from "@tabler/icons-react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { ManagePrescriptions } from "@/components/dashboard/manage-prescriptions";
import { ManageMedicines } from "@/components/dashboard/manage-medicines";
import { ManageDoctors } from "@/components/dashboard/manage-doctors";
import { ManageReminders } from "@/components/dashboard/manage-reminders";
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
import type { Prescription, Reminder } from "@/types/database";

export default function AdminDashboard() {
  const { profile, isLoading, isAuthorized } = useAuth("admin");
  const {
    users,
    prescriptions,
    doctors,
    usersHealthRecords,
    reminders,
    isLoading: dataLoading,
    fetchAllAdminData,
    clearAdminData,
    fetchMedicines,
    fetchReminders,
  } = useAdminStore();

  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "manage-prescriptions"
    | "health-records"
    | "manage-medicines"
    | "manage-doctors"
    | "manage-reminders"
  >("dashboard");
  const [editingPrescription, setEditingPrescription] =
    useState<Prescription | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    if (isAuthorized) {
      fetchAllAdminData();
    }

    return () => {
      clearAdminData();
    };
  }, [isAuthorized, fetchAllAdminData, clearAdminData]);

  // Fetch medicines when switching to manage-medicines view
  useEffect(() => {
    if (activeView === "manage-medicines") {
      fetchMedicines();
    }
  }, [activeView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch reminders when switching to manage-reminders view
  useEffect(() => {
    if (activeView === "manage-reminders") {
      fetchReminders();
    }
  }, [activeView]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditPrescription = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setActiveView("manage-prescriptions");
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setActiveView("manage-reminders");
  };

  // Filter out admin users - only show patients (role: "user")
  const patients = React.useMemo(
    () => users.filter((user) => user.role === "user"),
    [users]
  );

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
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profile.first_name + " " + profile.last_name
        )}&background=random`,
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
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
                      {usersHealthRecords.length}
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

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Reminders</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {reminders.length}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <IconTrendingUp />
                        Active
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Scheduled alerts <IconBell className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                      Medication reminders
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
              doctors={doctors}
              editingPrescription={editingPrescription}
              onClearEdit={() => setEditingPrescription(null)}
              onEditPrescription={handleEditPrescription}
            />
          ) : activeView === "health-records" ? (
            <HealthRecordsManagement
              healthRecords={usersHealthRecords}
              patients={patients}
            />
          ) : activeView === "manage-medicines" ? (
            <ManageMedicines />
          ) : activeView === "manage-doctors" ? (
            <ManageDoctors />
          ) : activeView === "manage-reminders" ? (
            <ManageReminders
              patients={patients}
              prescriptions={prescriptions}
              reminders={reminders}
              editingReminder={editingReminder}
              onClearEdit={() => setEditingReminder(null)}
              onEditReminder={handleEditReminder}
            />
          ) : null}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
