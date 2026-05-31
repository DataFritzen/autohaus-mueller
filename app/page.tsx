import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CarFront,
  Gauge,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

const highlights = [
  { label: "460 PS", text: "M TwinPower Turbo Reihensechszylinder", icon: Gauge },
  { label: "4,1 s", text: "0-100 km/h mit Sportautomatik", icon: Zap },
  { label: "Heckantrieb", text: "Direktes M-Fahrgefühl ohne Kompromisse", icon: CarFront },
  { label: "M Cockpit", text: "Fahrerorientiert, klar, hochwertig", icon: Sparkles },
];

const benefits = [
  "Keine Konfigurations-Flut",
  "Transparente Konditionen",
  "Klare Empfehlungen",
  "Schnelle Angebotsprüfung",
];

const testimonialGroups = [
  [
    "Anfrage gestellt und am selben Tag ein Angebot erhalten.",
    "Professionell, transparent und unkompliziert.",
  ],
  [
    "Die Konditionen waren klar erklärt und exakt auf meinen Bedarf abgestimmt.",
    "Vom Erstkontakt bis zur Konfiguration lief alles schnell und sauber.",
  ],
  [
    "Endlich eine Beratung ohne Druck und ohne versteckte Details.",
    "Sehr hochwertige Abwicklung, kurze Wege und ein starkes Angebot.",
  ],
  [
    "Die Rückmeldung kam schnell und die Rate war nachvollziehbar erklärt.",
    "Autohaus Müller hat Kauf und Leasing fair gegenübergestellt.",
  ],
];

const faqs = [
  {
    question: "Wo ist der Haken?",
    answer:
      "Es gibt keinen versteckten Haken. Das Beispielangebot basiert auf klar definierten Parametern: 48 Monate, 10.000 km pro Jahr und 0 Euro Anzahlung. Die finale Rate hängt von Verfügbarkeit, Bonität und Ausstattung ab.",
  },
  {
    question: "Kann ich mehr Kilometer buchen?",
    answer:
      "Ja. 10.000 km pro Jahr sind ein Einstiegspunkt. Wenn du mehr fährst, kalkulieren wir 15.000, 20.000 oder individuelle Kilometerpakete.",
  },
  {
    question: "Ist meine Anfrage verbindlich?",
    answer:
      "Nein. Deine Anfrage ist kostenlos und unverbindlich. Erst nach persönlicher Beratung und schriftlichem Angebot entscheidest du.",
  },
];

