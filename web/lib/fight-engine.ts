import type { DerivedHeroStats, HeroSummary } from "@/types/domain";

export type FightEventType =
  | "match_intro"
  | "match_start"
  | "range_check"
  | "first_attacker"
  | "shield"
  | "round_start"
  | "stamina_pass"
  | "stamina_skip"
  | "fight_end"
  | "smoker_clear"
  | "smoker_skip"
  | "smoker_malus"
  | "mental_stable"
  | "outburst"
  | "rage"
  | "attack_full"
  | "attack_graze"
  | "dodge"
  | "drunkard_luck"
  | "balance_stable"
  | "balance_trip"
  | "ko"
  | "winner";

export type FightEvent = {
  type: FightEventType;
  round: number;
  actorId?: string;
  actor: string;
  targetId?: string;
  target?: string;
  message: string;
  damage?: number;
  hpA: number;
  hpB: number;
};

export type FightResult = {
  winnerId: string;
  loserId: string;
  winnerName: string;
  roundsStarted: number;
  wasKo: boolean;
  maxHpA: number;
  maxHpB: number;
  restHpA: number;
  restHpB: number;
  events: FightEvent[];
};

type FighterState = {
  hero: HeroSummary;
  hp: number;
};

type RandomSource = {
  next(): number;
  d20(): number;
};

