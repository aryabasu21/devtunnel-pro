import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
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
          text: "DevPortal provides a tunneling service that exposes your local development servers to the internet via secure HTTPS URLs. The service includes request logging, traffic inspection, and debugging tools.",
        },
        {
          subtitle: "Service Availability",
          text: "We strive for 58.9% uptime but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience occasional downtime.",
        },
        {
          subtitle: "Beta Service",
          text: "DevPortal is currently in beta. Features may change, and the service may experience bugs or unexpected behavior. We are not liable for any issues during the beta period.",
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
          text: "You may NOT use DevPortal for: (1) Hosting production applications or services, (2) Distributing malware, viruses, or harmful code, (3) Phishing, spam, or fraudulent activities, (4) Illegal content or activities, (5) DDoS attacks or network abuse, (6) Mining cryptocurrency, (7) Proxy or VPN services, (8) Circumventing security measures, (9) Excessive bandwidth consumption (>100GB/month), (10) Automated scraping or data harvesting.",
        },
        {
          subtitle: "Rate Limits",
          text: "We enforce rate limits to ensure fair usage: 3 active tunnels per IP address, 100 API requests per 15 minutes, and automatic 7-day log retention. Excessive usage may result in temporary throttling or account suspension.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      content: [
        {
          subtitle: "Your Responsibilities",
          text: "You are responsible for: (1) Securing your local server and applications, (2) Not exposing sensitive data through tunnels, (3) Using password protection for sensitive endpoints, (4) Complying with applicable data protection laws.",
        },
        {
          subtitle: "Our Responsibilities",
          text: "We provide: (1) HTTPS encryption for all tunnels, (2) Device-based authentication, (3) Secure data storage, (4) Regular security updates. However, we cannot guarantee absolute security and are not liable for security breaches on your local servers.",
        },
        {
          subtitle: "Data Handling",
          text: "Request logs are stored for 7 days and automatically deleted. We do not intentionally store request bodies or sensitive data, but you should assume all traffic through tunnels is visible to our systems.",
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
          text: "Upon termination, all active tunnels will be closed, and access to the dashboard will be revoked. Request logs may be retained for up to 30 days for security purposes.",
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
          text: "Our total liability for any claims arising from the use of DevPortal shall not exceed $100 USD or the amount paid by you (if any) in the past 12 months.",
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
          text: "By using DevPortal, you grant us a limited license to transmit, store, and display your data as necessary to provide the service.",
        },
      ],
    },
    {
      icon: Scale,
      title: "General Provisions",
      content: [
        {
          subtitle: "Governing Law",
          text: "These terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved in the courts of [Your Jurisdiction].",
        },
        {
          subtitle: "Severability",
          text: "If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full effect.",
        },
        {
          subtitle: "Entire Agreement",
          text: "These terms, along with our Privacy Policy, constitute the entire agreement between you and DevPortal regarding the service.",
        },
        {
          subtitle: "No Waiver",
          text: "Our failure to enforce any provision does not constitute a waiver of that provision or any other provision.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
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
              Last updated: March 18, 2026
            </p>
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12 p-6 bg-warning/10 border border-warning/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Important Notice</h3>
                <p className="text-sm text-muted-foreground">
                  DevPortal is intended for development and testing purposes
                  only. Do not use it to host production applications or expose
                  sensitive data. Always use password protection for sensitive
                  endpoints.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-surface border border-border rounded-lg p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg"
          >
            <h2 className="text-xl font-bold mb-4">Questions About Terms?</h2>
            <p className="text-base text-muted-foreground mb-4">
              If you have questions about these terms or need clarification,
              please contact us:
            </p>
            <div className="space-y-2 text-base">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:legal@devportal.dev"
                  className="text-primary hover:underline"
                >
                  legal@devportal.dev
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

          {/* Acknowledgment */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 p-6 bg-success/10 border border-success/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Acknowledgment</h3>
                <p className="text-sm text-muted-foreground">
                  By using DevPortal, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service
                  and our Privacy Policy.
                </p>
              </div>
            </div>
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

export default Terms;
