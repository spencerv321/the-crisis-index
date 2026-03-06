import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LENSES } from "@/data/lenses";
import { DEEP_DIVES } from "@/data/deep-dives";
import { getLens } from "@/lib/data";
import LensDeepDive from "@/components/LensDeepDive";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return LENSES.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // Try DB first, fall back to static
  let lens;
  try {
    lens = await getLens(id);
  } catch {
    lens = LENSES.find((l) => l.id === id) || null;
  }

  if (!lens) return {};

  return {
    title: `${lens.name} — The Crisis Index`,
    description: lens.tagline,
    openGraph: {
      title: `${lens.name} — The Crisis Index`,
      description: lens.tagline,
      url: `https://thecrisisindex.com/lens/${id}`,
      siteName: "The Crisis Index",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${lens.name} — The Crisis Index`,
      description: lens.tagline,
    },
  };
}

export default async function LensPage({ params }: Props) {
  const { id } = await params;

  // Try DB first, fall back to static
  let lens;
  try {
    lens = await getLens(id);
  } catch {
    lens = LENSES.find((l) => l.id === id) || null;
  }

  const deepDive = DEEP_DIVES[id];

  if (!lens || !deepDive) notFound();

  return <LensDeepDive lens={lens} deepDive={deepDive} />;
}
