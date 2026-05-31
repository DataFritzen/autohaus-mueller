import type { FightEvent } from "@/lib/fight-engine";
import type { DerivedHeroStats } from "@/types/domain";

type ArenaFighterProps = {
  name: string;
  stats: DerivedHeroStats;
  side: "left" | "right";
  event?: FightEvent;
  isWinner?: boolean;
  isDefeated?: boolean;
};

const classBuild: Record<DerivedHeroStats["strengthClass"], string> = {
  Striker: "build-striker",
  Athletic: "build-athletic",
  Massive: "build-massive",
  Untrained: "build-untrained",
};

export function ArenaFighter({
  name,
  stats,
  side,
  event,
  isWinner = false,
  isDefeated = false,
}: ArenaFighterProps) {
  const actionClass = getActionClass(name, event, isDefeated);

  return (
    <div
      className={[
        "noir-fighter",
        `is-${side}`,
        classBuild[stats.strengthClass],
        actionClass,
        isWinner ? "is-winner" : "",
        isDefeated ? "is-defeated" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={name}
    >
      <div className="noir-shadow" />
      <svg className="noir-body" viewBox="0 0 120 220" role="img" aria-hidden="true">
        <path className="coat" d="M43 74 C35 96 31 128 31 174 L48 174 L56 113 L64 174 L86 174 C86 128 82 97 75 74 Z" />
        <circle className="head" cx="60" cy="42" r="24" />
        <path className="jaw" d="M43 47 C47 65 74 65 78 47 C75 78 47 78 43 47 Z" />
        <path className="chest" d="M45 78 C52 67 68 67 75 78 L68 116 L52 116 Z" />
        <path className="arm arm-back" d="M43 83 C24 95 19 114 21 134" />
        <path className="arm arm-front" d="M77 83 C98 94 105 111 105 130" />
        <path className="leg leg-back" d="M52 171 L42 213" />
        <path className="leg leg-front" d="M68 171 L83 213" />
        <path className="white-cut face-cut" d="M50 36 L78 29 L72 39 L51 44 Z" />
        <path className="white-cut coat-cut" d="M56 82 L69 80 L63 156 Z" />
      </svg>
      <div className="rain-slice" />
      <span className="noir-name">{name}</span>
    </div>
  );
}

function getActionClass(name: string, event: FightEvent | undefined, isDefeated: boolean) {
  if (isDefeated) return "action-ko";
  if (!event) return "";

  const isActor = event.actor === name;
  const isTarget = event.target === name;
  const message = event.message.toLowerCase();

  if (isActor && message.includes("verursacht")) return "action-attack";
  if (isTarget && message.includes("verursacht")) return "action-hit";
  if (isTarget && message.includes("ausgewichen")) return "action-dodge";
  if (isActor && message.includes("bleibt nach dem schlag stabil")) return "action-brace";
  if (isActor && (message.includes("erschoepft") || message.includes("hustenanfall"))) {
    return "action-stagger";
  }
  if (isActor && message.includes("schutzschild")) return "action-shield";
  if (isTarget && message.includes("geht zu boden")) return "action-ko";

  return "";
}
