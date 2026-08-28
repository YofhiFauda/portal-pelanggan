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
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Profil</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-gray-500">Login ID</dt>
            <dd className="text-gray-900">{profile.login_id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Nama</dt>
            <dd className="text-gray-900">{profile.full_name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900">{profile.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Paket</dt>
            <dd className="text-gray-900">{profile.package}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Desa</dt>
            <dd className="text-gray-900">{profile.village}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Kecamatan</dt>
            <dd className="text-gray-900">{profile.district}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Aktivasi</dt>
            <dd className="text-gray-900">
              <DateDisplay value={profile.claimed_at} format="long" />
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-gray-900">Ganti Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
