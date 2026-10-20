import { profile } from "@/content/profile";
import { plain } from "@/components/ui/content-text";
import { Nav } from "@/components/layout/nav";

/** The public portfolio. Lab routes live outside this group and have no site nav. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav mark={plain(profile.shortName)} resumeHref={profile.links.resume.href} />
      {children}
    </>
  );
}