export function simulateArenaFight(
  heroA: HeroSummary,
  heroB: HeroSummary,
  seed = Date.now(),
): FightResult {
  const rng = createSeededRng(seed);
  const fighterA: FighterState = { hero: heroA, hp: heroA.derivedStats.hpTotal };
  const fighterB: FighterState = { hero: heroB, hp: heroB.derivedStats.hpTotal };
  const events: FightEvent[] = [];
  let firstAttacker =
    heroA.derivedStats.rangeTotal >= heroB.derivedStats.rangeTotal ? fighterA : fighterB;
  let secondAttacker = firstAttacker === fighterA ? fighterB : fighterA;
  let roundsStarted = 0;

  events.push({
    type: "match_intro",
    round: 0,
    actor: "Arena",
    message: pick(
      [
        "Aus dem Alltag in die Arena - Zwei Kaempfer zeigen, wie fit sie heute sind!",
        "Die Helden betreten die Arena - Moege der fitteste gewinnen.",
        "Beobachten wir genau die Stats der zwei Helden in der Arena.",
      ],
      rng,
    ),
    hpA: roundHp(fighterA.hp),
    hpB: roundHp(fighterB.hp),
  });

  events.push({
    type: "match_start",
    round: 0,
    actor: "Arena",
    message: `${fighterA.hero.heroName} und ${fighterB.hero.heroName} betreten die Arena.`,
    hpA: roundHp(fighterA.hp),
    hpB: roundHp(fighterB.hp),
  });

  events.push({
    type: "range_check",
    round: 0,
    actor: "Arena",
    message: pick(
      [
        "Der Spieler mit der groesseren Reichweite beginnt.",
        "Wer hat die groesste Reichweite? Lass uns mal sehen.",
        "Schauen wir auf die Reichweite der Spieler.",
      ],
      rng,
    ),
    hpA: roundHp(fighterA.hp),
    hpB: roundHp(fighterB.hp),
  });

  events.push({
    type: "first_attacker",
    round: 0,
    actorId: firstAttacker.hero.id,
    actor: firstAttacker.hero.heroName,
    message: `${firstAttacker.hero.heroName} beginnt den Kampf.`,
    hpA: roundHp(fighterA.hp),
    hpB: roundHp(fighterB.hp),
  });

  for (const fighter of [fighterA, fighterB]) {
    if (fighter.hero.derivedStats.insuranceType === "Protection") {
      fighter.hp += 5;
      events.push({
        type: "shield",
        round: 0,
        actorId: fighter.hero.id,
        actor: fighter.hero.heroName,
        message: buildMessage("shield", fighter, undefined, rng),
        hpA: roundHp(fighterA.hp),
        hpB: roundHp(fighterB.hp),
      });
    }
  }
  const maxHpA = roundHp(fighterA.hp);
  const maxHpB = roundHp(fighterB.hp);

  for (let round = 1; round <= 5; round += 1) {
    if (fighterA.hp <= 0 || fighterB.hp <= 0) {
      break;
    }

    roundsStarted = round;
    events.push({
      type: "round_start",
      round,
      actor: "Arena",
      message: `Runde ${round}`,
      hpA: roundHp(fighterA.hp),
      hpB: roundHp(fighterB.hp),
    });

    for (const [attacker, defender] of [
      [firstAttacker, secondAttacker],
      [secondAttacker, firstAttacker],
    ] as const) {
      if (attacker.hp <= 0 || defender.hp <= 0) {
        break;
      }

      if (attacker.hero.derivedStats.stamina < round) {
        if (round < 5) {
          events.push({
            type: "stamina_skip",
            round,
            actorId: attacker.hero.id,
            actor: attacker.hero.heroName,
            message: buildMessage("stamina_skip", attacker, undefined, rng),
            hpA: roundHp(fighterA.hp),
            hpB: roundHp(fighterB.hp),
          });
        }
        continue;
      }

      if (round >= 3 && round < 5) {
        events.push({
          type: "stamina_pass",
          round,
          actorId: attacker.hero.id,
          actor: attacker.hero.heroName,
          message: buildMessage("stamina_pass", attacker, undefined, rng),
          hpA: roundHp(fighterA.hp),
          hpB: roundHp(fighterB.hp),
        });
      }

      const smoker = checkSmokerStatus(attacker, rng);
      events.push({
        type: smoker.type,
        round,
        actorId: attacker.hero.id,
        actor: attacker.hero.heroName,
        message: smoker.message,
        hpA: roundHp(fighterA.hp),
        hpB: roundHp(fighterB.hp),
      });

      if (!smoker.canAttack) {
        continue;
      }

      const mental = checkMentalStatus(attacker, rng);
      events.push({
        type: mental.type,
        round,
        actorId: attacker.hero.id,
        actor: attacker.hero.heroName,
        message: mental.message,
        hpA: roundHp(fighterA.hp),
        hpB: roundHp(fighterB.hp),
      });

      const attack = resolveAttack(
        attacker.hero.derivedStats,
        defender.hero.derivedStats,
        smoker.attackModifier + mental.attackModifier,
        rng,
      );
      if (attack.damage <= 0) {
        events.push({
          type: attack.type,
          round,
          actorId: attacker.hero.id,
          actor: attacker.hero.heroName,
          targetId: defender.hero.id,
          target: defender.hero.heroName,
          message: attack.message,
          damage: 0,
          hpA: roundHp(fighterA.hp),
          hpB: roundHp(fighterB.hp),
        });
        continue;
      }

      defender.hp = Math.max(0, defender.hp - attack.damage);
      events.push({
        type: attack.type,
        round,
        actorId: attacker.hero.id,
        actor: attacker.hero.heroName,
        targetId: defender.hero.id,
        target: defender.hero.heroName,
        message: `${attack.message} ${attack.damage} Schaden.`,
        damage: attack.damage,
        hpA: roundHp(fighterA.hp),
        hpB: roundHp(fighterB.hp),
      });

      if (defender.hp <= 0) {
        events.push({
          type: "ko",
          round,
          actorId: attacker.hero.id,
          actor: "Arena",
          targetId: defender.hero.id,
          target: defender.hero.heroName,
          message: buildMessage("ko", defender, attacker, rng),
          hpA: roundHp(fighterA.hp),
          hpB: roundHp(fighterB.hp),
        });
        break;
      }

      const balance = checkBalanceTrip(defender, rng);
      defender.hp = Math.max(0, defender.hp + balance.hpModifier);
      events.push({
        type: balance.type,
        round,
        actorId: defender.hero.id,
        actor: defender.hero.heroName,
        targetId: defender.hero.id,
        target: defender.hero.heroName,
        message: balance.message,
        hpA: roundHp(fighterA.hp),
        hpB: roundHp(fighterB.hp),
      });

      if (defender.hp <= 0) {
        events.push({
          type: "ko",
          round,
          actorId: attacker.hero.id,
          actor: "Arena",
          targetId: defender.hero.id,
          target: defender.hero.heroName,
          message: buildMessage("ko", defender, attacker, rng),
          hpA: roundHp(fighterA.hp),
          hpB: roundHp(fighterB.hp),
        });
        break;
      }
    }

    [firstAttacker, secondAttacker] = [secondAttacker, firstAttacker];
  }

  const winner = fighterA.hp >= fighterB.hp ? fighterA : fighterB;
  const loser = winner === fighterA ? fighterB : fighterA;
  const wasKo = fighterA.hp <= 0 || fighterB.hp <= 0;

  if (!wasKo && roundsStarted >= 5) {
    events.push({
      type: "fight_end",
      round: 5,
      actor: "Arena",
      message: "Der Kampf ist zu Ende - geht auseinander.",
      hpA: roundHp(fighterA.hp),
      hpB: roundHp(fighterB.hp),
    });
  }

  events.push({
    type: "winner",
    round: roundsStarted,
    actorId: winner.hero.id,
    actor: "Arena",
    targetId: winner.hero.id,
    target: winner.hero.heroName,
    message: buildWinnerMessage(winner, roundsStarted, wasKo, rng),
    hpA: roundHp(fighterA.hp),
    hpB: roundHp(fighterB.hp),
  });

  return {
    winnerId: winner.hero.id,
    loserId: loser.hero.id,
    winnerName: winner.hero.heroName,
    roundsStarted,
    wasKo,
    maxHpA,
    maxHpB,
    restHpA: roundHp(fighterA.hp),
    restHpB: roundHp(fighterB.hp),
    events,
  };
}

