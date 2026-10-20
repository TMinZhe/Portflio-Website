import type { Metadata } from "next";
import { AvatarLab } from "@/components/lab/avatar/avatar-lab";

export const metadata: Metadata = {
  title: "Avatar prototype (lab)",
  robots: { index: false, follow: false },
};

export default function AvatarLabPage() {
  return <AvatarLab />;
}
