"use client";

import { RefObject, useMemo, useRef, useState } from "react";
import type { DerivedHeroStats, RawHeroValues } from "@/types/domain";
import { strengthClassLabels } from "@/lib/labels";

type FormValues = RawHeroValues & {
  heroName: string;
};

const emptyValues: FormValues = {
  heroName: "",
  age: 35,
  gender: 1,
  bmi: 27,
  waistCircumference: 92,
  height: 176,
  bodyWeight: 84,
  sittingMin: 300,
  alcoholAvg: 1,
  smokingStatus: 2,
  sleepHours: 8,
  insuranceStatus: 1,
  systolicBp: 120,
  diastolicBp: 75,
  pulse: 70,
  mentalFocus: 0,
  balanceStatus: 1,
};

const numericFields = [
  "age",
  "bmi",
  "waistCircumference",
  "height",
  "bodyWeight",
  "sittingMin",
  "alcoholAvg",
  "sleepHours",
  "systolicBp",
  "diastolicBp",
  "pulse",
] as const satisfies readonly (keyof RawHeroValues)[];

type NumericField = (typeof numericFields)[number];
type RerollField = keyof RawHeroValues;

const rollDelayMs = 680;

export function HeroCreator() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [stats, setStats] = useState<DerivedHeroStats | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [alias, setAlias] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileRolling, setIsProfileRolling] = useState(false);
  const [rollingField, setRollingField] = useState<RerollField | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);

  const canPreview = useMemo(() => numericFields.every((field) => Number.isFinite(values[field])), [values]);
  const fieldErrors = useMemo(() => getFieldErrors(values), [values]);
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const canSave = Boolean(stats && values.heroName.trim().length >= 2 && !hasFieldErrors);

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function randomizeProfile() {
    setIsLoading(true);
    setIsProfileRolling(true);
    try {
      await delay(rollDelayMs);
      const response = await fetch("/api/heroes/random", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setValues((current) => ({
        ...current,
        ...data.rawValues,
        heroName: current.heroName || "Neuer Held",
      }));
      setStats(data.derivedStats);
      setWarnings([]);
    } finally {
      setIsProfileRolling(false);
      setIsLoading(false);
    }
  }

  async function rerollField(field: RerollField) {
    if (rollingField) {
      return;
    }
    setRollingField(field);
    try {
      await delay(rollDelayMs);
      const response = await fetch("/api/heroes/random", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawValues: toRawValues(values),
          rerollFields: [field],
        }),
      });
      const data = await response.json();
      setValues((current) => ({
        ...current,
        ...data.rawValues,
      }));
      setStats(data.derivedStats);
      setWarnings([]);
    } finally {
      setRollingField(null);
    }
  }

  async function previewHero() {
    setIsLoading(true);
    try {
      const rawValues = toRawValues(values);
      const response = await fetch("/api/heroes/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawValues }),
      });
      const data = await response.json();
      setValues((current) => ({ ...current, ...data.rawValues }));
      setStats(data.derivedStats);
      setWarnings(data.validation?.warnings ?? []);
      window.requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function saveHero() {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      let activePlayerId = playerId;
      if (!activePlayerId) {
        const playerResponse = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alias: alias.trim() || "Anonymer Spieler" }),
        });
        const playerData = await playerResponse.json();
        if (!playerResponse.ok) {
          throw new Error(playerData.error ?? "Spieler konnte nicht erstellt werden.");
        }
        activePlayerId = playerData.playerId;
        setPlayerId(activePlayerId);
      }

      const heroResponse = await fetch("/api/heroes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: activePlayerId,
          heroName: values.heroName,
          source: "mixed",
          rawValues: toRawValues(values),
          isPublic: true,
        }),
      });
      const heroData = await heroResponse.json();
      if (!heroResponse.ok) {
        throw new Error(heroData.error ?? "Held konnte nicht gespeichert werden.");
      }

      setStats(heroData.derivedStats);
      setWarnings(heroData.validation?.warnings ?? []);
      setStatusMessage("Held gespeichert.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <section className="section">
        <h1>Erschaffe deinen AlltagsHeld</h1>
        <p className="muted">
          Trage bekannte Werte ein und wuerfle nur das, was du nicht kennst.
        </p>
        <form className="panel" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="alias">Dein richtiger Name, wenn du willst</label>
              <input
                id="alias"
                name="alias"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder="optional"
              />
              <small>Bleibt optional. Oeffentlich soll spaeter vor allem dein Held auftreten.</small>
            </div>
            <div className="field">
              <label htmlFor="heroName">Heldenname</label>
              <input
                id="heroName"
                name="heroName"
                value={values.heroName}
                onChange={(event) => updateValue("heroName", event.target.value)}
                placeholder="z. B. Pulsjaeger Nova"
              />
              <small>Der Heldenname verbindet deine Werte mit deinem digitalen Avatar.</small>
            </div>
            <div className="field">
              <label htmlFor="gender">Geschlecht fuer Referenzwerte</label>
              <select
                id="gender"
                name="gender"
                value={values.gender}
                onChange={(event) => updateValue("gender", Number(event.target.value) as 1 | 2)}
              >
                <option value="1">maennlich</option>
                <option value="2">weiblich</option>
              </select>
            </div>
            {numericFields.map((field) => (
              <NumberField
                key={field}
                field={field}
                label={fieldLabels[field]}
                value={displayValue(field, values)}
                description={fieldDescriptions[field]}
                rolling={rollingField === field || isProfileRolling}
                error={fieldErrors[field]}
                disabled={isProfileRolling}
                onReroll={() => rerollField(field)}
                onChange={(value) => setValues((current) => applyDisplayValue(current, field, value))}
              />
            ))}
            <div className="field">
              <label htmlFor="smokingStatus">Rauchstatus</label>
              <div className="input-action">
                <select
                  id="smokingStatus"
                  value={values.smokingStatus}
                  onChange={(event) =>
                    updateValue("smokingStatus", Number(event.target.value) as 1 | 2)
                  }
                >
                  <option value="1">Raucher</option>
                  <option value="2">Nichtraucher</option>
                </select>
                <button
                  className={`icon-button${
                    rollingField === "smokingStatus" || isProfileRolling ? " is-rolling" : ""
                  }`}
                  type="button"
                  onClick={() => rerollField("smokingStatus")}
                  disabled={rollingField === "smokingStatus" || isProfileRolling}
                  title="Rauchstatus wuerfeln"
                  aria-label="Rauchstatus wuerfeln"
                >
                  &#9856;
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="mentalFocus">Mentaler Fokus</label>
              <small>Wie wuerdest du deine Mentalitaet der letzten 4 Wochen einschaetzen?</small>
              <div className="input-action">
                <select
                  id="mentalFocus"
                  value={values.mentalFocus}
                  onChange={(event) =>
                    updateValue("mentalFocus", Number(event.target.value) as 0 | 1 | 2 | 3)
                  }
                >
                  <option value="0">klar und fokussiert</option>
                  <option value="1">meist stabil</option>
                  <option value="2">oft unkonzentriert</option>
                  <option value="3">stark belastet</option>
                </select>
                <button
                  className={`icon-button${
                    rollingField === "mentalFocus" || isProfileRolling ? " is-rolling" : ""
                  }`}
                  type="button"
                  onClick={() => rerollField("mentalFocus")}
                  disabled={rollingField === "mentalFocus" || isProfileRolling}
                  title="Mentalen Fokus wuerfeln"
                  aria-label="Mentalen Fokus wuerfeln"
                >
                  &#9856;
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="balanceStatus">Balance</label>
              <small>Wie gut schaetzt du deine Balancefaehigkeit ein?</small>
              <div className="input-action">
                <select
                  id="balanceStatus"
                  value={values.balanceStatus}
                  onChange={(event) =>
                    updateValue("balanceStatus", Number(event.target.value) as 1 | 2)
                  }
                >
                  <option value="1">sicher</option>
                  <option value="2">unsicher</option>
                </select>
                <button
                  className={`icon-button${
                    rollingField === "balanceStatus" || isProfileRolling ? " is-rolling" : ""
                  }`}
                  type="button"
                  onClick={() => rerollField("balanceStatus")}
                  disabled={rollingField === "balanceStatus" || isProfileRolling}
                  title="Balance wuerfeln"
                  aria-label="Balance wuerfeln"
                >
                  &#9856;
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="insuranceStatus">Schutz</label>
              <small>Bist du bei AlliancArena versichert?</small>
              <div className="input-action">
                <select
                  id="insuranceStatus"
                  value={values.insuranceStatus}
                  onChange={(event) =>
                    updateValue("insuranceStatus", Number(event.target.value) as 1 | 2)
                  }
                >
                  <option value="1">Ja</option>
                  <option value="2">Nein</option>
                </select>
                <button
                  className={`icon-button${
                    rollingField === "insuranceStatus" || isProfileRolling ? " is-rolling" : ""
                  }`}
                  type="button"
                  onClick={() => rerollField("insuranceStatus")}
                  disabled={rollingField === "insuranceStatus" || isProfileRolling}
                  title="Schutz wuerfeln"
                  aria-label="Schutz wuerfeln"
                >
                  &#9856;
                </button>
              </div>
            </div>
          </div>
          <div className="actions">
            <button className="button" type="button" onClick={randomizeProfile} disabled={isLoading}>
              Profil wuerfeln
            </button>
            <button
              className="button"
              type="button"
              onClick={previewHero}
              disabled={isLoading || !canPreview}
            >
              Werte pruefen
            </button>
            <button
              className="button primary"
              type="button"
              onClick={saveHero}
              disabled={isLoading || !canSave}
            >
              Held speichern
            </button>
          </div>
          {statusMessage ? <p className="muted">{statusMessage}</p> : null}
        </form>
      </section>
      <HeroPreview
        previewRef={previewRef}
        name={values.heroName || "Unbenannter Held"}
        stats={stats}
        warnings={warnings}
      />
    </div>
  );
}