function resolveAttack(
  attacker: DerivedHeroStats,
  defender: DerivedHeroStats,
  attackModifier: number,
  rng: RandomSource,
) {
  if (defender.alcoholType === "Drunkard" && rng.d20() <= 3) {
    return {
      type: "drunkard_luck" as const,
      damage: 0,
      message: buildMessage("drunkard_luck", undefined, undefined, rng),
    };
  }

  const roll = rng.d20();
  const effectiveEvasion = Math.max(0, defender.evasionScore - attacker.precisionScore);
  let efficiency = 1;
  let type: "attack_full" | "attack_graze" | "dodge" = "attack_full";

  if (roll <= effectiveEvasion / 2) {
    efficiency = 0;
    type = "dodge";
  } else if (roll <= effectiveEvasion) {
    efficiency = 0.8;
    type = "attack_graze";
  }

  const damage = round1(Math.max(0, (attacker.atkTotal + attackModifier) * efficiency));
  return { type, damage, message: buildAttackMessage(type, damage, rng) };
}

function checkSmokerStatus(attacker: FighterState, rng: RandomSource) {
  if (attacker.hero.derivedStats.smokerType !== "Smoker") {
    return {
      type: "smoker_clear" as const,
      canAttack: true,
      attackModifier: 0,
      message: buildMessage("smoker_clear", attacker, undefined, rng),
    };
  }

  const roll = rng.d20();
  if (roll <= 2) {
    return {
      type: "smoker_skip" as const,
      canAttack: false,
      attackModifier: 0,
      message: buildMessage("smoker_skip", attacker, undefined, rng),
    };
  }
  if (roll <= 6) {
    return {
      type: "smoker_malus" as const,
      canAttack: true,
      attackModifier: -5,
      message: buildMessage("smoker_malus", attacker, undefined, rng),
    };
  }

  return {
    type: "smoker_clear" as const,
    canAttack: true,
    attackModifier: 0,
    message: buildMessage("smoker_clear", attacker, undefined, rng),
  };
}

