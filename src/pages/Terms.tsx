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
import { Helmet } from "react-helmet-async";
import {
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";

const Terms = () => {
  const [showScroll, setShowScroll] = useState(false);
  const [showAllTermDetails, setShowAllTermDetails] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const highlights = [
    "Intended for development and testing workflows.",
    "Operational limits may apply to protect platform stability.",
    "Policy terms can change as product and legal requirements evolve.",
  ];

  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: [
        {
          subtitle: "Agreement",
          text: "By accessing or using DevPortal, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our service.",
        },
        {
          subtitle: "Changes to Terms",
          text: "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Service Description",
      content: [
        {
          subtitle: "What DevPortal Does",
          text: "DevPortal provides a localhost tunneling platform made of a web dashboard, a CLI, and a server that routes external requests to your local machine for development, debugging, webhook testing, and demos.",
        },
        {
          subtitle: "Core Features",
          text: "Features may include public tunnel URLs, optional tunnel passwords, request logs and inspection tools, replay tools, support ticket submission, and temporary demo links.",
        },
        {
          subtitle: "Beta Service",
          text: "DevPortal is offered on a best-effort basis and may change at any time. Features can be added, modified, limited, or removed without prior notice.",
        },
      ],
    },
    {
      icon: Scale,
      title: "Acceptable Use Policy",
      content: [
        {
          subtitle: "Permitted Uses",
          text: "You may use DevPortal for legitimate development, testing, debugging, and demonstration purposes. This includes webhook testing, sharing local applications, and collaborating with team members.",
        },
        {
          subtitle: "Prohibited Activities",
          text: "You may NOT use DevPortal for malware distribution, phishing, spam, fraud, illegal activity, denial-of-service behavior, credential abuse, unauthorized access attempts, or any activity that violates law or third-party rights.",
        },
        {
          subtitle: "Operational Limits",
          text: "To protect service stability, limits may apply. Current implementation includes limits such as up to 3 active tunnels per IP, API request limiting, and support ticket submission limiting. These limits can change without notice.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      content: [
        {
          subtitle: "Your Responsibilities",
          text: "You are responsible for local application security, secret management, endpoint hardening, and lawful data handling. Do not expose sensitive systems or personal data unless you are authorized and properly protected.",
        },
        {
          subtitle: "Our Responsibilities",
          text: "We implement reasonable technical safeguards and operational controls. However, no service is perfectly secure and we cannot guarantee that tunnels, systems, or transmitted data will be free from interception, compromise, or downtime.",
        },
        {
          subtitle: "Data Handling",
          text: "The platform may process request metadata and payloads needed for routing, debugging, and support. Request logs are configured with a 7-day TTL in the current implementation. Support tickets and attachments are stored to provide support workflows.",
        },
      ],
    },
    {
      icon: XCircle,
      title: "Termination",
      content: [
        {
          subtitle: "By You",
          text: "You may stop using DevPortal at any time. Simply close your tunnels and clear your browser data to remove all local information.",
        },
        {
          subtitle: "By Us",
          text: "We reserve the right to suspend or terminate your access for: (1) Violation of these terms, (2) Abusive or harmful behavior, (3) Excessive resource usage, (4) Legal requirements. We will attempt to notify you before termination unless legally prohibited.",
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon suspension or termination, active tunnels may be closed, and service access may be revoked. We may retain certain records for security, abuse prevention, operational, or legal compliance reasons.",
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "Service 'As Is'",
          text: "DevPortal is provided 'as is' without warranties of any kind, express or implied. We do not guarantee that the service will be error-free, secure, or uninterrupted.",
        },
        {
          subtitle: "Limitation of Liability",
          text: "To the maximum extent permitted by law, DevPortal and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or business interruption.",
        },
        {
          subtitle: "Maximum Liability",
          text: "If liability cannot be excluded under applicable law, our aggregate liability will be limited to the greater of (a) the amount you paid us for the relevant service in the 12 months before the claim, or (b) USD 100.",
        },
        {
          subtitle: "Indemnification",
          text: "You agree to indemnify and hold harmless DevPortal from any claims, damages, or expenses arising from your use of the service or violation of these terms.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Intellectual Property",
      content: [
        {
          subtitle: "Our Content",
          text: "DevPortal's name, logo, software, documentation, and design are owned by us and protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.",
        },
        {
          subtitle: "Your Content",
          text: "You retain all rights to content transmitted through DevPortal tunnels. We do not claim ownership of your data, code, or applications.",
        },
        {
          subtitle: "License",
          text: "By using DevPortal, you grant us a limited, non-exclusive license to process and transmit your data solely as required to operate, maintain, improve, secure, and support the service.",
        },
      ],
    },
    {
      icon: Scale,
      title: "General Provisions",
      content: [
        {
          subtitle: "Governing Law",
          text: "These Terms are governed by the laws applicable in the operator's principal place of business, unless mandatory local consumer law requires otherwise.",
        },
        {
          subtitle: "Severability",
          text: "If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full effect.",
        },
        {
          subtitle: "Entire Agreement",
          text: "These Terms, together with the Privacy Policy and any published service notices, form the entire agreement between you and DevPortal regarding use of the service.",
        },
        {
          subtitle: "No Waiver",
          text: "Our failure to enforce any provision does not constitute a waiver of that provision or any other provision.",
        },
        {
          subtitle: "Updates",
          text: "We may update these Terms when the product, legal requirements, or risk profile changes. The effective date at the top of this page indicates the latest revision.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service - DevPortal</title>
        <meta
          name="description"
          content="DevPortal Terms of Service. Please read these terms carefully before using our service."
        />
        <meta
          name="keywords"
          content="DevPortal terms, terms of service, legal"
        />
        <link rel="canonical" href="https://devportal.stylnode.in/terms" />
      </Helmet>
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
              <Scale className="w-3 h-3" />
              Terms of Service
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using DevPortal. By using
              our service, you agree to these terms.
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
            <h2 className="text-sm font-semibold mb-3">Terms at a glance</h2>
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

          <div className="space-y-4">
            <section className="px-4 py-4 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex items-center gap-3 text-left mb-2">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <h3 className="font-semibold">Important Notice</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DevPortal is intended for development and testing purposes only.
                Do not use it as your sole production ingress layer, and do not
                expose sensitive systems without appropriate controls such as
                authentication, authorization, and transport security.
              </p>
            </section>

            <Accordion type="single" collapsible defaultValue="terms-details">
              <AccordionItem
                value="terms-details"
                className="px-4 bg-surface border border-border rounded-lg"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <h2 className="text-lg font-semibold">Terms Details</h2>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4">
                    {(showAllTermDetails ? sections : sections.slice(0, 1)).map(
                      (section) => (
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
                                  {item.subtitle}:{" "}
                                </span>
                                {item.text}
                              </p>
                            ))}
                          </div>
                        </section>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAllTermDetails((prev) => !prev)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {showAllTermDetails ? "Show less" : "Read more"}
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <section className="px-4 py-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
              <h2 className="text-xl font-bold text-left mb-2">
                Questions About Terms?
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                If you have questions about these terms or need clarification,
                please contact us:
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
            </section>

            <section className="px-4 py-4 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center gap-3 text-left mb-2">
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
                <h3 className="font-semibold">Acknowledgment</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using DevPortal, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service and
                our Privacy Policy.
              </p>
            </section>
          </div>
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

export default Terms;
