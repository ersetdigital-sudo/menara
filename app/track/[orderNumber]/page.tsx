import type { Metadata } from "next";
import { TrackDetailClient } from "./TrackDetailClient";

export const metadata: Metadata = {
  title: "Lacak Pesanan",
  description: "Lacak progres pesanan jersey custom MENARA",
};

interface TrackDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const { orderNumber } = await params;
  return <TrackDetailClient orderNumber={orderNumber} />;
}
