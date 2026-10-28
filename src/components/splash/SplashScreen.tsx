import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const videoSrc = '/assets/aistudio/Agami_logo_reveal_animation_9d3c71b7_1080p_256e8700.mp4';
  const posterSrc = '/assets/aistudio/agami_splash_poster.jpg';

  const finishSplash = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFadingOut(true);

    try {
      sessionStorage.setItem('agami_splash_shown', 'true');
    } catch {
      // Ignore storage errors in restricted iframes
    }

    setTimeout(() => {
      onComplete();
    }, 600); // Allow fade-out animation to complete
  }, [onComplete]);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        // Immediate short display for reduced-motion users
        const timer = setTimeout(() => {
          finishSplash();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }

    // Safety timeout: ensure app NEVER stays stuck even on slow networks or blocked autoplay
    const safetyTimer = setTimeout(() => {
      finishSplash();
    }, 6800);

    // Attempt video play if ready
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If autoplay fails, fallback gracefully after short delay
          setTimeout(() => {
            finishSplash();
          }, 2400);
        });
      }
    }

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [finishSplash]);

  const handleVideoEnded = () => {
    // Slight pause at the end for the final logo & tagline to be appreciated
    setTimeout(() => {
      finishSplash();
    }, 350);
  };

  const handleVideoError = () => {
    setVideoError(true);
    // If video fails to load, show static fallback for 2 seconds then continue
    setTimeout(() => {
      finishSplash();
    }, 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Agami"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#f8fafc] via-[#edf2f7] to-[#e2e8f0] overflow-hidden select-none transition-opacity duration-600 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls: Skip Button */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={finishSplash}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/70 hover:bg-white/95 backdrop-blur-md border border-slate-300/80 shadow-xs transition-all active:scale-95 cursor-pointer"
          aria-label="Skip splash screen"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full flex flex-col items-center justify-center max-w-md mx-auto px-4">
        {!videoError ? (
          <div className="relative w-full flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
              playsInline
              webkit-playsinline="true"
              autoPlay
              preload="auto"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              onLoadedData={() => setIsVideoLoaded(true)}
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-2xl drop-shadow-sm transition-opacity duration-300"
              style={{ maxHeight: 'min(82vh, 680px)' }}
            />

            {/* Subtle loading indicator if video takes a moment to load */}
            {!isVideoLoaded && (
              <div className="absolute bottom-6 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Starting Agami...</span>
              </div>
            )}
          </div>
        ) : (
          /* High-Fidelity Static Fallback if video fails to load */
          <div className="flex flex-col items-center text-center animate-fadeIn py-8">
            <div className="relative mb-6">
              <img
                src={posterSrc}
                alt="Agami Logo"
                className="w-48 h-auto object-contain rounded-2xl drop-shadow-md"
                onError={(e) => {
                  // If image fails too, hide image and rely on CSS markup
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Agami
              </h1>
            </div>

            <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">
              Plan Today. Become Tomorrow.
            </p>

            <div className="mt-8 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Loading your study roadmap...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Subtle Brand Mark */}
      <div className="absolute bottom-4 text-center pointer-events-none">
        <p className="text-[11px] text-slate-400 font-medium">
          Smart Adaptive Study Planner
        </p>
      </div>
    </div>
  );
};
