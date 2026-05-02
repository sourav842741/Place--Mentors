import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FaUserTie, FaBriefcase, FaFileUpload, FaMicrophoneAlt, FaChartLine } from 'react-icons/fa';
import { useState } from 'react';
import api from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import Footer from './Footer';
import { trackEvent } from '../hooks/useAnalytics';

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [mode, setMode] = useState('Technical');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);

    const formdata = new FormData();
    formdata.append('resume', resumeFile);

    try {
      const result = await api.post('/api/interview/resume', formdata, {
        withCredentials: true,
      });

      setRole(result.data.role || '');
      setExperience(result.data.experience || '');
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || '');
      setAnalysisDone(true);
    } catch (error) {
      console.log(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);

    try {
      const result = await api.post('/api/interview/generate-questions', {
        role,
        experience,
        mode,
        resumeText,
        projects,
        skills,
      });

      trackEvent('quiz_started');
      trackEvent('ai_interview_used', { mode });

      onStart(result.data);
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex items-center justify-center px-4
      bg-gray-50 dark:bg-gray-950
      transition-colors duration-300"
      >
        <div
          className="w-full max-w-6xl
        bg-white dark:bg-gray-900
        rounded-3xl shadow-2xl
        grid md:grid-cols-2 overflow-hidden
        border border-gray-200 dark:border-white/10"
        >
          {/* LEFT SIDE */}
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="relative p-12 flex flex-col justify-center
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-white/10"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Start Your AI Interview
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-10">
              Practice real interview scenarios powered by AI. Improve communication, technical
              skills, and confidence.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: <FaUserTie className="text-blue-600 dark:text-blue-400 text-xl" />,
                  text: 'Choose Role & Experience',
                },
                {
                  icon: <FaMicrophoneAlt className="text-blue-600 dark:text-blue-400 text-xl" />,
                  text: 'Smart Voice Interview',
                },
                {
                  icon: <FaChartLine className="text-blue-600 dark:text-blue-400 text-xl" />,
                  text: 'Performance Analytics',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center space-x-4
                bg-gray-50 dark:bg-gray-800
                p-4 rounded-xl shadow-sm cursor-pointer
                border border-gray-200 dark:border-white/10
                hover:shadow-md transition-all duration-300"
                >
                  {item.icon}
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="p-12 bg-white dark:bg-gray-900 transition-colors duration-300"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Interview Setup
            </h2>

            <div className="space-y-6">
              {/* ROLE */}
              <div className="relative">
                <FaUserTie className="absolute top-4 left-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-12 pr-4 py-3
                border border-gray-300 dark:border-white/10
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-white
                rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              {/* EXPERIENCE */}
              <div className="relative">
                <FaBriefcase className="absolute top-4 left-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Experience (e.g. 2 years)"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full pl-12 pr-4 py-3
                border border-gray-300 dark:border-white/10
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-white
                rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              {/* MODE */}
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full py-3 px-4
              border border-gray-300 dark:border-white/10
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
              </select>

              {/* RESUME UPLOAD */}
              {!analysisDone && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => document.getElementById('resumeUpload').click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700
                rounded-xl p-8 text-center cursor-pointer
                hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800
                transition-all duration-300"
                >
                  <FaFileUpload className="text-4xl mx-auto text-blue-600 dark:text-blue-400 mb-3" />

                  <input
                    type="file"
                    accept="application/pdf"
                    id="resumeUpload"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />

                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {resumeFile ? resumeFile.name : 'Click to upload resume (Optional)'}
                  </p>

                  {resumeFile && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadResume();
                      }}
                      className="mt-4 bg-blue-600 hover:bg-blue-700
                    text-white px-5 py-2 rounded-lg transition"
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* ANALYSIS */}
              {analysisDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-white/10
                rounded-xl p-5 space-y-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Resume Analysis Result
                  </h3>

                  {projects.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">Projects:</p>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {projects.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">Skills:</p>

                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-700
                          dark:bg-blue-900/30 dark:text-blue-400
                          px-3 py-1 rounded-full text-sm"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* START */}
              <motion.button
                onClick={handleStart}
                disabled={!role || !experience || loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="w-full
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-700 hover:to-indigo-700
              text-white py-3 rounded-full text-lg font-semibold
              transition-all duration-300 shadow-md hover:shadow-xl
              disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting...' : 'Start Interview'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default Step1SetUp;
