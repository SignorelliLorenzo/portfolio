"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import { useLandingCopyOptional } from "@/components/providers/landing-copy-provider";

export function Footer() {
  const landingCopy = useLandingCopyOptional();
  const contactCopy = landingCopy?.copy.contact;
  const footerCopy = landingCopy?.copy.footer;
  const locale = landingCopy?.locale ?? "en";
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="relative border-t border-border/30 w-full overflow-hidden">
      {/* Subtle top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="w-full px-4 sm:px-6 py-16">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 w-full">
          {/* Left: Contact Info & Social */}
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-6">{contactCopy?.title ?? "Get In Touch"}</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {contactCopy?.body ?? "Have a project in mind or want to collaborate? I typically respond within 24 hours."}
            </p>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <a
                href="mailto:signorelli.lorenzo.business@gmail.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.10] transition-colors">
                  <FaEnvelope size={18} />
                </div>
                <span>signorelli.lorenzo.business@gmail.com</span>
              </a>

              <a
                href="tel:+393355860184"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.10] transition-colors">
                  <FaPhone size={18} />
                </div>
                <span>+39 335 586 0184</span>
              </a>

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                  <FaMapMarkerAlt size={18} />
                </div>
                <span>Bergamo, Italy</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://github.com/SignorelliLorenzo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-foreground/70 hover:bg-white/[0.10] hover:text-foreground/90 transition-all duration-300"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/lorenzo-signorelli-4b3625273"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-foreground/70 hover:bg-white/[0.10] hover:text-foreground/90 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Right: Quick Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">{contactCopy?.formTitle ?? "Quick Message"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={contactCopy?.form.namePlaceholder ?? "Your Name"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/[0.12] transition-colors duration-300"
              />
              <input
                type="email"
                placeholder={contactCopy?.form.emailPlaceholder ?? "Your Email"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/[0.12] transition-colors duration-300"
              />
              <textarea
                placeholder={contactCopy?.form.messagePlaceholder ?? "Your Message"}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/[0.12] transition-colors duration-300 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-foreground/90 text-background hover:bg-foreground/80 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                    {contactCopy?.form.sending ?? "Sending..."}
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    {contactCopy?.form.submit ?? "Send Message"}
                  </>
                )}
              </button>

              {submitStatus === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-sm text-center"
                >
                  {contactCopy?.form.success ?? "Message sent successfully! I'll get back to you soon."}
                </motion.p>
              )}

              {submitStatus === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {contactCopy?.form.error ?? "Something went wrong. Please try again or email me directly."}
                </motion.p>
              )}
            </form>
          </div>
        </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-border">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lorenzo Signorelli. {footerCopy?.rights ?? "All rights reserved."}</p>
          <div className="flex gap-6">
            <Link href={`/${locale}#about`} className="hover:text-foreground transition-colors">
              {contactCopy?.bottomLinks?.about ?? "About"}
            </Link>
            <Link href={`/${locale}/projects`} className="hover:text-foreground transition-colors">
              {contactCopy?.bottomLinks?.projects ?? "Projects"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
