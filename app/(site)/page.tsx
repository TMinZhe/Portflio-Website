import { Opening } from "@/components/sections/opening";
import { Work } from "@/components/sections/work";
import { AboutInterim, ContactInterim, ExperienceInterim, SkillsInterim } from "@/components/sections/interim";

export default function Home() {
  return (
    <main>
      <Opening />
      <Work />
      <ExperienceInterim />
      <AboutInterim />
      <SkillsInterim />
      <ContactInterim />
    </main>
  );
}
