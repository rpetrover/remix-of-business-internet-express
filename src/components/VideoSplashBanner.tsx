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

  // Define business scenes
  const scenes = [
    {
      id: 'internet',
      title: 'Fast, Reliable Internet',
      subtitle: 'Powering productive workspaces',
      icon: <Wifi className="h-16 w-16" />,
      description: 'Teams collaborating seamlessly with fiber-fast internet',
      bgGradient: 'from-blue-600 via-blue-700 to-blue-900',
      accentColor: 'text-blue-200'
    },
    {
      id: 'phone',
      title: 'Professional Phone Service',
      subtitle: 'Clear communication, every call',
      icon: <Phone className="h-16 w-16" />,
      description: 'Business calls handled with premium voice features',
      bgGradient: 'from-green-600 via-green-700 to-green-900',
      accentColor: 'text-green-200'
    },
    {
      id: 'tv',
      title: 'Business TV Solutions',
      subtitle: 'Engaging customers and employees',
      icon: <Tv className="h-16 w-16" />,
      description: 'Bars and restaurants keeping customers entertained',
      bgGradient: 'from-purple-600 via-purple-700 to-purple-900',
      accentColor: 'text-purple-200'
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
        return prev + 2; // Adjust speed as needed
      });
    }, 200); // Update every 200ms

    return () => clearInterval(interval);
  }, [isPlaying, scenes.length]);

  // Auto-close banner after all scenes
  useEffect(() => {
    if (currentScene === 0 && progress === 0) {
      const timer = setTimeout(() => {
        if (currentScene === scenes.length - 1 && progress >= 100) {
          setShowBanner(false);
        }
      }, 15000); // Auto-close after 15 seconds total

      return () => clearTimeout(timer);
    }
  }, [currentScene, progress, scenes.length]);

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
      {/* Dynamic Background with Scene-Based Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSceneData.bgGradient} transition-all duration-1000`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Internet Scene Background */}
          {currentScene === 0 && (
            <div className="absolute inset-0 animate-fade-in">
              {/* Office Grid Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-6 h-full gap-4 p-8">
                  {Array.from({length: 48}).map((_, i) => (
                    <div key={i} className="bg-white/20 rounded animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
              </div>
              {/* Floating connectivity icons */}
              <Wifi className="absolute top-1/4 left-1/4 h-8 w-8 text-white/30 animate-pulse" />
              <Building2 className="absolute top-1/3 right-1/4 h-6 w-6 text-white/40 animate-pulse" style={{animationDelay: '1s'}} />
              <Users className="absolute bottom-1/3 left-1/3 h-10 w-10 text-white/25 animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
          )}

          {/* Phone Scene Background */}
          {currentScene === 1 && (
            <div className="absolute inset-0 animate-fade-in">
              {/* Communication Wave Pattern */}
              <div className="absolute inset-0">
                {Array.from({length: 5}).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full border-2 border-white/20 animate-pulse"
                    style={{
                      width: `${(i + 1) * 200}px`,
                      height: `${(i + 1) * 200}px`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
              {/* Floating phone icons */}
              <Phone className="absolute top-1/4 right-1/4 h-6 w-6 text-white/40 animate-pulse" />
              <Users className="absolute bottom-1/4 left-1/4 h-8 w-8 text-white/30 animate-pulse" style={{animationDelay: '0.7s'}} />
            </div>
          )}

          {/* TV Scene Background */}
          {currentScene === 2 && (
            <div className="absolute inset-0 animate-fade-in">
              {/* Entertainment Grid */}
              <div className="absolute inset-0 opacity-15">
                <div className="grid grid-cols-6 grid-rows-4 h-full gap-6 p-12">
                  {Array.from({length: 24}).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-white/30 rounded-lg animate-pulse border border-white/20" 
                      style={{animationDelay: `${i * 0.15}s`}} 
                    />
                  ))}
                </div>
              </div>
              {/* Floating TV/entertainment icons */}
              <Tv className="absolute top-1/3 left-1/4 h-10 w-10 text-white/35 animate-pulse" />
              <Coffee className="absolute bottom-1/4 right-1/3 h-6 w-6 text-white/40 animate-pulse" style={{animationDelay: '0.8s'}} />
              <Users className="absolute top-2/3 right-1/4 h-8 w-8 text-white/30 animate-pulse" style={{animationDelay: '0.4s'}} />
            </div>
          )}
        </div>
      </div>

      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-black/40" />

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
            <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in transition-all duration-1000">
              {currentSceneData.title}
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              {currentSceneData.subtitle}
            </p>
            
            <p className={`text-lg ${currentSceneData.accentColor} mb-8 animate-fade-in transition-colors duration-1000`} style={{animationDelay: '0.6s'}}>
              {currentSceneData.description}
            </p>
          </div>

          {/* Scene Indicators */}
          <div className="flex justify-center gap-3 mb-8 animate-fade-in" style={{animationDelay: '0.9s'}}>
            {scenes.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-500 ${
                  index === currentScene ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{animationDelay: '1.2s'}}>
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