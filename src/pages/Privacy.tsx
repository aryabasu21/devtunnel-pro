import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, Database, Users, FileText } from "lucide-react";

const Privacy = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [showAllPrivacyDetails, setShowAllPrivacyDetails] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const highlights = [
    "Request logs are currently configured to auto-expire after 7 days.",
    "We do not sell your personal data.",
    "Support inquiries can be submitted anytime via /support.",
  ];

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Client Identifiers",
          text: "For CLI usage, DevPortal generates a device ID and stores it in your local CLI config directory (for example, ~/.devportal/device.json). In the web app, local browser storage may be used for non-sensitive preferences and UI state.",
        },
        {
          subtitle: "Tunnel Data",
          text: "When tunnels are created, the service processes tunnel identifiers, subdomain names, local port metadata, device identifiers, creation timestamps, optional expiry metadata (for demo links), and runtime status so requests can be routed correctly.",
        },
        {
          subtitle: "Request Logs",
          text: "The platform logs request/response data used for debugging features, including method, path, query, headers, status, duration, user-agent, IP, and request/response payload fields when available. Request logs are currently configured with a 7-day TTL.",
        },
        {
          subtitle: "Support Tickets",
          text: "When you contact support, we collect your name, email, subject, message, and any attachments you submit. This information is used to investigate issues and respond to your request.",
        },
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use collected data to operate the tunneling service, manage connections, route traffic, and provide real-time request inspection features.",
        },
        {
          subtitle: "Support & Communication",
          text: "Your contact details are used to respond to support requests and operational communications related to your request or account activity.",
        },
        {
          subtitle: "Service Improvement",
          text: "We may analyze operational signals, error patterns, and aggregate usage trends to improve reliability, performance, and product quality. We do not sell your personal data.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "Public tunnel traffic is intended to be served over HTTPS in deployed environments. Transport behavior can vary by environment (for example, local development), so you should apply appropriate safeguards for sensitive workloads.",
        },
        {
          subtitle: "Access Controls",
          text: "We use service-side controls such as tunnel registration checks, rate limiting, and optional tunnel password protection. You remain responsible for securing your local application and any exposed endpoints.",
        },
        {
          subtitle: "Data Retention",
          text: "Request logs are currently configured for automatic deletion after 7 days. Tunnel runtime metadata is removed when tunnels end. Support ticket data may be retained while needed for support, operations, security, or legal obligations.",
        },
      ],
    },
    {
      icon: Eye,
      title: "Data Sharing & Disclosure",
      content: [
        {
          subtitle: "No Third-Party Sharing",
          text: "We do not sell, rent, or share your personal information with third parties for marketing purposes.",
        },
        {
          subtitle: "Service Providers",
          text: "We use infrastructure and service providers to operate DevPortal, including hosted data and email delivery providers (for example, MongoDB-backed storage and Resend-based notification delivery).",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information if required by law, court order, or to protect our rights, property, or safety of our users.",
        },
      ],
    },
    {
      icon: Users,
      title: "Your Rights",
      content: [
        {
          subtitle: "Access & Control",
          text: "You can view all your tunnel data and request logs through the dashboard. Device IDs are stored locally and can be cleared from your browser.",
        },
        {
          subtitle: "Data Deletion",
          text: "You can close tunnels at any time and contact support for data-related requests. Some records may be retained where required for security, abuse prevention, or legal compliance.",
        },
        {
          subtitle: "Requests and Controls",
          text: "For privacy requests, corrections, or deletion inquiries, contact support. We will review and respond based on applicable law and technical feasibility.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "localStorage Only",
          text: "The web app uses browser storage for selected client-side state and preferences. The CLI stores configuration and device metadata in your local filesystem.",
        },
        {
          subtitle: "Analytics and Tracking",
          text: "We do not use this page to make guarantees about all current or future analytics tooling. If tracking or analytics practices materially change, this policy will be updated.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
              <Shield className="w-3 h-3" />
              Privacy Policy
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Privacy Matters</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DevPortal is committed to protecting your privacy. This policy
              explains what data we collect, how we use it, and your rights.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: April 4, 2026
            </p>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8 p-4 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
          >
            <h2 className="text-sm font-semibold mb-3">Privacy at a glance</h2>
            <div className="space-y-2">
              {highlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          <Accordion type="single" collapsible defaultValue="privacy-details">
            <AccordionItem
              value="privacy-details"
              className="px-4 bg-surface border border-border rounded-lg"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <h2 className="text-lg font-semibold">Privacy Details</h2>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-5">
                  {(showAllPrivacyDetails
                    ? sections
                    : sections.slice(0, 1)
                  ).map((section) => (
                    <section key={section.title} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <section.icon className="w-4 h-4 text-primary" />
                        <h3 className="text-base font-semibold">
                          {section.title}
                        </h3>
                      </div>

                      <div className="space-y-3 pl-6">
                        {section.content.map((item) => (
                          <p
                            key={item.subtitle}
                            className="text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="font-medium text-foreground">
                              {item.subtitle}:
                            </span>
                            {item.text}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowAllPrivacyDetails((prev) => !prev)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {showAllPrivacyDetails ? "Show less" : "Read more"}
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 p-5 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg"
          >
            <h2 className="text-lg font-bold mb-3">Questions About Privacy?</h2>
            <p className="text-sm text-muted-foreground mb-3">
              If you have questions about this privacy policy or how we handle
              your data, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:riju@stylnode.in"
                  className="text-primary hover:underline"
                >
                  riju@stylnode.in
                </a>
              </p>
              <p>
                <strong>Support:</strong>{" "}
                <a href="/support" className="text-primary hover:underline">
                  Submit a ticket
                </a>
              </p>
            </div>
          </motion.div>

          {/* Updates Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-6 p-4 bg-warning/10 border border-warning/30 rounded-lg"
          >
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Policy Updates
            </h3>
            <p className="text-sm text-muted-foreground">
              We may update this privacy policy from time to time. Significant
              changes will be announced through the dashboard. Continued use of
              DevPortal after changes constitutes acceptance of the updated
              policy.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
      <Footer />
    </div>
  );
};

export default Privacy;
