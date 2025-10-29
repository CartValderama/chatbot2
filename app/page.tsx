import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <main className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl space-y-8">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white">
            Healthcare Dashboard
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Manage your health information and connect with healthcare providers
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/auth"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth"
              className="px-8 py-4 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Login
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                For Patients
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Track your health records, appointments, and communicate with your healthcare providers.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                For Doctors
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manage patient records, schedules, and provide quality care efficiently.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
