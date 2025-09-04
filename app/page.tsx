'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const animationRef = useRef<number>();
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Aurora Background Animation
    const shapesEl = document.querySelectorAll('.aurora-shape');
    const shapes = Array.from(shapesEl).map(el => {
      return {
        el: el as HTMLElement,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: parseInt(window.getComputedStyle(el).width, 10)
      };
    });

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    function animate() {
      animationRef.current = requestAnimationFrame(animate);

      shapes.forEach(shape => {
        shape.x += shape.vx;
        shape.y += shape.vy;

        if ((shape.x - shape.size / 2 < 0 && shape.vx < 0) || (shape.x + shape.size / 2 > window.innerWidth && shape.vx > 0)) {
          shape.vx *= -1;
        }
        if ((shape.y - shape.size / 2 < 0 && shape.vy < 0) || (shape.y + shape.size / 2 > window.innerHeight && shape.vy > 0)) {
          shape.vy *= -1;
        }
        
        const dx = mouse.x - shape.x;
        const dy = mouse.y - shape.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 350) { 
          const angle = Math.atan2(dy, dx);
          shape.vx += Math.cos(angle) * 0.02;
          shape.vy += Math.sin(angle) * 0.02;
        }
        
        shape.vx *= 0.995;
        shape.vy *= 0.995;
        
        shape.el.style.top = '0';
        shape.el.style.left = '0';
        shape.el.style.bottom = 'auto';
        shape.el.style.right = 'auto';
        
        shape.el.style.transform = `translate(${shape.x - shape.size / 2}px, ${shape.y - shape.size / 2}px)`;
      });
    }

    // Header scroll effect
    const handleScroll = () => {
      const header = document.getElementById('header');
      if (header) {
        if (window.scrollY > 10) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    // Start animation with a small delay
    setTimeout(animate, 0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogin = () => {
    router.push('/sign-in');
  };

  const handleGetStarted = () => {
    router.push('/sign-in');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const email = emailInput.value;
    
    if (email) {
      // Here you would typically send the email to your backend
      // For now, we'll show a success message
      setToastMessage('Thank you for subscribing! We\'ll send updates to your email address.');
      setShowToast(true);
      emailInput.value = ''; // Clear the form
      
      // Auto-hide toast after 4 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }
  };

  // Prevent flash of unstyled content
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = '#060818';
      document.body.style.color = '#e0e0e0';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }
  }, []);

  if (!mounted) {
  return (
      <div style={{
        backgroundColor: '#060818',
        color: '#e0e0e0',
        minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* --- CSS Variables and Reset --- */
        :root {
          --color-bg: #060818;
          --color-text-primary: #e0e0e0;
          --color-text-secondary: #a5b4fc;
          --color-text-muted: #d1d5db;
          --color-indigo-light: #a5b4fc;
          --color-purple-light: #d8b4fe;
          --color-indigo-400: #818cf8;
          --color-indigo-500: #6366f1;
          --color-purple-500: #8b5cf6;
          --color-pink-500: #ec4899;
          --card-bg: rgba(255, 255, 255, 0.05);
          --card-border: rgba(255, 255, 255, 0.1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--color-bg);
          color: var(--color-text-primary);
          overflow-x: hidden;
          position: relative;
        }

        .container {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        /* --- Background Animation --- */
        #aurora-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .aurora-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.2;
        }

        .shape1 {
          width: 600px;
          height: 600px;
          background: #4f46e5;
        }

        .shape2 {
          width: 500px;
          height: 500px;
          background: #7c3aed;
        }
        
        .shape3 {
          width: 400px;
          height: 400px;
          background: #db2777;
        }
        
        .content-wrapper {
          position: relative;
          z-index: 10;
        }

        /* --- Header --- */
        .header {
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 50;
          padding: 0.125rem 1rem;
          transition: all 0.3s ease-in-out;
        }
        
        .header-scrolled {
          background: rgba(6, 8, 24, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--card-border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .header nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
        }

        .logo img {
           width: 7rem;
           height: 7rem;
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
        
        .login-btn {
          border: 1px solid var(--color-indigo-500);
          color: var(--color-text-secondary);
          font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 0.5rem;
          transition: all 0.3s;
          text-decoration: none;
          font-size: 0.875rem;
          background: none;
          cursor: pointer;
        }
        
        .login-btn:hover {
          background-color: var(--color-indigo-500);
          color: white;
        }

        /* --- Hero Section --- */
        .hero-section {
          padding-top: 10rem;
          padding-bottom: 7rem;
          text-align: center;
        }

        .hero-section .main-heading {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        
        .brand-gradient {
          background: linear-gradient(90deg, var(--color-indigo-light), var(--color-purple-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        
        .hero-section .sub-heading {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          margin-bottom: 2rem;
          font-weight: 300;
        }

        .hero-section .hero-paragraph {
          max-width: 48rem;
          margin-left: auto;
          margin-right: auto;
          color: var(--color-text-muted);
          font-size: 1.125rem;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .btn-primary {
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
          color: white;
          font-weight: 700;
          padding: 1rem 3rem;
          border-radius: 9999px;
          font-size: 1.125rem;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
          border: 1px solid transparent;
          display: inline-block;
          cursor: pointer;
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        /* --- General Section Styling --- */
        .section {
          padding-top: 6rem;
          padding-bottom: 6rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
        }

        .section-subtitle {
          color: var(--color-text-secondary);
          margin-top: 1rem;
          max-width: 42rem;
          margin-left: auto;
          margin-right: auto;
          font-size: 1.125rem;
          line-height: 1.6;
        }

        /* --- Glass Cards --- */
        .glass-card {
          background: var(--card-bg);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid var(--card-border);
          border-radius: 1.25rem;
          transition: all 0.4s ease;
          padding: 2rem;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        /* --- Features Grid --- */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 2rem;
        }

        .feature-card {
          text-align: center;
        }

        .feature-card .icon-wrapper {
          margin-bottom: 1.25rem;
          display: inline-block;
          padding: 1rem;
          background-color: rgba(99, 102, 241, 0.1);
          border-radius: 9999px;
        }
        
        .feature-card .icon-wrapper svg {
          width: 2rem;
          height: 2rem;
          color: var(--color-indigo-400);
        }
        
        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: var(--color-text-muted);
          line-height: 1.6;
        }

        /* --- Unique Features Section --- */
        .unique-features-grid {
             display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 2rem;
            align-items: center;
        }
        
        .unique-features-grid .glass-card {
          padding: 2.5rem;
        }

        .unique-features-grid h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }
        
        .unique-features-grid p {
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .feature-list {
          list-style: none;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          color: var(--color-text-primary);
        }
        
        .feature-list li:last-child {
          margin-bottom: 0;
        }

        .feature-list svg {
          width: 1.25rem;
          height: 1.25rem;
          color: var(--color-indigo-400);
          margin-right: 0.75rem;
        }

        /* --- Testimonials --- */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 2rem;
        }

        .testimonial-card p:first-child {
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
          font-style: italic;
          line-height: 1.6;
        }

        .testimonial-card .user-info {
          display: flex;
          align-items: center;
        }

        .testimonial-card .avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          margin-right: 1rem;
          font-size: 1.125rem;
        }

        .avatar.bg-indigo { background-color: var(--color-indigo-500); }
        .avatar.bg-purple { background-color: var(--color-purple-500); }
        .avatar.bg-pink { background-color: var(--color-pink-500); }

        .testimonial-card .user-details h4 {
          font-weight: 700;
          color: white;
        }

        .testimonial-card .user-details p {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        
        /* --- Newsletter --- */
        #newsletter .glass-card {
          max-width: 48rem;
          margin-left: auto;
          margin-right: auto;
          text-align: center;
          padding: 2rem;
        }

        #newsletter h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
        }
        
        #newsletter p {
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          max-width: 28rem;
          margin: auto;
        }
        
        .newsletter-form input {
          width: 100%;
          background-color: rgba(17, 24, 39, 0.5);
          border: 1px solid #4b5563;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: white;
          transition: all 0.3s;
          margin-bottom: 0.75rem;
        }
        
        .newsletter-form input:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--color-indigo-400);
        }
        
        .newsletter-form button {
          width: 100%;
        }

        /* --- Footer --- */
        .footer {
          padding-top: 2.5rem;
          padding-bottom: 2.5rem;
          border-top: 1px solid var(--card-border);
          text-align: center;
          color: #9ca3af;
        }
        
        .footer h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }

        .footer p {
          font-size: 0.875rem;
        }

        /* --- Toast Notification --- */
        .toast {
          position: fixed;
          top: 2rem;
          right: 2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
          z-index: 1000;
          transform: translateX(100%);
          transition: transform 0.3s ease-in-out;
          max-width: 400px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .toast.show {
          transform: translateX(0);
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .toast-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        .toast-message {
          font-weight: 500;
          line-height: 1.4;
        }

        /* --- Media Queries for Responsiveness --- */
        @media (min-width: 640px) {
          .container {
            max-width: 640px;
          }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          #newsletter .glass-card { padding: 3rem; }
          .newsletter-form {
            flex-direction: row;
          }
          .newsletter-form input {
            width: 66.66%;
            margin-bottom: 0;
            margin-right: 0.75rem;
          }
          .newsletter-form button { width: auto; }
        }

        @media (min-width: 768px) {
          .container {
            max-width: 768px;
          }
          .hero-section .main-heading { font-size: 4.5rem; }
          .hero-section .sub-heading { font-size: 1.5rem; }
          .section-title { font-size: 3rem; }
        }

        @media (min-width: 1024px) {
          .container {
            max-width: 1024px;
          }
          .features-grid { grid-template-columns: repeat(3, 1fr); }
          .unique-features-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 1280px) {
          .container {
            max-width: 1280px;
          }
        }
      `}</style>

      <div id="aurora-background">
        <div className="aurora-shape shape1"></div>
        <div className="aurora-shape shape2"></div>
        <div className="aurora-shape shape3"></div>
      </div>
      
      <div className="content-wrapper">
      {/* Header */}
        <header id="header" className="header">
          <nav className="container">
            <div className="logo">
                <img 
                  src="/Logo.svg" 
                  alt="OctoMind Logo" 
                  style={{ 
                    height: '7rem', 
                    filter: 'brightness(0) invert(1)' // Make it white for dark background
                  }} 
                />
            </div>
            <button onClick={handleLogin} className="login-btn">Login</button>
          </nav>
        </header>

        {/* Hero Section */}
        <main>
          <section className="hero-section container">
            <h1 className="main-heading">
              <span className="brand-gradient">OctoMind</span> By F13 Technologies
            </h1>
            <h2 className="sub-heading">India's AI-Based Assessment Platform</h2>
            <p className="hero-paragraph">
              Transform your learning experience with intelligent, personalized assessments. Experience the future of education with our cutting-edge AI that adapts to every student's unique learning style.
            </p>
            <button onClick={handleGetStarted} className="btn-primary">
                        Get Started
            </button>
          </section>
        </main>

        {/* Why Choose Us Section */}
        <section id="why-choose-us" className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose Our Platform?</h2>
              <p className="section-subtitle">Discover the features that make OctoMind the pinnacle of modern learning and assessment technology.</p>
            </div>
            <div className="features-grid">
              {/* Feature 1 */}
              <div className="glass-card feature-card">
                <div className="icon-wrapper">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.98 0l2.01 2.01"/></svg>
                </div>
                <h3>AI-Powered Learning</h3>
                <p>Advanced artificial intelligence that adapts to your learning style and pace.</p>
              </div>
              {/* Feature 2 */}
              <div className="glass-card feature-card">
                   <div className="icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>
                  </div>
                  <h3>Real-time Analytics</h3>
                  <p>Comprehensive insights into your performance and progress tracking.</p>
              </div>
              {/* Feature 3 */}
              <div className="glass-card feature-card">
                   <div className="icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                  </div>
                  <h3>Interactive Assessments</h3>
                  <p>Engaging quizzes and tests that make learning enjoyable and effective.</p>
              </div>
              {/* Feature 4 */}
              <div className="glass-card feature-card">
                   <div className="icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <h3>Smart Evaluation</h3>
                  <p>Intelligent evaluation system that provides detailed feedback and recommendations.</p>
              </div>
               {/* Feature 5 */}
              <div className="glass-card feature-card">
                   <div className="icon-wrapper">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  </div>
                  <h3>Progress Tracking</h3>
                  <p>Track your learning journey with detailed progress reports and milestones.</p>
              </div>
               {/* Feature 6 */}
              <div className="glass-card feature-card">
                   <div className="icon-wrapper">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                  </div>
                  <h3>Personalized Experience</h3>
                  <p>Tailored learning experience that adapts to your individual needs and preferences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Features Section */}
        <section id="unique-features" className="section">
          <div className="container">
                 <div className="section-header">
                    <h2 className="section-title">Unique Features</h2>
                    <p className="section-subtitle">Cutting-edge technology that sets us apart from the competition.</p>
                </div>
                <div className="unique-features-grid">
                    <div className="glass-card">
                        <h3>AI-Powered Insights</h3>
                        <p>Our advanced AI system analyzes student performance patterns in real-time, providing personalized insights and recommendations for improvement.</p>
                        <ul className="feature-list">
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Performance Analytics</li>
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Learning Patterns</li>
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Predictive Insights</li>
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Personalized Recommendations</li>
                        </ul>
                    </div>
                     <div className="glass-card">
                        <h3>Highly Secure Anti-Cheating Interface</h3>
                        <p>Advanced security measures including facial recognition, screen monitoring, and AI-powered behavior analysis to ensure exam integrity.</p>
                        <ul className="feature-list">
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Facial Recognition</li>
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Screen Monitoring</li>
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Behavior Analysis</li>
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Real-time Alerts</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="section">
            <div className="container">
                <h2 className="section-title section-header">What Our Users Say</h2>
                <div className="testimonials-grid">
                    {/* Testimonial 1 */}
                    <div className="glass-card testimonial-card">
                        <p>"The OctoMind AI-powered assessment system has completely transformed how I study and prepare for exams. The personalized feedback is incredible!"</p>
                        <div className="user-info">
                            <div className="avatar bg-indigo">SJ</div>
                            <div className="user-details">
                                <h4>Sarah Johnson</h4>
                                <p>Student</p>
                            </div>
                        </div>
                    </div>
                    {/* Testimonial 2 */}
                    <div className="glass-card testimonial-card">
                        <p>"As an educator, I love how this platform adapts to each student's learning pace and style. It's revolutionized my teaching approach."</p>
                        <div className="user-info">
                            <div className="avatar bg-purple">MC</div>
                            <div className="user-details">
                                <h4>Dr. Michael Chen</h4>
                                <p>Professor</p>
                            </div>
                        </div>
                    </div>
                    {/* Testimonial 3 */}
                    <div className="glass-card testimonial-card">
                        <p>"The personalized feedback and analytics help me understand exactly where I need to improve. It's like having a personal tutor!"</p>
                        <div className="user-info">
                            <div className="avatar bg-pink">ER</div>
                            <div className="user-details">
                                <h4>Emily Rodriguez</h4>
                                <p>Student</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Newsletter Section */}
        <section id="newsletter" className="section">
            <div className="container">
                <div className="glass-card">
                    <h2>Stay Updated</h2>
                    <p>Subscribe to our newsletter for the latest updates and educational insights.</p>
                    <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                        <input type="email" placeholder="Enter your email" required />
                        <button type="submit" className="btn-primary">Subscribe</button>
                    </form>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="footer">
            <div className="container">
                <h3>OctoMind By F13 Technologies</h3>
                <p>&copy; 2024 OctoMind. All rights reserved.</p>
            </div>
        </footer>

        {/* Toast Notification */}
        {showToast && (
          <div className={`toast ${showToast ? 'show' : ''}`}>
            <div className="toast-content">
              <svg className="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <div className="toast-message">{toastMessage}</div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}