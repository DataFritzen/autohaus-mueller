import { HeroCard } from "@/components/HeroCard";
import type { DerivedHeroStats } from "@/types/domain";

const demoStatsA: DerivedHeroStats = {
  hpTotal: 120,
  atkTotal: 28,
  rangeTotal: 18,
  stamina: 4,
  evasionScore: 12,
  precisionScore: 1.8,
  strengthClass: "Athletic",
  ageType: "Elite Performer",
  sleepType: "Optimally Rested",
  heartType: "Regular",
  bpStatus: "Optimal",
  alcoholType: "Social Drinker",
  mentalFocusType: "Full Focus",
  balanceType: "Balanced",
  smokerType: "Non Smoker",
  insuranceType: "Protection",
};

const demoStatsB: DerivedHeroStats = {
  hpTotal: 100,
  atkTotal: 25,
  rangeTotal: 15,
  stamina: 3,
  evasionScore: 8,
  precisionScore: 1,
  strengthClass: "Massive",
  ageType: "Wise Guardian",
  sleepType: "Under-Rested",
  heartType: "Rapid",
  bpStatus: "High-Normal",
  alcoholType: "Tipsy Warrior",
  mentalFocusType: "Slight Distraction",
  balanceType: "Balanced",
  smokerType: "Smoker",
  insuranceType: "No protection",
};

export function ArenaPreview() {
  return (
    <section className="arena-band" aria-label="Arena Vorschau">
      <div className="fighter-row">
        <HeroCard
          name="Mara Morgenlauf"
          stats={demoStatsA}
          side="cyan"
          avatarSrc="/assets/avatar-female.png"
        />
        <HeroCard
          name="Bruno Bildschirm"
          stats={demoStatsB}
          side="red"
          avatarSrc="/assets/avatar-male.png"
        />
      </div>
      <div className="arena-floor" />
    </section>
  );
}
