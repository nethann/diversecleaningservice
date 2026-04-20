import { AdminPage } from "@/components/admin-page";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminConfigStatus, getAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin Dashboard"
};

export default async function Page() {
  const session = await getAdminSession();
  const configStatus = getAdminConfigStatus();

  if (!session) {
    return (
      <main className="pb-20">
        <section className="shell py-10">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#e6e0d3] bg-white px-6 py-10 shadow-panel sm:px-10">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">Admin access</div>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950">Admin sign-in required</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
              This admin page is protected. Only approved team members should use their admin name and password to access
              booking management and scheduling tools.
            </p>

            {configStatus.missingUsers.length ? (
              <div className="mt-8 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-7 text-amber-800">
                Passwords still need to be configured locally for: {configStatus.missingUsers.join(", ")}.
                Add these env vars in [frontend/.env.local](C:/Users/netha/Documents/Programming/ReactApps/wondacleans/frontend/.env.local):
                `ADMIN_PASSWORD_WANDA_RICHARDSON`, `ADMIN_PASSWORD_NETHAN_NAGENDRAN`, and `ADMIN_PASSWORD_ROSHAN_NAGENDRAN`.
              </div>
            ) : (
              <AdminLoginForm />
            )}
          </div>
        </section>
      </main>
    );
  }

  return <AdminPage adminUser={session.user} />;
}
