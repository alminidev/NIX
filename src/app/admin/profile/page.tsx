import FreshNavigation from "@/components/FreshNavigation";
import { getSession } from "@/lib/session";
import type { TProfileNotice } from "@/types/admin-profile";
import { AdminProfileView } from "@/views/AdminProfileView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Meu perfil — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface IProfilePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readNotice(value: string | string[] | undefined): TProfileNotice | null {
  const notice = Array.isArray(value) ? value[0] : value;
  if (notice === "profile" || notice === "password") return notice;
  return null;
}

async function Profile({ searchParams }: IProfilePageProps) {
  const session = await getSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  const params = await searchParams;

  return (
    <AdminProfileView
      profile={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      notice={readNotice(params.notice)}
    />
  );
}

export default function ProfilePage({ searchParams }: IProfilePageProps) {
  return (
    <FreshNavigation>
      <Suspense
        fallback={
          <p className="text-[0.9375rem] text-ink-muted">Carregando perfil…</p>
        }
      >
        <Profile searchParams={searchParams} />
      </Suspense>
    </FreshNavigation>
  );
}
