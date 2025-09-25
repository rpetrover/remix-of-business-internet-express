import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, X, Wifi, Phone, Tv, Users, Building2, Coffee } from "lucide-react";

const VideoSplashBanner = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Define business scenes with video sources
  const scenes = [
    {
      id: 'internet',
      title: 'Fast, Reliable Internet',
      subtitle: 'Powering productive workspaces',
      icon: <Wifi className="h-16 w-16" />,
      description: 'Teams collaborating seamlessly with fiber-fast internet',
      bgGradient: 'from-blue-600 via-blue-700 to-blue-900',
      accentColor: 'text-blue-200',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-businesswoman-working-on-a-laptop-in-an-office-4970-large.mp4'
    },
    {
      id: 'phone',
      title: 'Professional Phone Service',
      subtitle: 'Clear communication, every call',
      icon: <Phone className="h-16 w-16" />,
      description: 'Business calls handled with premium voice features',
      bgGradient: 'from-green-600 via-green-700 to-green-900',
      accentColor: 'text-green-200',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-business-meeting-in-an-office-4990-large.mp4'
    },
    {
      id: 'tv',
      title: 'Business TV Solutions',
      subtitle: 'Engaging customers and employees',
      icon: <Tv className="h-16 w-16" />,
      description: 'Bars and restaurants keeping customers entertained',
      bgGradient: 'from-purple-600 via-purple-700 to-purple-900',
      accentColor: 'text-purple-200',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-customers-at-a-bar-watching-tv-4998-large.mp4'
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentScene(prevScene => (prevScene + 1) % scenes.length);
          return 0;
        }
        return prev + 5; // 5% every 100ms = 100% in 2000ms (2 seconds)
      });
    }, 100); // Update every 100ms for smooth progress

    return () => clearInterval(interval);
  }, [isPlaying, scenes.length]);

  // Auto-close banner after all scenes - 6 seconds total (3 scenes * 2 seconds each)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 6000); // 6 seconds total (3 panes * 2 seconds each)

    return () => clearTimeout(timer);
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipVideo = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const currentSceneData = scenes[currentScene];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background for Each Scene */}
      <div className="absolute inset-0">
        {scenes.map((scene, index) => (
          <video
            key={scene.id}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentScene ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={scene.videoSrc} type="video/mp4" />
            {/* Fallback gradient background */}
            <div className={`w-full h-full bg-gradient-to-br ${scene.bgGradient}`} />
          </video>
        ))}
      </div>

      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
        <div className="animate-fade-in">
          {/* Dynamic Scene Content */}
          <div className="mb-8">
            {/* Scene Icon with Animation */}
            <div className="flex justify-center mb-6 animate-scale-in">
              <div className={`${currentSceneData.accentColor} transition-colors duration-1000`}>
                {currentSceneData.icon}
              </div>
            </div>

            {/* Spectrum Business Brand */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                Spectrum Business
              </h1>
              <div className="h-1 w-24 bg-accent mx-auto mb-4"></div>
            </div>

            {/* Dynamic Scene Title */}
            <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in transition-all duration-500">
              {currentSceneData.title}
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              {currentSceneData.subtitle}
            </p>
            
            <p className={`text-lg ${currentSceneData.accentColor} mb-8 animate-fade-in transition-colors duration-500`} style={{animationDelay: '0.4s'}}>
              {currentSceneData.description}
            </p>
          </div>

          {/* Scene Indicators */}
          <div className="flex justify-center gap-3 mb-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
            {scenes.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  index === currentScene ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{animationDelay: '0.8s'}}>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 rounded-full shadow-glow hover-scale transition-all duration-300"
              onClick={skipVideo}
            >
              Explore {currentSceneData.title}
            </Button>
          </div>
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

      {/* Active Business Scenarios Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dynamic floating elements based on current scene */}
        {currentScene === 0 && (
          <>
            {/* Internet connectivity visualization */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-300/40 rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400/50 rounded-full animate-pulse" style={{animationDelay: '0.7s'}} />
            <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-blue-200/30 rounded-full animate-pulse" style={{animationDelay: '1.2s'}} />
            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-blue-500/40 rounded-full animate-pulse" style={{animationDelay: '0.3s'}} />
          </>
        )}
        
        {currentScene === 1 && (
          <>
            {/* Phone communication visualization */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-300/40 rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-400/50 rounded-full animate-pulse" style={{animationDelay: '0.8s'}} />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-200/30 rounded-full animate-pulse" style={{animationDelay: '1.4s'}} />
            <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-green-500/40 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
          </>
        )}
        
        {currentScene === 2 && (
          <>
            {/* TV entertainment visualization */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-300/40 rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400/50 rounded-full animate-pulse" style={{animationDelay: '0.9s'}} />
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-200/30 rounded-full animate-pulse" style={{animationDelay: '1.6s'}} />
            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-purple-500/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
          </>
        )}
      </div>
    </div>
  );
};

export default VideoSplashBanner;