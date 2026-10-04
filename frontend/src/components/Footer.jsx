import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-surface border-t border-border mt-12 lg:ml-64 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        {/* Logo + About */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-primary tracking-tight">Place Mentor</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            AI-powered placement preparation platform helping students succeed in tech interviews.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-text mb-3 text-sm">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-text-muted">
            <li
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Dashboard
            </li>

            <li
              onClick={() => navigate("/companies")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Companies
            </li>

            <li
              onClick={() => navigate("/quiz")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Practice
            </li>

            <li
              onClick={() => navigate("/notes")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Notes
            </li>

            <li
              onClick={() => navigate("/privacy-policy")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Privacy Policy
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold text-text mb-3 text-sm">Resources</h3>
          <ul className="space-y-2.5 text-sm text-text-muted">
            <li
              onClick={() => navigate("/resources")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              DSA Sheet
            </li>

            <li
              onClick={() => navigate("/potd")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Problem of the Day
            </li>

            <li
              onClick={() => navigate("/quiz")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Interview Prep
            </li>

            <li
              onClick={() => navigate("/resume-analyzer")}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              Resume Tools
            </li>
          </ul>
        </div>

        {/* Social Icons */}
        <div>
          <h3 className="font-semibold text-text mb-3 text-sm">Connect</h3>
          <div className="flex gap-4 text-text-subtle text-lg">
            <button
              onClick={() => window.open("https://github.com", "_blank")}
              aria-label="GitHub"
              className="cursor-pointer hover:text-primary transition-colors"
            >
              <FaGithub />
            </button>

            <button
              onClick={() => window.open("https://linkedin.com", "_blank")}
              aria-label="LinkedIn"
              className="cursor-pointer hover:text-primary transition-colors"
            >
              <FaLinkedin />
            </button>

            <button
              onClick={() => window.open("https://twitter.com", "_blank")}
              aria-label="Twitter"
              className="cursor-pointer hover:text-primary transition-colors"
            >
              <FaTwitter />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border py-4 text-center text-xs text-text-subtle">
        © {new Date().getFullYear()} Place Mentor. All rights reserved. Built for student success.
      </div>
    </footer>
  );
};

export default Footer;
