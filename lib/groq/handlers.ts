/**
 * Groq Function Handlers
 *
 * Implementerer faktiske funksjoner som henter data fra Supabase
 * basert på function calls fra Groq.
 */

import { createServerClient } from "@/api/supabaseServerClient";
import type {
  Prescription,
  Reminder,
  HealthRecord,
  Doctor,
} from "@/types/database";

/**
 * Henter pasientens aktive resepter med medisin- og legeinfo
 */
export async function handleGetPrescriptions(
  userId: number
): Promise<string> {
  try {
    const supabase = createServerClient();

    // Get all prescriptions for user (including recently expired ones)
    // We'll show prescriptions that either have no end_date or ended within last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("prescriptions")
      .select(
        `
        *,
        medicine:medicines(*),
        doctor:doctors(*)
      `
      )
      .eq("user_id", userId)
      .or(`end_date.is.null,end_date.gte.${thirtyDaysAgo.toISOString()}`)
      .order("created_date", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return JSON.stringify({
        message: "Ingen aktive resepter funnet.",
        prescriptions: [],
      });
    }

    // Formatter data for Groq
    const formattedPrescriptions = data.map((p: any) => ({
      medicine: p.medicine?.name,
      dosage: p.dosage,
      frequency: p.frequency,
      instructions: p.instructions,
      start_date: p.start_date,
      end_date: p.end_date,
      doctor: p.doctor?.name,
    }));

    return JSON.stringify({
      message: `Fant ${data.length} aktive resept(er).`,
      prescriptions: formattedPrescriptions,
    });
  } catch (error) {
    console.error("Error in handleGetPrescriptions:", error);
    return JSON.stringify({
      error: "Kunne ikke hente resepter.",
      details: error instanceof Error ? error.message : "Ukjent feil",
    });
  }
}

/**
 * Henter kommende påminnelser for pasienten
 */
export async function handleGetReminders(userId: number): Promise<string> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .gte("reminder_datetime", new Date().toISOString())
      .order("reminder_datetime", { ascending: true })
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return JSON.stringify({
        message: "Ingen kommende påminnelser funnet.",
        reminders: [],
      });
    }

    // Formatter data
    const formattedReminders = data.map((r: Reminder) => ({
      datetime: r.reminder_datetime,
      status: r.status,
      notes: r.notes,
    }));

    return JSON.stringify({
      message: `Fant ${data.length} kommende påminnelse(r).`,
      reminders: formattedReminders,
    });
  } catch (error) {
    console.error("Error in handleGetReminders:", error);
    return JSON.stringify({
      error: "Kunne ikke hente påminnelser.",
      details: error instanceof Error ? error.message : "Ukjent feil",
    });
  }
}

/**
 * Henter pasientens siste vitale målinger
 */
export async function handleGetHealthRecords(userId: number): Promise<string> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("user_id", userId)
      .order("date_time", { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      return JSON.stringify({
        message: "Ingen helsedata funnet.",
        health_records: [],
      });
    }

    // Formatter data
    const formattedRecords = data.map((r: HealthRecord) => ({
      date: r.date_time,
      heart_rate: r.heart_rate,
      blood_pressure: r.blood_pressure,
      blood_sugar: r.blood_sugar,
      temperature: r.temperature,
      notes: r.notes,
    }));

    return JSON.stringify({
      message: `Fant ${data.length} helsedata-registrering(er).`,
      health_records: formattedRecords,
      latest: formattedRecords[0],
    });
  } catch (error) {
    console.error("Error in handleGetHealthRecords:", error);
    return JSON.stringify({
      error: "Kunne ikke hente helsedata.",
      details: error instanceof Error ? error.message : "Ukjent feil",
    });
  }
}

/**
 * Henter dagens medisiner og påminnelser
 */
