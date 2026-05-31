"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionPanel } from "@/components/ActionPanel";
import { HeroCard } from "@/components/HeroCard";
import { simulateArenaFight, type FightResult } from "@/lib/fight-engine";
import { generateHeroStats } from "@/lib/hero-engine";
import type { HeroSummary, RawHeroValues } from "@/types/domain";

const replayStepMs = 2200;

const fallbackHeroes: HeroSummary[] = [
  createDemoHero("demo-a", "Mara Morgenlauf", {
    age: 38,
    gender: 2,
    bmi: 23.8,
    waistCircumference: 78,
    height: 168,
    bodyWeight: 67,
    sittingMin: 240,
    alcoholAvg: 1,
    smokingStatus: 2,
    sleepHours: 8,
    insuranceStatus: 1,
    systolicBp: 118,
    diastolicBp: 76,
    pulse: 68,
    mentalFocus: 0,
    balanceStatus: 1,
  }),
  createDemoHero("demo-b", "Bruno Bildschirm", {
    age: 55,
    gender: 1,
    bmi: 31.2,
    waistCircumference: 108,
    height: 182,
    bodyWeight: 103,
    sittingMin: 540,
    alcoholAvg: 3,
    smokingStatus: 1,
    sleepHours: 6,
    insuranceStatus: 2,
    systolicBp: 138,
    diastolicBp: 86,
    pulse: 84,
    mentalFocus: 1,
    balanceStatus: 1,
  }),
  createDemoHero("demo-c", "Nina Nachtlauf", {
    age: 29,
    gender: 2,
    bmi: 21.5,
    waistCircumference: 72,
    height: 173,
    bodyWeight: 64,
    sittingMin: 150,
    alcoholAvg: 0,
    smokingStatus: 2,
    sleepHours: 7.5,
    insuranceStatus: 1,
    systolicBp: 112,
    diastolicBp: 70,
    pulse: 61,
    mentalFocus: 0,
    balanceStatus: 1,
  }),
];

