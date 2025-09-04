'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

// Import Inter font
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const defaultInstructions = [
  "You cannot refresh, close the tab, or navigate away during the exam.",
  "You cannot communicate with others or use unauthorized materials.",
  "Switching tabs may be detected and could auto-submit your exam.",
  "Time starts immediately after clicking Start. Ensure stable internet and power.",
  "All answers are automatically saved as you progress.",
  "You can review and change answers before final submission.",
  "The timer will show remaining time in the top-right corner.",
  "Submit your exam before the time expires to avoid penalties.",
];

// Wrapper component to handle Suspense for useParams
function PreExamWrapper() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    }>
      <PreExamPage />
    </Suspense>
  );
}

export default PreExamWrapper;

function PreExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { client } = useClerk();
  const quizId = params?.quizId as string;

  const [quizDetails, setQuizDetails] = useState<any>(null);
  const [teacherInfo, setTeacherInfo] = useState<any>(null);
  const [questionStats, setQuestionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReadInstructions, setHasReadInstructions] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);

  // Function to fetch teacher info from Clerk
  const fetchTeacherFromClerk = async (userId: string) => {
    try {
      console.log('Fetching teacher from Clerk with ID:', userId);
      
      // Try to get user info from Clerk using the API
      const response = await fetch(`/api/users/${userId}`);
      
      if (response.ok) {
        const teacherData = await response.json();
        const teacherInfo = {
          full_name: teacherData.fullName || teacherData.firstName || 'Quiz Creator',
          email: teacherData.email || 'creator@quiz.com'
        };
        console.log('Found teacher from Clerk API:', teacherInfo);
        return teacherInfo;
      } else {
        console.log('Clerk API failed, trying alternative method');
      }
    } catch (error) {
      console.log('Error fetching from Clerk:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!quizId || !user) return;
    fetchQuizDetails();
  }, [quizId, user]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (quizError || !quizData) {
        setError('Quiz not found or access denied.');
        return;
      }

      setQuizDetails(quizData);
      
             // Debug: Log available fields
       console.log('Quiz data fields:', Object.keys(quizData));
       console.log('Duration field:', quizData.duration, quizData.duration_minutes);
       console.log('Creator ID:', quizData.creator_id);
       console.log('User ID:', quizData.user_id);
       console.log('Full quiz data:', quizData);
       
       // Check for any fields that might contain teacher info
       const possibleTeacherFields = ['teacher_name', 'instructor', 'author', 'created_by', 'owner'];
       possibleTeacherFields.forEach(field => {
         if (quizData[field]) {
           console.log(`Found potential teacher field '${field}':`, quizData[field]);
         }
       });

             // Try multiple approaches to get teacher info
       let teacherData = null;
       console.log('Starting teacher lookup...');
       
               // First, try to get from the quiz data itself if it has user info
        if (quizData.user_id) {
          console.log('Trying user_id from quizzes table:', quizData.user_id);
          
          // Check if the current user is the quiz creator
          if (user && user.id === quizData.user_id) {
            // Current user is the quiz creator
            teacherData = {
              full_name: user.fullName || user.firstName || 'Quiz Creator',
              email: user.emailAddresses?.[0]?.emailAddress || 'creator@quiz.com'
            };
            console.log('Current user is quiz creator:', teacherData);
          } else {
            // Try to get teacher info from Clerk using our function
            teacherData = await fetchTeacherFromClerk(quizData.user_id);
            
            if (!teacherData) {
              console.log('Clerk lookup failed, trying fallback methods');
            }
          }
          
          // If still no teacher data, try users table as fallback
          if (!teacherData) {
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', quizData.user_id)
                .single();
              
              if (userError) {
                console.log('Error fetching from users table with user_id:', userError);
              } else if (userData) {
                // Check what fields are actually available
                console.log('Users table data:', userData);
                const availableFields = Object.keys(userData);
                console.log('Available fields in users table:', availableFields);
                
                // Try to find name-related fields
                const nameField = availableFields.find(field => 
                  field.includes('name') || field.includes('Name') || field.includes('NAME')
                );
                
                if (nameField) {
                  teacherData = {
                    full_name: userData[nameField] || 'Quiz Creator',
                    email: userData.email || userData.email_address || 'creator@quiz.com'
                  };
                  console.log(`Found teacher from users table using field '${nameField}':`, teacherData);
                }
              }
            } catch (dbError) {
              console.log('Database error:', dbError);
            }
          }
        }
       
       // If not found, try creator_id
       if (!teacherData && quizData.creator_id) {
         console.log('Trying creator_id:', quizData.creator_id);
         const { data: userData, error: userError } = await supabase
           .from('users')
           .select('full_name, email')
           .eq('id', quizData.creator_id)
           .single();
         
         if (userError) {
           console.log('Error fetching from users table with creator_id:', userError);
         } else if (userData) {
           teacherData = userData;
           console.log('Found teacher from creator_id:', userData);
         }
       }
       
       // Try teacher table as fallback
       if (!teacherData && quizData.creator_id) {
         console.log('Trying teacher table with creator_id:', quizData.creator_id);
         const { data: teacherTableData, error: teacherError } = await supabase
           .from('teacher')
           .select('full_name, email')
           .eq('id', quizData.creator_id)
           .single();
         
         if (teacherError) {
           console.log('Error fetching from teacher table:', teacherError);
         } else if (teacherTableData) {
           teacherData = teacherTableData;
           console.log('Found teacher from teacher table:', teacherTableData);
         }
       }
       
       // Try to get from auth.users as final fallback
       if (!teacherData) {
         console.log('Trying auth.users as fallback...');
         try {
           const { data: authUserData, error: authError } = await supabase.auth.getUser();
           if (authError) {
             console.log('Auth error:', authError);
           } else if (authUserData.user) {
             teacherData = {
               full_name: authUserData.user.user_metadata?.full_name || 
                         authUserData.user.user_metadata?.name ||
                         authUserData.user.email?.split('@')[0] ||
                         'Quiz Creator',
               email: authUserData.user.email
             };
             console.log('Found teacher from auth:', teacherData);
           }
         } catch (authError) {
           console.log('Auth error:', authError);
         }
       }
       
               // Try to get from the current logged-in user if still no teacher found
        if (!teacherData && user) {
          console.log('Trying current user as fallback...');
          
          // Check if current user is the quiz creator
          if (user.id === quizData.user_id) {
            teacherData = {
              full_name: user.fullName || user.firstName || 'Quiz Creator',
              email: user.emailAddresses?.[0]?.emailAddress || 'creator@quiz.com'
            };
            console.log('Current user is quiz creator:', teacherData);
          } else {
            // Use current user as fallback teacher name
            teacherData = {
              full_name: user.fullName || user.firstName || 'Quiz Creator',
              email: user.emailAddresses?.[0]?.emailAddress || 'creator@quiz.com'
            };
            console.log('Using current user as fallback teacher:', teacherData);
          }
        }
       

       
       // Check for direct teacher fields in quiz data
       if (!teacherData) {
         const directTeacherFields = ['teacher_name', 'instructor', 'author', 'created_by', 'owner'];
         for (const field of directTeacherFields) {
           if (quizData[field]) {
             console.log(`Using direct teacher field '${field}':`, quizData[field]);
             teacherData = {
               full_name: quizData[field],
               email: `${quizData[field].toLowerCase().replace(/\s+/g, '.')}@quiz.com`
             };
             break;
           }
         }
       }
       
       // If still no teacher found, try to extract from quiz title or description
       if (!teacherData && quizData.quiz_title) {
         console.log('Trying to extract teacher name from quiz title...');
         // Look for patterns like "Quiz by [Name]", "[Name]'s Quiz", or "Created by [Name]"
         const titlePatterns = [
           /(?:by|from|by\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
           /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'s\s+Quiz/i,
           /Created\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
         ];
         
         for (const pattern of titlePatterns) {
           const match = quizData.quiz_title.match(pattern);
           if (match) {
             teacherData = {
               full_name: match[1],
               email: `${match[1].toLowerCase().replace(/\s+/g, '.')}@quiz.com`
             };
             console.log('Extracted teacher name from title pattern:', teacherData);
             break;
           }
         }
       }
       
               if (teacherData) {
          setTeacherInfo(teacherData);
          console.log('Final teacher info set:', teacherData);
        } else {
          // For testing - let's see what we can extract
          console.log('=== TEACHER LOOKUP FAILED ===');
          console.log('Quiz User ID:', quizData.user_id);
          console.log('Current User ID:', user?.id);
          console.log('Quiz Title:', quizData.quiz_title);
          console.log('Quiz Description:', quizData.description);
          

          
          // Try to extract from quiz title as last resort
          if (!teacherData && quizData.quiz_title && quizData.quiz_title !== 'QUIZJEET') {
            // Look for patterns like "Quiz by [Name]" or "[Name]'s Quiz"
            const titlePatterns = [
              /(?:by|from|by\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
              /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'s\s+Quiz/i,
              /Created\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
              /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i  // Just look for any capitalized name
            ];
            
            for (const pattern of titlePatterns) {
              const match = quizData.quiz_title.match(pattern);
              if (match && match[1] && match[1].length > 2) {
                teacherData = {
                  full_name: match[1],
                  email: `${match[1].toLowerCase().replace(/\s+/g, '.')}@quiz.com`
                };
                console.log('Extracted from quiz title pattern:', teacherData);
                break;
              }
            }
            
            // If no pattern matched, try simple extraction
            if (!teacherData) {
              const extractedName = quizData.quiz_title.replace('QUIZJEET', '').trim();
              if (extractedName && extractedName.length > 2) {
                teacherData = {
                  full_name: extractedName,
                  email: 'extracted@quiz.com'
                };
                console.log('Extracted from quiz title (simple):', teacherData);
              }
            }
          }
          
          // If still no teacher found, try to get from quiz description
          if (!teacherData && quizData.description) {
            console.log('Trying to extract teacher name from quiz description...');
            const descPatterns = [
              /(?:by|from|by\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
              /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'s\s+Quiz/i,
              /Created\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
            ];
            
            for (const pattern of descPatterns) {
              const match = quizData.description.match(pattern);
              if (match && match[1] && match[1].length > 2) {
                teacherData = {
                  full_name: match[1],
                  email: `${match[1].toLowerCase().replace(/\s+/g, '.')}@quiz.com`
                };
                console.log('Extracted from quiz description:', teacherData);
                break;
              }
            }
          }
          
          // Set a default teacher name
          const defaultTeacher = { full_name: 'Quiz Creator', email: 'creator@quiz.com' };
          setTeacherInfo(teacherData || defaultTeacher);
          console.log('Final teacher info (with fallback):', teacherData || defaultTeacher);
        }

      const { data: questionsData } = await supabase
        .from('questions')
        .select('marks')
        .eq('quiz_id', quizId);

      if (questionsData) {
        const totalQuestions = questionsData.length;
        const totalScore = questionsData.reduce((sum, q) => sum + (q.marks || 0), 0);
        setQuestionStats({ total_questions: totalQuestions, total_score: totalScore });
      }

    } catch (err) {
      console.error('Error fetching quiz details:', err);
      setError('Failed to load quiz details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!hasReadInstructions || isStarting) return;
    
    setIsStarting(true);
    
    // Navigate after a brief loading state
    setTimeout(() => {
      router.push(`/attempt-quiz/${quizId}`);
    }, 1000); // Simple 1 second loading
  };

  const handleGoBack = () => {
    // Prevent multiple clicks
    if (isGoingBack) return;
    
    // Set loading state for visual feedback
    setIsGoingBack(true);
    
    // Add a smooth transition delay before navigation
    setTimeout(() => {
    router.push('/dashboard/student');
    }, 500); // 500ms for smooth transition with animation
  };

  // Early return if no quizId
  if (!quizId) {
    return (
      <div 
        className={inter.className} 
        style={{
          ...styles.container,
          ...(isGoingBack && {
            opacity: 0.7,
            transform: 'scale(0.98)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          })
        }}
      >
        <div style={styles.card}>
          <div style={styles.errorContainer}>
            <h2 style={styles.errorTitle}>Invalid Quiz</h2>
            <p style={styles.errorMessage}>Quiz ID not found.</p>
            <button 
              style={{
                ...styles.primaryButton,
                ...(isGoingBack ? styles.goingBackButton : {})
              }} 
              onClick={handleGoBack}
              disabled={isGoingBack}
            >
              {isGoingBack ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <span style={styles.loadingText}>Going Back...</span>
                </div>
              ) : (
                'GO BACK'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={inter.className} style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading quiz details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quizDetails) {
    return (
      <div 
        className={inter.className} 
        style={{
          ...styles.container,
          ...(isGoingBack && {
            opacity: 0.7,
            transform: 'scale(0.98)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          })
        }}
      >
        <div style={styles.card}>
          <div style={styles.errorContainer}>
            <h2 style={styles.errorTitle}>Error</h2>
            <p style={styles.errorMessage}>{error || 'Quiz not found'}</p>
            <button 
              style={{
                ...styles.primaryButton,
                ...(isGoingBack ? styles.goingBackButton : {})
              }} 
              onClick={handleGoBack}
              disabled={isGoingBack}
            >
              {isGoingBack ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <span style={styles.loadingText}>Going Back...</span>
                </div>
              ) : (
                'GO BACK'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExamStarted = new Date() >= new Date(quizDetails.start_time);
  const isExamEnded = new Date() >= new Date(quizDetails.end_time);

  if (!isExamStarted) {
    return (
      <div 
        className={inter.className} 
        style={{
          ...styles.container,
          ...(isGoingBack && {
            opacity: 0.7,
            transform: 'scale(0.98)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          })
        }}
      >
        <div style={styles.card}>
          <div style={styles.warningContainer}>
            <h2 style={styles.warningTitle}>Exam Not Started</h2>
            <p style={styles.warningMessage}>
              This exam has not started yet. It will begin at {dayjs(quizDetails.start_time).format('MMMM DD, YYYY [at] h:mm A')}.
            </p>
            <button 
              style={{
                ...styles.primaryButton,
                ...(isGoingBack ? styles.goingBackButton : {})
              }} 
              onClick={handleGoBack}
              disabled={isGoingBack}
            >
              {isGoingBack ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <span style={styles.loadingText}>Going Back...</span>
                </div>
              ) : (
                'GO BACK'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isExamEnded) {
    return (
      <div 
        className={inter.className} 
        style={{
          ...styles.container,
          ...(isGoingBack && {
            opacity: 0.7,
            transform: 'scale(0.98)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          })
        }}
      >
        <div style={styles.card}>
          <div style={styles.errorContainer}>
            <h2 style={styles.errorTitle}>Exam Ended</h2>
            <p style={styles.errorMessage}>
              This exam has ended at {dayjs(quizDetails.end_time).format('MMMM DD, YYYY [at] h:mm A')}.
            </p>
            <button 
              style={{
                ...styles.primaryButton,
                ...(isGoingBack ? styles.goingBackButton : {})
              }} 
              onClick={handleGoBack}
              disabled={isGoingBack}
            >
              {isGoingBack ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <span style={styles.loadingText}>Going Back...</span>
                </div>
              ) : (
                'GO BACK'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={inter.className} 
      style={{
        ...styles.container,
        ...(isGoingBack && {
          opacity: 0.7,
          transform: 'scale(0.98)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        })
      }}
    >
      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <h3 style={styles.quizTitle}>{quizDetails.quiz_title}</h3>
          <h1 style={styles.mainTitle}>INSTRUCTIONS & RULES</h1>
        </div>

        {/* Main Content Section */}
        <div style={styles.mainContent}>
          {/* Quiz Details Grid */}
          <div style={styles.detailsSection}>
            <h2 style={styles.sectionTitle}>Quiz Details</h2>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <div style={styles.iconContainer}>
                  <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div style={styles.detailContent}>
                  <label style={styles.detailLabel}>Student Name</label>
                  <span style={styles.detailValue}>{user?.fullName || user?.firstName || 'Student'}</span>
                </div>
              </div>

              

              <div style={styles.detailItem}>
                <div style={styles.iconContainer}>
                  <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                                 <div style={styles.detailContent}>
                   <label style={styles.detailLabel}>Duration</label>
                   <span style={styles.detailValue}>
                     {quizDetails.duration_minutes || quizDetails.duration || 'Not specified'} minutes
                   </span>
                 </div>
              </div>

              <div style={styles.detailItem}>
                <div style={styles.iconContainer}>
                  <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H1l8-8v8z"/>
                    <path d="M23 11h-8v8l8-8z"/>
                  </svg>
                </div>
                <div style={styles.detailContent}>
                  <label style={styles.detailLabel}>Total Questions</label>
                  <span style={styles.detailValue}>{questionStats?.total_questions || 'Loading...'}</span>
                </div>
              </div>

              <div style={styles.detailItem}>
                <div style={styles.iconContainer}>
                  <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <div style={styles.detailContent}>
                  <label style={styles.detailLabel}>Total Score</label>
                  <span style={styles.detailValue}>{questionStats?.total_score || 'Loading...'} marks</span>
                </div>
              </div>

              <div style={styles.detailItem}>
                <div style={styles.iconContainer}>
                  <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                                 <div style={styles.detailContent}>
                   <label style={styles.detailLabel}>Passing Criteria</label>
                   <span style={styles.detailValue}>
                     {quizDetails.pass_marks || quizDetails.passing_score || 'Not specified'} marks
                   </span>
                 </div>
              </div>
            </div>
          </div>

          {/* Exam Rules Section */}
          <div style={styles.rulesSection}>
            <h2 style={styles.sectionTitle}>Exam Rules</h2>
            
            {/* Warning Alert */}
            <div style={styles.alertBox}>
              <div style={styles.alertIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={styles.alertContent}>
                <strong>Important:</strong> Read all rules carefully before proceeding
              </div>
            </div>

            {/* Rules List */}
            <div style={styles.rulesList}>
              {defaultInstructions.map((instruction, index) => (
                <div key={index} style={styles.ruleItem}>
                  <div style={styles.ruleDot}></div>
                  <span style={styles.ruleText}>{instruction}</span>
                </div>
              ))}
            </div>

            {/* Exam Description */}
            {quizDetails.description && (
              <div style={styles.descriptionSection}>
                <h3 style={styles.subsectionTitle}>Exam Description</h3>
                <p style={styles.descriptionText}>{quizDetails.description}</p>
              </div>
            )}

            {/* Time Information */}
            <div style={styles.timeSection}>
              <h3 style={styles.subsectionTitle}>Time Information</h3>
              <div style={styles.timeGrid}>
                <div style={styles.timeItem}>
                  <label style={styles.timeLabel}>Start Time</label>
                  <span style={styles.timeValue}>
                    {dayjs(quizDetails.start_time).format('MMMM DD, YYYY [at] h:mm A')}
                  </span>
                </div>
                <div style={styles.timeItem}>
                  <label style={styles.timeLabel}>End Time</label>
                  <span style={styles.timeValue}>
                    {dayjs(quizDetails.end_time).format('MMMM DD, YYYY [at] h:mm A')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div style={styles.footer}>
          <div style={styles.checkboxContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={hasReadInstructions}
                onChange={(e) => setHasReadInstructions(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>
                I have read and understood all the instructions above
              </span>
            </label>
          </div>
          
          <div style={styles.buttonContainer}>
            <button 
              style={{
                ...styles.secondaryButton,
                ...(isGoingBack ? styles.goingBackButton : {})
              }} 
              onClick={handleGoBack}
              disabled={isGoingBack}
            >
              {isGoingBack ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <span style={styles.loadingText}>Going Back...</span>
                </div>
              ) : (
                'GO BACK'
              )}
            </button>
            <button 
              style={{
                ...styles.primaryButton,
                ...(hasReadInstructions && !isStarting ? {} : styles.disabledButton),
                ...(isStarting ? styles.startingButton : {})
              }}
              onClick={handleStartExam}
              disabled={!hasReadInstructions || isStarting}
            >
              {isStarting ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner}></div>
                  <span style={styles.loadingText}>Starting Exam...</span>
                </div>
              ) : (
                'START EXAM'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '32px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '60px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '1000px',
    width: '100%',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  header: {
    textAlign: 'center' as const,
    padding: '40px 60px 30px 60px',
    borderBottom: '3px solid #1e40af',
    backgroundColor: '#ffffff',
    position: 'relative' as const,
  },
  quizTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    margin: '0 0 16px 0',
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: '-0.5px',
    margin: '0',
    lineHeight: '1.2',
  },
  mainContent: {
    padding: '60px',
  },
  detailsSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0',
    paddingBottom: '12px',
    borderBottom: '2px solid #1e40af',
    position: 'relative' as const,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '28px',
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    transition: 'background-color 0.2s ease',
  },
  iconContainer: {
    width: '44px',
    height: '44px',
    backgroundColor: '#1e40af',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    flexShrink: 0,
  },
  icon: {
    width: '20px',
    height: '20px',
    color: '#ffffff',
    strokeWidth: '2',
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  rulesSection: {
    marginBottom: '0',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  alertIcon: {
    width: '20px',
    height: '20px',
    color: '#dc2626',
    marginRight: '12px',
    flexShrink: 0,
  },
  alertContent: {
    fontSize: '14px',
    color: '#991b1b',
    fontWeight: '500',
  },
  rulesList: {
    marginBottom: '32px',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '12px',
    padding: '8px 0',
  },
  ruleDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#1e40af',
    borderRadius: '50%',
    marginTop: '8px',
    marginRight: '16px',
    flexShrink: 0,
  },
  ruleText: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    flex: 1,
    fontWeight: '400',
  },
  descriptionSection: {
    marginBottom: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
  },
  descriptionText: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0',
  },
  timeSection: {
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  timeItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  timeLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  timeValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  footer: {
    backgroundColor: '#f8fafc',
    padding: '40px 60px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '24px',
  },
  checkboxContainer: {
    flex: '1',
    minWidth: '300px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '16px',
    accentColor: '#007AFF',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  checkboxText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    flexShrink: 0,
  },
  primaryButton: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    padding: '16px 32px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  goingBackButton: {
    backgroundColor: '#f1f5f9',
    color: '#6b7280',
    border: '2px solid #9ca3af',
    cursor: 'not-allowed',
    transform: 'scale(0.98)',
    opacity: 0.8,
  },
  startingButton: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
    cursor: 'not-allowed',
    transform: 'scale(0.98)',
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '15px',
    fontWeight: '700',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #007AFF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    textAlign: 'center' as const,
    padding: '60px 40px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#dc2626',
    margin: '0 0 16px 0',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  warningContainer: {
    textAlign: 'center' as const,
    padding: '60px 40px',
  },
  warningTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#d97706',
    margin: '0 0 16px 0',
  },
  warningMessage: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
};

// Add CSS keyframes for animations
const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes bounceIn {
    0% { 
      transform: scale(0.3);
      opacity: 0;
    }
    50% { 
      transform: scale(1.1);
      opacity: 1;
    }
    100% { 
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
`;

// Inject CSS keyframes and styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = keyframes + `
    
    .detailItem:hover {
      background-color: #f8fafc !important;
    }
    
    .primaryButton:hover {
      background-color: #0056b3 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 122, 255, 0.3) !important;
    }
    
    .secondaryButton:hover {
      background-color: #f1f5f9 !important;
      border-color: #9ca3af !important;
      transform: translateY(-2px) translateZ(0);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .secondaryButton:active {
      transform: translateY(0px) translateZ(0);
      transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .checkbox:hover {
      transform: scale(1.1);
    }
    
    @media (max-width: 768px) {
      .container { padding: 16px; padding-top: 20px; }
      .card { margin: 0; }
      .header { padding: 24px 24px 16px 24px; }
      .mainContent { padding: 24px; }
      .footer { padding: 20px 24px; flex-direction: column; align-items: stretch; }
      .buttonContainer { justify-content: stretch; }
      .buttonContainer button { flex: 1; }
      .detailsGrid { grid-template-columns: 1fr; }
      .timeGrid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(styleSheet);
}
