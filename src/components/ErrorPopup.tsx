import { Card, CardContent, Typography, Button, Box } from '@mui/material';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
  isViolation?: boolean;
  onWriteQuery?: () => void;
  onIgnore?: () => void;
}

export default function ErrorPopup({ message, onClose, isViolation = false, onWriteQuery, onIgnore }: ErrorPopupProps) {
  return (
          <Box
      position="fixed"
      top="20px"
      left="50%"
      sx={{ transform: 'translateX(-50%)' }}
      zIndex={999}
      maxWidth="500px"
      width="90%"
    >
      <Card sx={{ 
        padding: 2, 
        borderRadius: 2, 
        textAlign: 'center', 
        boxShadow: 5,
        backgroundColor: '#ffebee',
        border: '1px solid #f44336'
      }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" color="error" gutterBottom sx={{ fontSize: '16px', mb: 1 }}>
            ❌ Error
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ mb: 2, fontSize: '14px' }}>
            {message}
          </Typography>
          {isViolation ? (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={onWriteQuery} 
                size="small"
                sx={{ 
                  fontSize: '12px',
                  px: 2,
                  py: 0.5
                }}
              >
                Write Query
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={onIgnore} 
                size="small"
                sx={{ 
                  fontSize: '12px',
                  px: 2,
                  py: 0.5
                }}
              >
                Ignore
              </Button>
            </Box>
          ) : (
            <Button 
              variant="contained" 
              color="error" 
              onClick={onClose} 
              size="small"
              sx={{ 
                mt: 1,
                fontSize: '12px',
                px: 2,
                py: 0.5
              }}
            >
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
