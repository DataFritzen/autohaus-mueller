import { ArenaGame } from "@/components/ArenaGame";

export default function ArenaPage() {
  return (
    <div className="section">
      <h1>Arena</h1>
      <p className="muted">
        Waehle zwei Helden, ziehe einen Gegner zufaellig und starte ein erstes
        Kampf-Replay.
      </p>
      <ArenaGame />
    </div>
  );
}
