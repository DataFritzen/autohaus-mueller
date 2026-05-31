import type { FightEvent } from "@/lib/fight-engine";
import type { HeroSummary } from "@/types/domain";

type ActionPanelProps = {
  event?: FightEvent;
  heroA: HeroSummary;
  heroB: HeroSummary;
};

export function ActionPanel({ event, heroA, heroB }: ActionPanelProps) {
  const actorSide = event?.actorId === heroA.id ? "left" : event?.actorId === heroB.id ? "right" : null;
  const targetSide =
    event?.targetId === heroA.id ? "left" : event?.targetId === heroB.id ? "right" : null;
  const type = event?.type ?? "round_start";
  const isImpact = type === "attack_full" || type === "attack_graze" || type === "ko";

  return (
    <div className={`action-panel action-${type}`} aria-label="Kampfvisualisierung">
      <div className="panel-rain" />
      <div className="panel-frame" />
      <div className={`panel-figure is-left${actorSide === "left" ? " is-actor" : ""}${targetSide === "left" ? " is-target" : ""}`}>
        <span />
      </div>
      <div className={`panel-figure is-right${actorSide === "right" ? " is-actor" : ""}${targetSide === "right" ? " is-target" : ""}`}>
        <span />
      </div>
      {isImpact ? <div className={`impact-mark is-${targetSide ?? "center"}`} /> : null}
    </div>
  );
}
