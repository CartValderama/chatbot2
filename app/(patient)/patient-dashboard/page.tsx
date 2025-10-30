"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePatientStore } from "@/stores/patientStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function PatientDashboard() {
  const { profile, isLoading, isAuthorized } = useAuth("user");
  const {
    prescriptions,
    reminders,
    isLoading: dataLoading,
    fetchAllPatientData,
    clearPatientData,
  } = usePatientStore();
  const router = useRouter();

  useEffect(() => {
    // Only fetch data if user is authorized and has a profile
    if (isAuthorized && profile?.user_id) {
      fetchAllPatientData(profile.user_id);
    }

    // Cleanup on unmount - clear patient data
    return () => {
      clearPatientData();
    };
  }, [isAuthorized, profile?.user_id, fetchAllPatientData, clearPatientData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter today's reminders
  const getTodaysReminders = () => {
    const today = new Date().toDateString();
    return reminders.filter((reminder) => {
      const reminderDate = new Date(reminder.reminder_datetime).toDateString();
      return reminderDate === today && reminder.status === "Pending";
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized || !profile) {
    return null;
  }

  const todaysReminders = getTodaysReminders();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        variant="dashboard"
        userName={{
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
        }}
        userEmail={profile.email || ""}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            My Medications
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Hello, {profile.first_name} {profile.last_name}! Here are your
            medication reminders and prescriptions.
            <br />
            You can view them here (read-only) or chat with your assistant for
            help.
          </p>
        </div>

        {/* Today's Reminders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Today&apos;s Reminders
            </h2>
            <Button
              onClick={() => router.push("/chatbot")}
              className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              size="lg"
            >
              <span className="text-2xl mr-3">🤖</span>
              Ask Your Assistant
            </Button>
          </div>

          {dataLoading ? (
            <Card className="bg-white border border-gray-200 rounded-xl p-12">
              <p className="text-center text-gray-500">Loading reminders...</p>
            </Card>
          ) : todaysReminders.length === 0 ? (
            <Card className="bg-white border border-gray-200 rounded-xl p-12">
              <p className="text-center text-gray-500">
                No medication reminders for today
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todaysReminders.map((reminder) => (
                <Card
                  key={reminder.reminder_id}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <p className="text-sm text-gray-700 font-medium">
                    {reminder.notes || "Medication Reminder"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDateTime(reminder.reminder_datetime)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Active Prescriptions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Active Prescriptions
          </h2>

          {dataLoading ? (
            <Card className="bg-white border border-gray-200 rounded-xl p-12">
              <p className="text-center text-gray-500">
                Loading prescriptions...
              </p>
            </Card>
          ) : prescriptions.length === 0 ? (
            <Card className="bg-white border border-gray-200 rounded-xl p-12">
              <p className="text-center text-gray-500">
                No active prescriptions
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptions.map((prescription) => (
                <Card
                  key={prescription.prescription_id}
                  className="bg-white border border-gray-200 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {prescription.medicine?.name || "Medication"}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {prescription.medicine?.type && (
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {prescription.medicine.type}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Dosage:</span>{" "}
                      {prescription.dosage}
                    </p>
                    <p>
                      <span className="font-medium">Frequency:</span>{" "}
                      {prescription.frequency}
                    </p>
                    {prescription.doctor && (
                      <p>
                        <span className="font-medium">Doctor:</span>{" "}
                        {prescription.doctor.name}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Period:</span>{" "}
                      {formatDate(prescription.start_date)} -{" "}
                      {prescription.end_date
                        ? formatDate(prescription.end_date)
                        : "Ongoing"}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
