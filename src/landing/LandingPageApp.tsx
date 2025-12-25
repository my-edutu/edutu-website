import React from 'react';
import LandingPage from '../components/LandingPageV3';
import { ThemeProvider } from '../hooks/useTheme';

/**
 * Landing Page App
 * 
 * This is a standalone landing page that runs on a separate port (5174).
 * It redirects users to the main app (port 5173) when they click "Get Started".
 */
const LandingPageApp: React.FC = () => {
    const handleGetStarted = () => {
        // Redirect to the main app on port 5173
        window.location.href = 'http://localhost:5173/auth';
    };

    return (
        <ThemeProvider>
            <LandingPage onGetStarted={handleGetStarted} />
        </ThemeProvider>
    );
};

export default LandingPageApp;