export default function HomePage() {
  return (
    <div className="bmw-landing min-h-screen">
      <section className="bmw-hero scroll-mt-24" id="angebot">
        <div className="bmw-hero__media" aria-hidden="true">
          <Image
            src="/assets/bmw-m2-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="bmw-hero__image"
          />
        </div>
        <div className="bmw-hero__content">
          <p className="bmw-kicker">Autohaus Müller Performance Leasing</p>
          <h1>Warum Kapital binden?</h1>
          <p className="bmw-hero__copy">
            Dein persönliches BMW M2 Leasingangebot. Für Menschen, die Leistung
            nicht nur erwarten, sondern täglich liefern.
          </p>
        </div>
        <aside className="bmw-offer-card" aria-label="BMW M2 Leasingangebot">
          <span className="bmw-offer-card__eyebrow">BMW M2 Leasing</span>
          <div className="bmw-offer-card__price">
            <strong>299 €</strong>
            <em>/ Monat</em>
          </div>
          <dl>
            <div>
              <dt>Anzahlung</dt>
              <dd>0 €</dd>
            </div>
            <div>
              <dt>Laufzeit</dt>
              <dd>48 Monate</dd>
            </div>
            <div>
              <dt>Fahrleistung</dt>
              <dd>10.000 km/Jahr</dd>
            </div>
          </dl>
          <a className="bmw-button bmw-button--primary bmw-offer-card__cta" href="#anfrage">
            Angebot anfordern <ArrowRight size={18} />
          </a>
        </aside>
      </section>

      <section className="bmw-section bmw-section--split" id="exklusiv">
        <div>
          <p className="bmw-kicker">M Club</p>
          <h2>Nicht jeder fährt M.</h2>
        </div>
        <div className="bmw-section__body">
          <p>
            Der BMW M2 ist kein Vernunftauto. Er ist für Menschen, die sich
            etwas erarbeitet haben und Leistung nicht erklären müssen.
          </p>
          <a className="bmw-text-link" href="#anfrage">
            Gehörst du zum M-Club? <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section className="bmw-section scroll-mt-24" id="highlights">
        <div className="bmw-section__head">
          <p className="bmw-kicker">BMW M2 Highlights</p>
          <h2>Kompakt, kompromisslos, sofort präsent.</h2>
        </div>
        <div className="bmw-highlight-grid">
          {highlights.map(({ label, text, icon: Icon }) => (
            <article className="bmw-highlight-card" key={label}>
              <Icon size={24} />
              <h3>{label}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bmw-section bmw-advisor scroll-mt-24" id="beratung">
        <div className="bmw-advisor__visual">
          <Headphones size={42} />
          <span>Persönliche M-Beratung</span>
        </div>
        <div>
          <p className="bmw-kicker">Konfiguration</p>
          <h2>Wir prüfen die perfekte Konfiguration für dich.</h2>
          <p>
            Nicht jeder BMW M2 passt zu jedem Fahrer. Wir prüfen Laufzeit,
            Kilometerleistung und Ausstattung passend zu deinem Bedarf.
          </p>
          <ul className="bmw-check-list">
            {benefits.map((benefit) => (
              <li key={benefit}>
                <BadgeCheck size={18} /> {benefit}
              </li>
            ))}
          </ul>
          <a className="bmw-button bmw-button--primary" href="#anfrage">
            Konfiguration prüfen lassen
          </a>
        </div>
      </section>

      <section className="bmw-section bmw-proof" aria-label="Kundenbewertungen">
        <div>
          <p className="bmw-kicker">Social Proof</p>
          <h2>4,8 Sterne für schnelle, klare Beratung.</h2>
        </div>
        <div className="bmw-testimonial-gallery">
          {testimonialGroups.map((group, groupIndex) => (
            <div className="bmw-testimonials" key={groupIndex}>
              {group.map((quote) => (
                <figure key={quote}>
                  <div className="bmw-stars" aria-label="5 von 5 Sternen">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={17} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote>{quote}</blockquote>
                </figure>
              ))}
            </div>
          ))}
        </div>
        <div className="bmw-slider-dots" aria-hidden="true">
          {testimonialGroups.map((_, index) => (
            <span key={index} />
          ))}
        </div>
      </section>

      <section className="bmw-section bmw-accordion-section scroll-mt-24" id="vergleich">
        <div className="bmw-section__head">
          <p className="bmw-kicker">FAQ</p>
          <h2>Häufige Fragen.</h2>
        </div>
        <details className="bmw-details" open>
          <summary>Leasing vs. Kaufen</summary>
          <div className="bmw-compare">
            <div>
              <h3>Kaufen</h3>
              <p>
                Beim Kauf bindest du 80.000 € Kapital in einem Fahrzeug. Viele
                unserer Kunden entscheiden sich bewusst für Leasing, weil sie
                planbare Kosten, finanzielle Flexibilität und regelmäßige
                Fahrzeugwechsel schätzen.
              </p>
            </div>
            <div>
              <h3>Leasing</h3>
              <p>
                Ob Leasing oder Kauf für dich die bessere Entscheidung ist,
                hängt von deiner persönlichen Situation ab. Wir beraten dich in
                unserem Angebot.
              </p>
            </div>
          </div>
        </details>
        {faqs.map((faq) => (
          <details className="bmw-details" key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>

      <section className="bmw-section bmw-form-section scroll-mt-24" id="anfrage">
        <div>
          <p className="bmw-kicker">Unverbindliche Anfrage</p>
          <p>
            Autohaus Müller meldet sich mit einer klaren Empfehlung zu Rate,
            Laufzeit, Kilometern und Ausstattung.
          </p>
          <div className="bmw-trust-row">
            <span>
              <ShieldCheck size={18} /> Bonitätsprüfung erst nach Rücksprache
            </span>
            <span>
              <CalendarClock size={18} /> Rückmeldung werktags innerhalb von 24h
            </span>
          </div>
        </div>
        <form className="bmw-form">
          <label>
            Vorname
            <input name="firstName" autoComplete="given-name" />
          </label>
          <label>
            Nachname
            <input name="lastName" autoComplete="family-name" />
          </label>
          <label>
            E-Mail
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            Telefon
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            Leasingbeginn
            <select name="start" defaultValue="">
              <option value="" disabled>
                Bitte wählen
              </option>
              <option>Sofort</option>
              <option>In 1-3 Monaten</option>
              <option>Später</option>
            </select>
          </label>
          <label className="bmw-form__full">
            Nachricht
            <textarea name="message" rows={4} />
          </label>
          <button className="bmw-button bmw-button--primary bmw-form__full" type="submit">
            Persönliches Angebot anfordern <ArrowRight size={18} />
          </button>
        </form>
      </section>

    </div>
  );
}