export function ArenaGame() {
  const [heroes, setHeroes] = useState<HeroSummary[]>(fallbackHeroes);
  const [heroAId, setHeroAId] = useState(fallbackHeroes[0].id);
  const [heroBId, setHeroBId] = useState(fallbackHeroes[1].id);
  const [fight, setFight] = useState<FightResult | null>(null);
  const [visibleEventCount, setVisibleEventCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("Demo-Kaempfer geladen.");

  useEffect(() => {
    let active = true;

    fetch("/api/heroes/public")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { heroes?: HeroSummary[] }) => {
        if (!active || !data.heroes?.length) {
          return;
        }

        const nextHeroes = [...data.heroes, ...fallbackHeroes];
        setHeroes(nextHeroes);
        setHeroAId(nextHeroes[0].id);
        setHeroBId(nextHeroes[1]?.id ?? nextHeroes[0].id);
        setStatus("Gespeicherte Helden geladen.");
      })
      .catch(() => {
        if (active) {
          setStatus("Demo-Kaempfer geladen. Supabase ist lokal noch nicht verbunden.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const heroA = useMemo(
    () => heroes.find((hero) => hero.id === heroAId) ?? heroes[0],
    [heroAId, heroes],
  );
  const heroB = useMemo(
    () => heroes.find((hero) => hero.id === heroBId) ?? heroes[1] ?? heroes[0],
    [heroBId, heroes],
  );
  const canFight = Boolean(heroA && heroB && heroA.id !== heroB.id);
  const visibleEvents = fight?.events.slice(0, visibleEventCount) ?? [];
  const visibleEventsNewestFirst = [...visibleEvents].reverse();
  const currentEvent = visibleEvents.at(-1);
  const replayComplete = Boolean(fight && visibleEventCount >= fight.events.length);
  const activeHeroId = replayComplete ? null : currentEvent?.actorId ?? currentEvent?.targetId ?? null;
  const statusIconHeroId = !replayComplete ? currentEvent?.actorId : null;
  const currentStatusIcon =
    !replayComplete && currentEvent?.type === "stamina_skip"
      ? "stamina"
      : !replayComplete && currentEvent?.type === "smoker_malus"
        ? "cigarette"
        : !replayComplete && currentEvent?.type === "smoker_skip"
          ? "ashtray"
          : !replayComplete && currentEvent?.type === "rage"
            ? "rage"
            : !replayComplete && currentEvent?.type === "outburst"
              ? "outburst"
              : undefined;
  const hpFlashHeroId = !replayComplete && currentEvent?.type === "shield" ? currentEvent.actorId : null;
  const displayHpA = currentEvent?.hpA ?? heroA.derivedStats.hpTotal;
  const displayHpB = currentEvent?.hpB ?? heroB.derivedStats.hpTotal;

  useEffect(() => {
    if (!fight || !isPlaying) {
      return;
    }

    if (visibleEventCount >= fight.events.length) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setVisibleEventCount((current) => Math.min(current + 1, fight.events.length));
    }, replayStepMs);

    return () => window.clearTimeout(timer);
  }, [fight, isPlaying, visibleEventCount]);

  function drawOpponent() {
    if (isPlaying) {
      return;
    }
    const candidates = heroes.filter((hero) => hero.id !== heroAId);
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    if (next) {
      setHeroBId(next.id);
      setFight(null);
      setVisibleEventCount(0);
    }
  }

  function startFight() {
    if (!canFight || isPlaying) {
      return;
    }
    const nextFight = simulateArenaFight(heroA, heroB);
    setFight(nextFight);
    setVisibleEventCount(Math.min(1, nextFight.events.length));
    setIsPlaying(nextFight.events.length > 1);
  }

  function replayFight() {
    if (!fight || isPlaying) {
      return;
    }
    setVisibleEventCount(Math.min(1, fight.events.length));
    setIsPlaying(fight.events.length > 1);
  }

  return (
    <div className="arena-console">
      <div className="arena-controls panel">
        <div className="field">
          <label htmlFor="fighter-a">Dein Held</label>
          <select
            id="fighter-a"
            value={heroAId}
            disabled={isPlaying}
            onChange={(event) => {
              setHeroAId(event.target.value);
              setFight(null);
              setVisibleEventCount(0);
            }}
          >
            {heroes.map((hero) => (
              <option key={hero.id} value={hero.id}>
                {hero.heroName}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fighter-b">Gegner</label>
          <select
            id="fighter-b"
            value={heroBId}
            disabled={isPlaying}
            onChange={(event) => {
              setHeroBId(event.target.value);
              setFight(null);
              setVisibleEventCount(0);
            }}
          >
            {heroes.map((hero) => (
              <option key={hero.id} value={hero.id}>
                {hero.heroName}
              </option>
            ))}
          </select>
        </div>
        <div className="actions compact-actions">
          <button className="button" type="button" onClick={drawOpponent} disabled={isPlaying}>
            Gegner zufaellig ziehen
          </button>
          <button className="button primary" type="button" onClick={startFight} disabled={!canFight || isPlaying}>
            {isPlaying ? "Kampf laeuft" : "Kampf starten"}
          </button>
          <button className="button" type="button" onClick={replayFight} disabled={!fight || isPlaying}>
            Replay
          </button>
        </div>
        <p className="muted">
          {isPlaying ? "Replay laeuft Schritt fuer Schritt." : status}
        </p>
      </div>

      <section className="arena-band arena-live" aria-label="Arena">
        <div className="fighter-row">
          <HeroCard
            name={heroA.heroName}
            stats={{ ...heroA.derivedStats, hpTotal: displayHpA }}
            maxHp={fight?.maxHpA}
            isActive={activeHeroId === heroA.id}
            hpFlash={hpFlashHeroId === heroA.id}
            badge={
              fight && replayComplete && fight.winnerId === heroA.id
                ? "winner"
                : activeHeroId === heroA.id
                  ? "active"
                  : undefined
            }
            statusIcon={statusIconHeroId === heroA.id ? currentStatusIcon : undefined}
            side="cyan"
            avatarSrc="/assets/avatar-female.png"
          />
          <HeroCard
            name={heroB.heroName}
            stats={{ ...heroB.derivedStats, hpTotal: displayHpB }}
            maxHp={fight?.maxHpB}
            isActive={activeHeroId === heroB.id}
            hpFlash={hpFlashHeroId === heroB.id}
            badge={
              fight && replayComplete && fight.winnerId === heroB.id
                ? "winner"
                : activeHeroId === heroB.id
                  ? "active"
                  : undefined
            }
            statusIcon={statusIconHeroId === heroB.id ? currentStatusIcon : undefined}
            side="red"
            avatarSrc="/assets/avatar-male.png"
          />
        </div>
        <div className="arena-status-strip">
          <span>{currentEvent ? `Runde ${currentEvent.round}` : "Bereit"}</span>
          <strong>{currentEvent?.message ?? "Waehle zwei Helden und starte den Kampf."}</strong>
          {fight ? (
            <small>
              Ereignis {visibleEventCount}/{fight.events.length}
            </small>
          ) : null}
        </div>
        <ActionPanel key={`${currentEvent?.type ?? "ready"}-${visibleEventCount}`} event={currentEvent} heroA={heroA} heroB={heroB} />
        {fight && replayComplete ? (
          <div className="winner-banner">
            {fight.wasKo ? "KO-Sieger" : "Punktsieger"}: <strong>{fight.winnerName}</strong>
          </div>
        ) : null}
        <div className="arena-floor" />
      </section>

      <section className="panel fight-log-panel">
        <h2>Kampfverlauf</h2>
        {!fight ? (
          <p className="muted">Starte einen Kampf, um das Replay zu sehen.</p>
        ) : (
          <ol className="fight-log">
            {visibleEventsNewestFirst.map((event, index) => (
              <li
                className={index === 0 ? "is-current" : undefined}
                key={`${event.round}-${visibleEvents.length - index}`}
              >
                <span>R{event.round}</span>
                <p>{event.message}</p>
                <small>
                  HP {heroA.heroName}: {event.hpA} / {heroB.heroName}: {event.hpB}
                </small>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function createDemoHero(id: string, heroName: string, rawValues: RawHeroValues): HeroSummary {
  return {
    id,
    heroName,
    source: "random",
    derivedStats: generateHeroStats(rawValues),
    createdAt: new Date(0).toISOString(),
  };
}