function checkMentalStatus(attacker: FighterState, rng: RandomSource) {
  if (attacker.hero.derivedStats.mentalFocusType === "Mental Exhaustion" && attacker.hp <= 15) {
    const roll = rng.d20();
    if (roll <= 4) {
      return {
        type: "rage" as const,
        attackModifier: 10,
        message: buildMessage("rage", attacker, undefined, rng),
      };
    }
    if (roll <= 8) {
      return {
        type: "outburst" as const,
        attackModifier: 5,
        message: buildMessage("outburst", attacker, undefined, rng),
      };
    }
  }

  return {
    type: "mental_stable" as const,
    attackModifier: 0,
    message: buildMessage("mental_stable", attacker, undefined, rng),
  };
}

function checkBalanceTrip(defender: FighterState, rng: RandomSource) {
  if (defender.hero.derivedStats.balanceType === "Unbalanced" && rng.d20() <= 10) {
    return {
      type: "balance_trip" as const,
      hpModifier: -5,
      message: buildMessage("balance_trip", defender, undefined, rng),
    };
  }

  return {
    type: "balance_stable" as const,
    hpModifier: 0,
    message: buildMessage("balance_stable", defender, undefined, rng),
  };
}

function buildAttackMessage(type: "attack_full" | "attack_graze" | "dodge", damage: number, rng: RandomSource) {
  if (type === "dodge") {
    return pick([
      "Der Schlag rauscht ins Leere.",
      "Im letzten Moment kippt die Linie weg.",
      "Knapp vorbei. Nur Regen bleibt in der Luft.",
    ], rng);
  }
  if (type === "attack_graze") {
    return pick([
      "Gestreift, aber spuerbar.",
      "Nicht sauber getroffen, doch es reicht fuer Druck.",
      "Halber Treffer.",
    ], rng);
  }
  return pick([
    "Volltreffer.",
    "Der Treffer sitzt.",
    "Keine Luecke, nur Einschlag.",
    damage >= 25 ? "Ein schwerer Treffer bricht durch." : "Der Schlag findet sein Ziel.",
  ], rng);
}

function buildWinnerMessage(winner: FighterState, roundsStarted: number, wasKo: boolean, rng: RandomSource) {
  if (wasKo) {
    return pick([
      `KO-Sieg fuer ${winner.hero.heroName}.`,
      `${winner.hero.heroName} beendet den Kampf vorzeitig.`,
      `Der Ring gehoert ${winner.hero.heroName}. KO.`,
    ], rng);
  }
  return pick([
    `Punktsieg nach ${roundsStarted} Runden fuer ${winner.hero.heroName}.`,
    `${winner.hero.heroName} bleibt nach ${roundsStarted} Runden vorn.`,
    `Die Uhr rettet niemanden: ${winner.hero.heroName} gewinnt nach Punkten.`,
  ], rng);
}

