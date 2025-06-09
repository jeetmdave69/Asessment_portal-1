'use client';

import { Card, Typography, Box, Stack, Button } from '@mui/material';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type AppWelcomeProps = {
  title?: string;
  description?: string;
  img?: string; // Optional custom background image
  showCreateQuizButton?: boolean;
  createQuizAction?: () => void; // Optional custom action for create quiz
};

export default function AppWelcome({
  title,
  description,
  img = '/assets/images/background-4.jpg',
  showCreateQuizButton = false,
  createQuizAction,
}: AppWelcomeProps) {
  const { user } = useUser();
  const router = useRouter();

  const defaultCreateQuiz = useCallback(() => {
    router.push('/create-quiz');
  }, [router]);

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        px: { xs: 3, sm: 4 },
        py: { xs: 4, sm: 5 },
        boxShadow: 6,
        minHeight: 200,
        width: '100%',
        ml: 0,
        cursor: 'default',
        backgroundColor: 'grey.900',
        color: 'white',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url("${img}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.9,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Foreground Content */}
      <Stack
        spacing={2}
        sx={{
          position: 'relative',
          zIndex: 2,
          textShadow: '0 1px 3px rgba(0,0,0,0.7)',
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
        >
          {title || `Welcome back, ${user?.firstName || 'User'} 👋`}
        </Typography>

        <Typography variant="body2" sx={{ maxWidth: 600 }}>
          {description ||
            'Create, manage, and analyze assessments seamlessly with your personal dashboard.'}
        </Typography>

        {showCreateQuizButton && (
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={createQuizAction || defaultCreateQuiz}
            disableElevation
            sx={{
              width: 'fit-content',
              px: 3,
              py: 1,
              mt: 1,
              fontWeight: 'bold',
              borderRadius: 2,
              zIndex: 2,
            }}
          >
            Create Quiz
          </Button>
        )}
      </Stack>
    </Card>
  );
}
