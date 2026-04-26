import { Hero } from "@/components/landing/Hero";
import { Pillars } from "@/components/landing/Pillars";
import { Pricing } from "@/components/landing/Pricing";
import { Trainers } from "@/components/landing/Trainers";
import { Location } from "@/components/landing/Location";
import { ParticleField } from "@/components/ui/ParticleField";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <ParticleField />
      <Hero />
      <Pillars />
      <Pricing />
      <Trainers />
      <Location />
    </div>
  );
}
