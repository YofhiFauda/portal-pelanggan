import { callLaravel } from '@/lib/laravel-client';
import { DateDisplay } from '@/components/DateDisplay';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import type { ApiEnvelope, MeProfile } from '@/lib/types/portal-api';

export default async function ProfilPage() {
  const result = await callLaravel<ApiEnvelope<MeProfile>>('/me', { auth: true });

  if (!result.ok) {
    return <ErrorBanner />;
  }

  const profile = result.data.data;

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold font-display text-foreground tracking-tight">Profil Pengguna</h2>
        <p className="text-xs font-bold text-text-muted mt-1">Kelola informasi data pelanggan dan tingkatkan keamanan akun Anda.</p>
      </div>

      {/* Profile Details List */}
      <div className="card rounded-lg p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-5 pb-3 border-b border-border">
          Informasi Akun Internet
        </h3>

        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 text-sm font-semibold text-text-secondary">
          <div className="py-2 border-b border-border sm:border-0">
            <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Login ID</dt>
            <dd className="text-sm font-mono text-foreground font-extrabold mt-1">{profile.login_id}</dd>
          </div>

          <div className="py-2 border-b border-border sm:border-0">
            <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Nama Pelanggan</dt>
            <dd className="text-sm text-foreground mt-1">{profile.full_name}</dd>
          </div>

          <div className="py-2 border-b border-border sm:border-0">
            <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Status Layanan</dt>
            <dd className="mt-1">
              <span className={`badge ${
                profile.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {profile.status === 'active' ? 'Aktif' : profile.status}
              </span>
            </dd>
          </div>

          <div className="py-2 border-b border-border sm:border-0">
            <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Paket Langganan</dt>
            <dd className="text-sm text-brand-primary uppercase mt-1">{profile.package}</dd>
          </div>

          <div className="py-2 border-b border-border sm:border-0">
            <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Alamat Desa</dt>
            <dd className="text-sm text-foreground mt-1">{profile.village}</dd>
          </div>

          <div className="py-2 border-b border-border sm:border-0">
            <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Kecamatan</dt>
            <dd className="text-sm text-foreground mt-1">{profile.district}</dd>
          </div>

          <div className="py-2 sm:col-span-2">
            <dt className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Tanggal Aktivasi Portal</dt>
            <dd className="text-xs text-text-muted mt-1">
              <DateDisplay value={profile.claimed_at} format="long" />
            </dd>
          </div>
        </dl>
      </div>

      {/* Security Form Card */}
      <div className="card rounded-lg p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-5 pb-3 border-b border-border">
          Ubah Password Keamanan
        </h3>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
