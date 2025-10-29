"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { usePatientStore } from "@/store/patientStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PatientDashboard() {
  const { profile, isLoading, isAuthorized } = useAuth("patient");
  const { logout } = useAuthStore();
  const {
    prescriptions,
    reminders,
    chatMessages,
    healthRecords,
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

  const handleLogout = async () => {
    clearPatientData();
    await logout();
    router.push("/auth");
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Patient Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
            Welcome, {profile.first_name} {profile.last_name}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Here&apos;s an overview of your health information and care.
          </p>
        </div>

        {dataLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-zinc-600 dark:text-zinc-400">
              Loading your health data...
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Prescriptions Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Prescriptions
              </h3>
              {prescriptions.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400">
                  No prescriptions found.
                </p>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription.prescription_id}
                      className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-zinc-900 dark:text-white">
                          {prescription.medicine?.name || "Medicine"}
                        </h4>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatDate(prescription.start_date)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Dosage:
                          </span>{" "}
                          <span className="text-zinc-900 dark:text-white">
                            {prescription.dosage}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Frequency:
                          </span>{" "}
                          <span className="text-zinc-900 dark:text-white">
                            {prescription.frequency}
                          </span>
                        </div>
                      </div>
                      {prescription.instructions && (
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {prescription.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reminders Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Reminders
              </h3>
              {reminders.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400">
                  No reminders set.
                </p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.reminder_id}
                      className={`p-4 rounded-lg border ${
                        reminder.status === "completed"
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : reminder.status === "pending"
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          : "bg-zinc-50 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {reminder.title}
                          </p>
                          {reminder.description && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              {reminder.description}
                            </p>
                          )}
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                            {formatDateTime(reminder.reminder_datetime)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            reminder.status === "completed"
                              ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100"
                              : reminder.status === "pending"
                              ? "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                              : "bg-zinc-100 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100"
                          }`}
                        >
                          {reminder.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Health Records Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Health Records
              </h3>
              {healthRecords.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400">
                  No health records found.
                </p>
              ) : (
                <div className="space-y-4">
                  {healthRecords.map((record) => (
                    <div
                      key={record.record_id}
                      className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          {formatDateTime(record.datetime)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {record.heart_rate && (
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Heart Rate
                            </p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                              {record.heart_rate} bpm
                            </p>
                          </div>
                        )}
                        {record.blood_pressure && (
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Blood Pressure
                            </p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                              {record.blood_pressure} mmHg
                            </p>
                          </div>
                        )}
                        {record.temperature && (
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Temperature
                            </p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                              {record.temperature}°F
                            </p>
                          </div>
                        )}
                        {record.blood_sugar && (
                          <div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Blood Sugar
                            </p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                              {record.blood_sugar} mg/dL
                            </p>
                          </div>
                        )}
                      </div>
                      {record.notes && (
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Messages Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Chat Messages
              </h3>
              {chatMessages.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400">
                  No chat messages yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div
                      key={message.message_id}
                      className={`flex ${
                        message.sender_type === "patient"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                          message.sender_type === "patient"
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.message_text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_type === "patient"
                              ? "text-blue-100"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {formatDateTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
