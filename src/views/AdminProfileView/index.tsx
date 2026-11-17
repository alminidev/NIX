import type { IAdminProfile, TProfileNotice } from "@/types/admin-profile";
import PasswordForm from "@/views/AdminProfileView/components/PasswordForm";
import ProfileForm from "@/views/AdminProfileView/components/ProfileForm";

interface IAdminProfileViewProps {
  profile: IAdminProfile;
  notice: TProfileNotice | null;
}

const noticeMessage: Record<TProfileNotice, string> = {
  profile: "Perfil atualizado.",
  password: "Senha atualizada.",
};

export function AdminProfileView({ profile, notice }: IAdminProfileViewProps) {
  const message = notice ? noticeMessage[notice] : null;

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <header>
        <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
          Conta
        </p>
        <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
          Meu perfil
        </h1>
        <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
          Atualize seu nome e e-mail. A senha é trocada à parte e vale só
          para esta conta.
        </p>
      </header>

      {message ? (
        <p
          className="rounded-input border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-4 py-3 text-sm text-brand-blue-hover"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-8">
        <ProfileForm profile={profile} />
        <PasswordForm />
      </div>
    </div>
  );
}
