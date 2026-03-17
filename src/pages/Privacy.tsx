import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Lock, Database, Users, FileText } from "lucide-react";

const Privacy = () => {
  const [showScroll, setShowScroll] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Device Identification",
          text: "We generate a unique device ID stored in your browser's localStorage. This ID is used to associate tunnels and settings with your device. No personal information is required or collected during this process.",
        },
        {
          subtitle: "Tunnel Data",
          text: "When you create tunnels, we store: tunnel names, local ports, creation timestamps, and connection status. This data is necessary to provide the tunneling service.",
        },
        {
          subtitle: "Request Logs",
          text: "We temporarily log HTTP requests that pass through your tunnels (method, path, headers, status codes, response times) for debugging and traffic inspection features. Logs are automatically deleted after 7 days.",
        },
        {
          subtitle: "Support Tickets",
          text: "When you contact support, we collect your name, email, message content, and any attachments you provide. This information is used solely to respond to your inquiries.",
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
          text: "Your contact information is used to respond to support requests, send service notifications, and communicate important updates about DevPortal.",
        },
        {
          subtitle: "Service Improvement",
          text: "Aggregated, anonymized usage statistics help us improve performance, reliability, and user experience. We never sell or share individual user data.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All tunnels use HTTPS with TLS encryption. Data transmitted between your local server and our edge network is encrypted in transit.",
        },
        {
          subtitle: "Access Controls",
          text: "Device-based authentication ensures only your browser can access your tunnels and logs. Optional password protection adds an extra security layer.",
        },
        {
          subtitle: "Data Retention",
          text: "Request logs are automatically deleted after 7 days. Tunnel metadata is removed when tunnels are stopped. Support tickets are retained for 1 year.",
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
          text: "We use trusted service providers (MongoDB for data storage, Gmail for email notifications) who are bound by confidentiality agreements.",
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
          text: "You can delete individual tunnels and their associated logs at any time. Contact support to request complete data deletion.",
        },
        {
          subtitle: "Opt-Out",
          text: "You can disable request logging for specific tunnels using CLI flags. Note that this limits debugging capabilities.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "localStorage Only",
          text: "We use browser localStorage to store your device ID and preferences. We do not use cookies or third-party tracking scripts.",
        },
        {
          subtitle: "No Analytics",
          text: "We do not use Google Analytics, Facebook Pixel, or any third-party analytics services that track individual users.",
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
              <Shield className="w-3 h-3" />
              Privacy Policy
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Privacy Matters</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              DevPortal is committed to protecting your privacy. This policy
              explains what data we collect, how we use it, and your rights.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: March 18, 2026
            </p>
          </div>

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
            <h2 className="text-xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-base text-muted-foreground mb-4">
              If you have questions about this privacy policy or how we handle
              your data, please contact us:
            </p>
            <div className="space-y-2 text-base">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacy@devportal.dev"
                  className="text-primary hover:underline"
                >
                  privacy@devportal.dev
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
            className="mt-8 p-6 bg-warning/10 border border-warning/30 rounded-lg"
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
