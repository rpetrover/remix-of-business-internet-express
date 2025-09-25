import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";

const VideoSplashBanner = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handleEnded = () => {
      setShowBanner(false);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', handleEnded);

    // Auto-play video
    video.play().catch(() => {
      // If autoplay fails, show play button
      setIsPlaying(false);
    });

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skipVideo = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted={isMuted}
        playsInline
        preload="metadata"
      >
        {/* Placeholder video - replace with actual Spectrum Business video */}
        <source src="/api/placeholder/video" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Spectrum Business</h2>
            <p className="text-xl">Powering Your Business Forward</p>
          </div>
        </div>
      </video>

      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
        <div className="animate-fade-in">
          {/* Spectrum Business Logo/Text */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-scale-in">
              Spectrum
              <span className="block text-accent">Business</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 animate-fade-in" style={{animationDelay: '0.5s'}}>
              Connecting Your Business to Success
            </p>
          </div>

          {/* Animated Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 animate-fade-in" style={{animationDelay: '1s'}}>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="font-semibold">Fiber-Fast Internet</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="font-semibold">24/7 Support</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
              <span className="font-semibold">No Annual Contracts</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{animationDelay: '1.5s'}}>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 rounded-full shadow-glow hover-scale"
              onClick={skipVideo}
            >
              Explore Our Solutions
            </Button>
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-8 left-8 right-8 z-20">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20 p-2"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 p-2"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={skipVideo}
            className="text-white hover:bg-white/20 px-4 py-2"
          >
            Skip Intro
          </Button>
        </div>
      </div>

      {/* Skip Button - Top Right */}
      <Button
        variant="ghost"
        size="sm"
        onClick={skipVideo}
        className="absolute top-8 right-8 z-20 text-white hover:bg-white/20 p-2"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Animated Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating particles/dots for visual interest */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent/30 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-primary/20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
      </div>
    </div>
  );
};

export default VideoSplashBanner;