function NumberField({
  field,
  label,
  value,
  description,
  rolling,
  error,
  disabled,
  onReroll,
  onChange,
}: {
  field: NumericField;
  label: string;
  value: number;
  description?: string;
  rolling: boolean;
  error?: string;
  disabled?: boolean;
  onReroll: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={field}>{label}</label>
      {description ? <small>{description}</small> : null}
      <div className="input-action">
        <input
          id={field}
          name={field}
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <button
          className={`icon-button${rolling ? " is-rolling" : ""}`}
          type="button"
          onClick={onReroll}
          disabled={rolling || disabled}
          title={`${label} wuerfeln`}
          aria-label={`${label} wuerfeln`}
        >
          &#9856;
        </button>
      </div>
      {error ? <small className="field-error">{error}</small> : null}
    </div>
  );
}

function HeroPreview({
  previewRef,
  name,
  stats,
  warnings,
}: {
  previewRef: RefObject<HTMLElement | null>;
  name: string;
  stats: DerivedHeroStats | null;
  warnings: string[];
}) {
  return (
    <aside ref={previewRef} className="panel hero-preview-panel">
      <div className="avatar-stage">
        <img src="/assets/avatar-neutral.png" alt="" />
      </div>
      <h2>Hero-Preview</h2>
      {!stats ? (
        <p className="muted">Wuerfle ein Profil oder pruefe deine Werte.</p>
      ) : (
        <>
          <h3>{name}</h3>
          <p className="muted">{strengthClassLabels[stats.strengthClass]}</p>
          <div className="stat-grid">
            <PreviewStat label="HP" value={stats.hpTotal} />
            <PreviewStat label="ATK" value={stats.atkTotal} />
            <PreviewStat label="STA" value={stats.stamina} />
            <PreviewStat label="RNG" value={stats.rangeTotal} />
            <PreviewStat label="EVA" value={stats.evasionScore} />
            <PreviewStat label="PRE" value={stats.precisionScore} />
          </div>
          {warnings.length > 0 ? (
            <div className="panel" style={{ marginTop: "1rem" }}>
              <h3>Hinweise</h3>
              {warnings.map((warning) => (
                <p className="muted" key={warning}>
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </>
      )}
    </aside>
  );
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function toRawValues(values: FormValues): RawHeroValues {
  return {
    age: values.age,
    gender: values.gender,
    bmi: values.bmi,
    waistCircumference: values.waistCircumference,
    height: values.height,
    bodyWeight: values.bodyWeight,
    sittingMin: values.sittingMin,
    alcoholAvg: values.alcoholAvg,
    smokingStatus: values.smokingStatus,
    sleepHours: values.sleepHours,
    insuranceStatus: values.insuranceStatus,
    systolicBp: values.systolicBp,
    diastolicBp: values.diastolicBp,
    pulse: values.pulse,
    mentalFocus: values.mentalFocus,
    balanceStatus: values.balanceStatus,
  };
}

const fieldLabels: Record<NumericField, string> = {
  age: "Alter",
  bmi: "BMI",
  waistCircumference: "Taillenumfang",
  height: "Groesse",
  bodyWeight: "Gewicht",
  sittingMin: "Sitzstunden",
  alcoholAvg: "Alkohol pro Tag",
  sleepHours: "Schlafstunden",
  systolicBp: "Blutdruck systolisch",
  diastolicBp: "Blutdruck diastolisch",
  pulse: "Puls",
};

const fieldDescriptions: Partial<Record<NumericField, string>> = {
  sleepHours: "Wie viele Stunden schlaefst du jeden Tag im Durchschnitt?",
  sittingMin: "Wie viele Stunden sitzt du pro Tag?",
  alcoholAvg: "Wie viel Alkohol trinkst du pro Tag im Durchschnitt?",
};

type FieldRange = {
  min: number;
  max: number;
  unit?: string;
};

const fieldRanges: Record<NumericField, FieldRange> = {
  age: { min: 18, max: 79 },
  bmi: { min: 10, max: 70 },
  waistCircumference: { min: 45, max: 180, unit: "cm" },
  height: { min: 130, max: 205, unit: "cm" },
  bodyWeight: { min: 35, max: 230, unit: "kg" },
  sittingMin: { min: 60, max: 900, unit: "min" },
  alcoholAvg: { min: 0, max: 15 },
  sleepHours: { min: 2, max: 14, unit: "h" },
  systolicBp: { min: 80, max: 240 },
  diastolicBp: { min: 40, max: 150 },
  pulse: { min: 35, max: 140 },
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function displayValue(field: NumericField, values: FormValues) {
  if (field === "sittingMin") {
    return Number((values.sittingMin / 60).toFixed(1));
  }
  return values[field];
}

function applyDisplayValue(values: FormValues, field: NumericField, value: number): FormValues {
  if (field === "sittingMin") {
    return { ...values, sittingMin: Math.round(value * 60) };
  }
  return { ...values, [field]: value };
}

function getFieldErrors(values: FormValues): Partial<Record<NumericField, string>> {
  const errors: Partial<Record<NumericField, string>> = {};

  for (const field of numericFields) {
    const range = fieldRanges[field];
    const value = values[field];
    if (!Number.isFinite(value) || value < range.min || value > range.max) {
      errors[field] = formatRangeError(field, range);
    }
  }

  if (values.diastolicBp >= values.systolicBp) {
    errors.diastolicBp = "Muss unter dem systolischen Wert liegen.";
  }

  return errors;
}

function formatRangeError(field: NumericField, range: FieldRange) {
  if (field === "sittingMin") {
    return `Erlaubt: ${range.min / 60}-${range.max / 60} h.`;
  }
  return `Erlaubt: ${range.min}-${range.max}${range.unit ? ` ${range.unit}` : ""}.`;
}
