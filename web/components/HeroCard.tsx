import type { DerivedHeroStats } from "@/types/domain";
import { strengthClassLabels } from "@/lib/labels";

type HeroCardProps = {
  name: string;
  stats: DerivedHeroStats;
  maxHp?: number;
  isActive?: boolean;
  badge?: "active" | "winner";
  hpFlash?: boolean;
  statusIcon?: "stamina" | "cigarette" | "ashtray" | "rage" | "outburst";
  side?: "cyan" | "red";
  avatarSrc?: string;
};

export function HeroCard({
  name,
  stats,
  maxHp,
  isActive = false,
  badge,
  hpFlash = false,
  statusIcon,
  side = "cyan",
  avatarSrc,
}: HeroCardProps) {
  const accent = side === "cyan" ? "var(--cyan)" : "var(--red)";
  const hpMax = maxHp ?? stats.hpTotal;
  const hpPercent = hpMax > 0 ? (stats.hpTotal / hpMax) * 100 : 0;

  return (
    <article
      className={`hero-card${isActive ? " is-active" : ""}${hpFlash ? " is-hp-flash" : ""}`}
      style={{ borderColor: accent }}
    >
      {badge ? (
        <div className={`fighter-badge is-${badge}`}>
          {badge === "winner" ? "Sieger" : "Am Zug"}
        </div>
      ) : null}
      {statusIcon ? (
        <div className={`fighter-status-icon is-${side}`} aria-label="Ausdauer verbraucht">
          {statusIcon === "stamina" ? "🐌" : null}
          {statusIcon === "cigarette" ? "🚬" : null}
          {statusIcon === "ashtray" ? "▣" : null}
          {statusIcon === "rage" ? "💢" : null}
          {statusIcon === "outburst" ? "💥" : null}
        </div>
      ) : null}
      {avatarSrc ? (
        <div className="hero-card-avatar">
          <img src={avatarSrc} alt="" />
        </div>
      ) : null}
      <h3>{name}</h3>
      <p className="muted">{strengthClassLabels[stats.strengthClass]}</p>
      <div className="hp-bar" aria-label={`HP ${stats.hpTotal} von ${hpMax}`}>
        <span style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }} />
      </div>
      <div className="stat-grid">
        <div className="stat">
          <span className="muted">HP</span>
          <strong>
            {stats.hpTotal}
            {maxHp ? <small>/{maxHp}</small> : null}
          </strong>
        </div>
        <div className="stat">
          <span className="muted">ATK</span>
          <strong>{stats.atkTotal}</strong>
        </div>
        <div className="stat">
          <span className="muted">STA</span>
          <strong>{stats.stamina}</strong>
        </div>
      </div>
    </article>
  );
}