export async function handleGetTodaysSchedule(userId: number): Promise<string> {
  try {
    const supabase = createServerClient();

    // Hent dagens påminnelser
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .gte("reminder_datetime", today.toISOString())
      .lt("reminder_datetime", tomorrow.toISOString())
      .order("reminder_datetime", { ascending: true });

    if (remindersError) throw remindersError;

    // Hent aktive medisiner
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from("prescriptions")
      .select(
        `
        *,
        medicine:medicines(*)
      `
      )
      .eq("user_id", userId)
      .or("end_date.is.null,end_date.gte." + new Date().toISOString());

    if (prescriptionsError) throw prescriptionsError;

    return JSON.stringify({
      message: "Dagens oversikt:",
      todays_reminders: reminders || [],
      active_medications: prescriptions?.map((p: any) => ({
        medicine: p.medicine?.name,
        dosage: p.dosage,
        frequency: p.frequency,
      })) || [],
    });
  } catch (error) {
    console.error("Error in handleGetTodaysSchedule:", error);
    return JSON.stringify({
      error: "Kunne ikke hente dagens oversikt.",
      details: error instanceof Error ? error.message : "Ukjent feil",
    });
  }
}

/**
 * Henter informasjon om pasientens leger
 */
export async function handleGetDoctors(userId: number): Promise<string> {
  try {
    const supabase = createServerClient();

    // Hent brukerens primary_doctor_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("primary_doctor_id")
      .eq("user_id", userId)
      .single();

    if (userError) throw userError;

    const allDoctors: Doctor[] = [];
    const doctorIds = new Set<number>();

    // Hent primær lege hvis den finnes
    if (userData?.primary_doctor_id) {
      const { data: primaryDoctor, error: primaryDoctorError } = await supabase
        .from("doctors")
        .select("*")
        .eq("doctor_id", userData.primary_doctor_id)
        .single();

      if (!primaryDoctorError && primaryDoctor) {
        allDoctors.push(primaryDoctor as Doctor);
        doctorIds.add(primaryDoctor.doctor_id);
      }
    }

    // Hent leger fra resepter
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from("prescriptions")
      .select("doctor_id")
      .eq("user_id", userId);

    if (!prescriptionsError && prescriptions) {
      // Hent unique doctor IDs fra resepter
      const uniqueDoctorIds = Array.from(
        new Set(
          prescriptions
            .map((p: any) => p.doctor_id)
            .filter((id: number) => id && !doctorIds.has(id))
        )
      );

      // Hent doktorinfo for alle unique IDs
      if (uniqueDoctorIds.length > 0) {
        const { data: doctors, error: doctorsError } = await supabase
          .from("doctors")
          .select("*")
          .in("doctor_id", uniqueDoctorIds);

        if (!doctorsError && doctors) {
          allDoctors.push(...(doctors as Doctor[]));
        }
      }
    }

    if (allDoctors.length === 0) {
      return JSON.stringify({
        message: "Ingen legeinfo funnet.",
        doctors: [],
      });
    }

    // Formatter data
    const formattedDoctors = allDoctors.map((d) => ({
      name: d.name,
      speciality: d.speciality,
      phone: d.phone,
      email: d.email,
      hospital: d.hospital,
    }));

    return JSON.stringify({
      message: `Fant ${allDoctors.length} lege(r).`,
      primary_doctor: formattedDoctors[0],
      doctors: formattedDoctors,
    });
  } catch (error) {
    console.error("Error in handleGetDoctors:", error);
    return JSON.stringify({
      error: "Kunne ikke hente legeinfo.",
      details: error instanceof Error ? error.message : "Ukjent feil",
    });
  }
}

/**
 * Hovedfunksjon som router function calls til riktig handler
 */
export async function executeFunction(
  functionName: string,
  userId: number
): Promise<string> {
  switch (functionName) {
    case "get_prescriptions":
      return handleGetPrescriptions(userId);
    case "get_reminders":
      return handleGetReminders(userId);
    case "get_health_records":
      return handleGetHealthRecords(userId);
    case "get_todays_schedule":
      return handleGetTodaysSchedule(userId);
    case "get_doctors":
      return handleGetDoctors(userId);
    default:
      return JSON.stringify({
        error: `Ukjent funksjon: ${functionName}`,
      });
  }
}
