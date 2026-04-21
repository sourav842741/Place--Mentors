import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 mt-10 lg:ml-64  transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">

        {/*  Logo + About */}
        <div>
          <h2 className="text-xl font-bold text-indigo-600">
            Practice Mentor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 transition-colors">
            AI-powered placement preparation platform.
          </p>
        </div>

        {/*  Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-indigo-600 hover:underline">Dashboard</li>
            <li onClick={() => navigate("/companies")} className="cursor-pointer hover:text-indigo-600 hover:underline">Companies</li>
            <li onClick={() => navigate("/quiz")} className="cursor-pointer hover:text-indigo-600 hover:underline">Practice</li>
            <li onClick={() => navigate("/notes")} className="cursor-pointer hover:text-indigo-600 hover:underline">Notes</li>
          </ul>
        </div>

        {/*  Resources */}
        <div>
          <h3 className="font-semibold mb-3">Resources</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li onClick={() => navigate("/resources")} className="cursor-pointer hover:text-indigo-600 hover:underline">DSA Sheet</li>
            <li onClick={() => navigate("/potd")} className="cursor-pointer hover:text-indigo-600 hover:underline">Aptitude</li>
            <li onClick={() => navigate("/quiz")} className="cursor-pointer hover:text-indigo-600 hover:underline">Interview Prep</li>
            <li onClick={() => navigate("/resume-analyzer")} className="cursor-pointer hover:text-indigo-600 hover:underline">Resume Tips</li>
          </ul>
        </div>

        {/*  Social Icons */}
        <div>
          <h3 className="font-semibold mb-3">Connect</h3>
          <div className="flex gap-4 text-gray-600 text-xl">
            <FaGithub 
              onClick={() => window.open("https://github.com", "_blank")}
              className="cursor-pointer hover:text-indigo-600 transition"
            />
            <FaLinkedin 
              onClick={() => window.open("https://linkedin.com", "_blank")}
              className="cursor-pointer hover:text-indigo-600 transition"
            />
            <FaTwitter 
              onClick={() => window.open("https://twitter.com", "_blank")}
              className="cursor-pointer hover:text-indigo-600 transition"
            />
          </div>
        </div>

      </div>

      {/*  Bottom */}
      <div className="border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Practice Mentor. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;