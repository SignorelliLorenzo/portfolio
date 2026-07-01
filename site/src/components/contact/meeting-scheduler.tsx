"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaRegCalendarCheck, FaCheckCircle } from "react-icons/fa";
import type { LandingCopy } from "@/lib/landing-copy";

type SchedulerCopy = LandingCopy["contactPage"]["scheduler"];

interface Slot {
  start: string;
  end: string;
  label: string;
}

interface MeetingSchedulerProps {
  copy: SchedulerCopy;
}

const MAX_DAYS_AHEAD = 30;

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MeetingScheduler({ copy }: MeetingSchedulerProps) {
  const today = new Date();
  const maxDate = new Date(today.getTime() + MAX_DAYS_AHEAD * 86_400_000);

  const [date, setDate] = useState(isoDate(today));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [timeZone, setTimeZone] = useState("");
  const [selected, setSelected] = useState<Slot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [status, setStatus] = useState<"idle" | "booking" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loadSlots = useCallback(async (day: string) => {
    setLoadingSlots(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/availability?date=${day}`);
      const data = await res.json();
      setSlots(Array.isArray(data.slots) ? data.slots : []);
      if (data.timeZone) setTimeZone(data.timeZone);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadSlots(date);
  }, [date, loadSlots]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = selected && name.trim() && emailValid && status !== "booking";

  const handleBook = async () => {
    if (!selected || !canSubmit) return;
    setStatus("booking");
    setErrorMsg("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: selected.start, name, email, topic, honeypot }),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setStatus("error");
      if (res.status === 409) {
        setErrorMsg(copy.taken);
        loadSlots(date); // refresh — someone took it
      } else {
        setErrorMsg(data.error || copy.error);
      }
    } catch {
      setStatus("error");
      setErrorMsg(copy.error);
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center">
        <FaCheckCircle className="mx-auto mb-3 text-emerald-400" size={32} />
        <h3 className="text-xl font-semibold text-foreground">{copy.successTitle}</h3>
        <p className="mt-2 text-muted-foreground">{copy.successBody}</p>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all";

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-center gap-2.5 mb-1">
        <FaRegCalendarCheck className="text-accent" />
        <h2 className="text-2xl font-bold">{copy.heading}</h2>
      </div>
      <p className="text-muted-foreground mb-6">{copy.intro}</p>

      {/* Day picker */}
      <label htmlFor="meeting-date" className="block text-sm font-medium mb-2">
        {copy.dateLabel}
      </label>
      <input
        id="meeting-date"
        type="date"
        value={date}
        min={isoDate(today)}
        max={isoDate(maxDate)}
        onChange={(e) => setDate(e.target.value)}
        className={`${inputCls} mb-5 [color-scheme:dark]`}
      />

      {/* Time slots */}
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium">{copy.timeLabel}</span>
        {timeZone && (
          <span className="text-xs text-muted-foreground">{copy.tzNote.replace("{tz}", timeZone)}</span>
        )}
      </div>

      {loadingSlots ? (
        <p className="text-sm text-muted-foreground py-3">{copy.loading}</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground py-3">{copy.noSlots}</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
          {slots.map((s) => {
            const active = selected?.start === s.start;
            return (
              <button
                key={s.start}
                type="button"
                onClick={() => setSelected(s)}
                className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border hover:border-accent/60 hover:text-accent"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Details — enabled once a slot is picked */}
      <div className={selected ? "space-y-4" : "space-y-4 opacity-50 pointer-events-none select-none"}>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.nameLabel}
            className={inputCls}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.emailLabel}
            className={inputCls}
          />
        </div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={copy.topicLabel}
          className={inputCls}
        />
        {/* Honeypot */}
        <input
          type="text"
          name="company_url"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <motion.button
          type="button"
          onClick={handleBook}
          disabled={!canSubmit}
          whileHover={{ scale: canSubmit ? 1.01 : 1 }}
          whileTap={{ scale: canSubmit ? 0.99 : 1 }}
          className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "booking" ? copy.booking : copy.submit}
        </motion.button>

        {status === "error" && errorMsg && (
          <p className="text-sm text-red-400 text-center">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
