import { Opening } from "@/components/sections/opening";
import { Work } from "@/components/sections/work";
import { Experience } from "@/components/sections/experience";
import { About } from "@/components/sections/about";
import { Toolkit } from "@/components/sections/toolkit";
import { Beyond } from "@/components/sections/beyond";
import { Contact } from "@/components/sections/contact";
import { RevealObserver } from "@/components/detail/reveal";

export default function Home() {
  return (
    <main>
      <RevealObserver />
      <Opening />
      <Work />
      <Experience />
      <About />
      <Toolkit />
      <Beyond />
      <Contact />
    </main>
  );
}
