'use client';

import { SignIn } from '@clerk/nextjs';
import { Box } from '@mui/material';

export default function SignInPage() {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SignIn 
        appearance={{ 
          baseTheme: undefined, // Remove any default theme
          variables: {
            colorPrimary: '#0f172a',
            colorText: '#1e293b',
            colorTextSecondary: '#64748b',
            colorBackground: '#ffffff',
            colorInputBackground: '#ffffff',
            colorInputText: '#1e293b',
            borderRadius: '8px', // Sharper corners
            fontFamily: 'Inter, sans-serif',
          },
          elements: { 
            rootBox: {
              width: '100%',
              maxWidth: '100%',
            },
            card: { 
              borderRadius: '8px !important', // Sharper, more angular
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15) !important', // Bolder shadow
              border: '2px solid rgba(0, 0, 0, 0.1) !important', // Bolder border
              backgroundColor: '#ffffff !important',
              padding: '32px !important', // More generous padding
            },
            headerTitle: {
              fontSize: '1.75rem !important', // Larger, bolder title
              fontWeight: '700 !important', // Bolder weight
              color: '#0f172a !important', // Darker, bolder color
              fontFamily: 'Poppins, sans-serif !important',
              letterSpacing: '-0.025em !important', // Tighter letter spacing
            },
            headerSubtitle: {
              fontSize: '1rem !important', // Larger subtitle
              color: '#374151 !important', // Darker color for better contrast
              fontFamily: 'Inter, sans-serif !important',
              fontWeight: '500 !important', // Medium weight for better readability
            },
            formButtonPrimary: {
              backgroundColor: '#0f172a !important',
              borderRadius: '6px !important', // Sharper button corners
              fontSize: '1rem !important', // Larger text
              fontWeight: '600 !important', // Bolder weight
              padding: '16px 32px !important', // Larger padding for bolder appearance
              border: 'none !important',
              color: '#ffffff !important',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.3) !important', // Bolder button shadow
              '&:hover': {
                backgroundColor: '#1e293b !important',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.4) !important', // Enhanced hover shadow
                transform: 'translateY(-1px) !important', // Subtle lift effect
              },
            },
            formFieldInput: {
              borderRadius: '6px !important', // Sharper input corners
              border: '2px solid #e2e8f0 !important', // Bolder border
              fontSize: '1rem !important', // Larger text
              padding: '16px 20px !important', // Larger padding
              backgroundColor: '#ffffff !important',
              color: '#1e293b !important',
              fontWeight: '500 !important', // Medium weight for better readability
              '&:focus': {
                borderColor: '#0f172a !important',
                borderWidth: '2px !important', // Maintain bold border on focus
                boxShadow: '0 0 0 4px rgba(15, 23, 42, 0.15) !important', // Bolder focus ring
                outline: 'none !important',
              },
            },
            dividerLine: {
              backgroundColor: '#d1d5db !important', // Darker divider
              height: '2px !important', // Bolder divider line
            },
            dividerText: {
              color: '#6b7280 !important', // Darker text
              fontSize: '1rem !important', // Larger text
              fontFamily: 'Inter, sans-serif !important',
              fontWeight: '600 !important', // Bolder weight
            },
            socialButtonsBlockButton: {
              borderRadius: '6px !important', // Sharper corners
              border: '2px solid #d1d5db !important', // Bolder border
              backgroundColor: '#ffffff !important',
              color: '#374151 !important',
              fontSize: '1rem !important', // Larger text
              fontWeight: '600 !important', // Bolder weight
              padding: '16px 32px !important', // Larger padding
              '&:hover': {
                backgroundColor: '#f9fafb !important',
                borderColor: '#9ca3af !important',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1) !important', // Hover shadow
              },
            },
            footerActionLink: {
              color: '#0f172a !important', // Darker color
              fontSize: '1rem !important', // Larger text
              fontWeight: '600 !important', // Bolder weight
              textDecoration: 'none !important',
              '&:hover': {
                color: '#1e293b !important',
                textDecoration: 'underline !important',
              },
            },
            formFieldLabel: {
              color: '#1f2937 !important', // Darker color
              fontSize: '1rem !important', // Larger text
              fontWeight: '600 !important', // Bolder weight
              fontFamily: 'Inter, sans-serif !important',
              marginBottom: '8px !important', // Better spacing
            },
            formFieldInputShowPasswordButton: {
              color: '#6b7280 !important', // Darker color
              fontSize: '1.125rem !important', // Larger icon
              '&:hover': {
                color: '#374151 !important',
              },
            },
            formFieldRow: {
              marginBottom: '24px !important', // Better spacing between fields
            },
            formButtonReset: {
              fontSize: '1rem !important', // Larger text
              fontWeight: '500 !important', // Medium weight
            },
              }
            }}
          />
    </Box>
  );
}
