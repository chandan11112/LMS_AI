import { Link } from "react-router-dom";
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Learn<span className="gradient-text">Kro</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              AI-powered learning management system. Learn smarter, not harder with personalized quizzes and AI assistance.
            </p>
            <div className="flex gap-3 mt-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Courses", "Instructors", "Quiz Generator", "AI Assistant"].map((item) => (
                <li key={item}><Link to="/courses" className="hover:text-gray-300 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["About Us", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}><a href="#" className="hover:text-gray-300 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2024 LearnKro. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
