"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export function StickyInquiryCta() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const formSection = document.getElementById("anfrage");

    if (!formSection) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsFormVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -35% 0px", threshold: 0.05 },
    );

    observer.observe(formSection);

    return () => observer.disconnect();
  }, []);

  return (
    <a
      className="bmw-sticky-cta"
      data-hidden={isFormVisible}
      href="#anfrage"
    >
      Angebot anfordern <ArrowRight size={18} />
    </a>
  );
}
