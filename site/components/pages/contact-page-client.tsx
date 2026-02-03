"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/lib/motion-primitives";
import { FaEnvelope, FaUser, FaBuilding, FaPaperPlane } from "react-icons/fa";
import type { LandingCopy } from "@/lib/landing-copy";

interface FormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  honeypot: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

type ContactPageCopy = LandingCopy["contactPage"];

interface ContactPageClientProps {
  copy: ContactPageCopy;
}

export function ContactPageClient({ copy }: ContactPageClientProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    honeypot: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = copy.form.validation.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = copy.form.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = copy.form.validation.emailInvalid;
    }

    if (!formData.message.trim()) {
      newErrors.message = copy.form.validation.messageRequired;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = copy.form.validation.messageMin;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (formData.honeypot) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          company: "",
          subject: "",
          message: "",
          honeypot: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {copy.title} <span className="text-secondary">{copy.titleAccent}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {copy.subtitle}
            </p>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                  {copy.form.nameLabel} *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.name ? "border-red-500" : "border-border"
                    }`}
                    placeholder={copy.form.namePlaceholder}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                  {copy.form.emailLabel} *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.email ? "border-red-500" : "border-border"
                    }`}
                    placeholder={copy.form.emailPlaceholder}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Company (optional) */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2 text-foreground">
                  {copy.form.companyLabel}
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    placeholder={copy.form.companyPlaceholder}
                  />
                </div>
              </div>

              {/* Subject (optional) */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2 text-foreground">
                  {copy.form.subjectLabel}
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  placeholder={copy.form.subjectPlaceholder}
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                  {copy.form.messageLabel} *
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none ${
                    errors.message ? "border-red-500" : "border-border"
                  }`}
                  placeholder={copy.form.messagePlaceholder}
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>

              {/* Honeypot (hidden) */}
              <input
                type="text"
                name="website"
                value={formData.honeypot}
                onChange={(e) => handleChange("honeypot", e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    {copy.form.sending}
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    {copy.form.submit}
                  </>
                )}
              </Button>

              {/* Status messages */}
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400 text-center"
                >
                  {copy.form.success}
                </motion.div>
              )}

              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center"
                >
                  {copy.form.error}
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Additional info */}
          <Reveal className="mt-12 text-center">
            <p className="text-muted-foreground">
              {copy.footerPrompt}{" "}
              <a href={`mailto:${copy.footerEmail}`} className="text-accent hover:underline">
                {copy.footerEmail}
              </a>
            </p>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  );
}