function buildMessage(
  type: FightEventType,
  actor: FighterState | undefined,
  other: FighterState | undefined,
  rng: RandomSource,
) {
  const name = actor?.hero.heroName ?? "Der Gegner";
  const otherName = other?.hero.heroName ?? "der Gegner";
  const strengthClass = actor?.hero.derivedStats.strengthClass;

  if (type === "shield") {
    return pick([
      `${name} aktiviert seinen Schutzschild.`,
      "Der AllianzArena Schutz wird aufgebaut.",
      "Schuetzendes Allianzschild blitzt auf.",
    ], rng);
  }
  if (type === "stamina_skip") {
    return pick([
      `${name} geht die Puste aus. Bekommst du nicht mal den Arm gehoben?`,
      "Keinen Schritt weiter. Du hast dich schon wieder verausgabt.",
      "Dir haengt ja schon die Zunge raus! Ausdauer verbraucht.",
    ], rng);
  }
  if (type === "stamina_pass") {
    return pick([
      `${name} ist richtig fit. ${pronounFor(actor)} kaempft weiter.`,
      `Da hat jemand an seiner Ausdauer gearbeitet. ${name} kaempft weiter.`,
      `Ausdauerbombe! ${name} kaempft weiter.`,
    ], rng);
  }
  if (type === "smoker_skip") {
    return pick([
      `Kettenraucher ${name} bekommt die Zigarette nicht aus.`,
      `So laut habe ich noch nie jemanden husten gehoert! ${name} muss aussetzen.`,
      `Rauchen beruhigt. In diesem Fall nicht den Husten. ${name} setzt aus.`,
    ], rng);
  }
  if (type === "smoker_malus") {
    return pick([
      "Autsch - zu dumm um zu rauchen.",
      `${name} Zigarette falsch rum in den Mund gesteckt?`,
      `Hot, aber nicht sein Kampfstil. ${name} verbrennt sich an seiner Zigarette.`,
    ], rng);
  }
  if (type === "smoker_clear") {
    return pick([
      `${name} atmet tief durch.`,
      `${name} bleibt ruhig in der Deckung.`,
      `${name} misst die Distanz.`,
    ], rng);
  }
  if (type === "mental_stable") {
    return pick([
      `${name} bleibt mental stabil.`,
      `${name} haelt den Fokus.`,
      `${name} bleibt kalt genug fuer den naechsten Zug.`,
    ], rng);
  }
  if (type === "rage") {
    return pick([
      `${name} ist voellig verrueckt geworden. Er rastet total aus.`,
      `Geht in Deckung. ${name} ist wild geworden.`,
      `Crazy ${name} ist wieder da!`,
    ], rng);
  }
  if (type === "outburst") {
    return pick([
      `${name} wirft einen Laptop gegen den Gegner.`,
      `${name} rastet aus und rammt einen Bleistift ins Knie des Gegners.`,
      `${name} trifft den Gegner mit seinem herumfliegenden Schuh.`,
    ], rng);
  }
  if (type === "drunkard_luck") {
    return pick([
      "Drunkard Luck: Der Gegner wankt unkontrolliert zur Seite.",
      "Ein taumelnder Schritt rettet den Treffer.",
      "Nicht elegant, aber weg ist weg.",
    ], rng);
  }
  if (type === "balance_trip") {
    return pick([
      `${name} verliert das Gleichgewicht (-5 HP).`,
      `${name} stolpert in den eigenen Schaden.`,
      `Der Boden holt ${name} noch einmal ein (-5 HP).`,
    ], rng);
  }
  if (type === "balance_stable") {
    return pick([
      `${name} bleibt nach dem Schlag stabil.`,
      `${name} schluckt den Treffer und bleibt stehen.`,
      `${name} wankt kurz, faengt sich aber.`,
    ], rng);
  }
  if (type === "ko") {
    return pick([
      `${name} geht zu Boden.`,
      `${otherName} schickt ${name} auf die Bretter.`,
      `Der Treffer beendet ${name}s Abend.`,
    ], rng);
  }
  return `${name} handelt.`;
}

function pronounFor(actor: FighterState | undefined) {
  if (actor?.hero.derivedStats) {
    return actor.hero.heroName.endsWith("a") ? "Sie" : "Er";
  }
  return "Der Held";
}

function pick<T>(items: T[], rng: RandomSource): T {
  return items[Math.floor(rng.next() * items.length)];
}

function createSeededRng(seed: number): RandomSource {
  let state = seed >>> 0;
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    },
    d20() {
      return Math.floor(this.next() * 20) + 1;
    },
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function roundHp(value: number) {
  return Math.round(Math.max(0, value) * 10) / 10;
}
