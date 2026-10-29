import { readThankYou } from "@/lib/payments";
import { ThankYouView } from "@/views/ThankYouView";
import type { Metadata } from "next";
import { revalidateTag } from "next/cache";

export const metadata: Metadata = {
  title: "Pedido — NIX 3D",
  robots: { index: false, follow: false },
};

export const instant = false;

interface IThankYouPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ThankYouPage({ searchParams }: IThankYouPageProps) {
  const state = await readThankYou(await searchParams);
  if (state.stockChanged) revalidateTag("products", { expire: 0 });

  return <ThankYouView state={state} />;
}
