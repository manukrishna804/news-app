import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-4xl w-full text-center relative z-10 glass-effect p-12 rounded-3xl">
        <div className="mb-8">
          <h1 className="text-6xl font-extrabold tracking-tight mb-4">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Ecosphere</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Where news meets intelligence. Real-time global reporting powered by AI analysis and community discussion.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <a
            href="https://github.com/manukrishna804/news-app"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-all duration-200"
          >
            View Source
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-white/50 rounded-xl border border-white/50">
            <div className="text-blue-500 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <h3 className="font-bold text-gray-800">AI Analysis</h3>
            <p className="text-sm text-gray-600">Deep context and legal insights for every story.</p>
          </div>
          <div className="p-4 bg-white/50 rounded-xl border border-white/50">
            <div className="text-purple-500 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            </div>
            <h3 className="font-bold text-gray-800">Live Chat</h3>
            <p className="text-sm text-gray-600">Discuss news in real-time with verified users.</p>
          </div>
          <div className="p-4 bg-white/50 rounded-xl border border-white/50">
            <div className="text-green-500 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="font-bold text-gray-800">Global Feed</h3>
            <p className="text-sm text-gray-600">Curated, unbiased news from trusted sources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
