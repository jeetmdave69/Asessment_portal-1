'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function SignInPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundImage: `
          linear-gradient(120deg, rgba(34,193,195,0.2) 0%, rgba(30,41,59,0.2) 100%),
          url(https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1500&q=80)
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backdropFilter: 'saturate(1.1) brightness(1.04)',
      }}
    >
      {/* Soft vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.25) 100%)',
          zIndex: 1,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          flexDirection: 'column',
        }}
      >
        <h2
          style={{
            fontWeight: 800,
            marginBottom: 10,
            fontSize: '2.3rem',
            color: '#ffffff',
            textShadow: '0 1px 10px rgba(0,0,0,0.5)',
          }}
        >
          Assessment Portal
        </h2>

        <p
          style={{
            color: '#d1d5db',
            fontWeight: 500,
            fontSize: '1.1rem',
            marginBottom: '2rem',
          }}
        >
          Your gateway to smarter testing and learning.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SignIn path="/sign-in" routing="path" />
        </motion.div>
      </motion.div>
    </div>
  );
}
