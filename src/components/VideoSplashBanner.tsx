import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Zap, Clock, Wrench } from "lucide-react";

const VideoSplashBanner = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);

  const scenes = [
    {
      id: 'speed',
      title: 'Blazing Fast Internet',
      subtitle: 'Speeds up to 1 Gbps for your business',
      icon: <Zap className="h-16 w-16" />,
      description: 'Power your entire team with enterprise-grade speeds',
    },
    {
      id: 'install',
      title: 'Installed in Under 24 Hours',
      subtitle: 'Same-day & next-day availability',
      icon: <Clock className="h-16 w-16" />,
      description: 'No long waits — get online when you need it',
    },
    {
      id: 'easy',
      title: 'Effortless Setup',
      subtitle: 'We handle everything for you',
      icon: <Wrench className="h-16 w-16" />,
      description: 'Professional installation with zero hassle',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentScene(prevScene => (prevScene + 1) % scenes.length);
          return 0;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, scenes.length]);

  const skipVideo = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  const currentSceneData = scenes[currentScene];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(207,99%,35%)] via-[hsl(207,99%,25%)] to-[hsl(207,100%,17%)] transition-all duration-1000">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-6 h-full gap-4 p-8">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="bg-white/20 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
          <Zap className="absolute top-1/4 left-1/4 h-8 w-8 text-white/20 animate-pulse" />
          <Clock className="absolute top-1/3 right-1/4 h-6 w-6 text-white/25 animate-pulse" style={{ animationDelay: '1s' }} />
          <Wrench className="absolute bottom-1/3 left-1/3 h-10 w-10 text-white/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
        <div className="animate-fade-in">
          <div className="mb-8">
            {/* Scene Icon */}
            <div className="flex justify-center mb-6 animate-scale-in">
              <div className="text-blue-200 transition-colors duration-1000">
                {currentSceneData.icon}
              </div>
            </div>

            {/* Brand */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                Business Internet Express
              </h1>
              <div className="h-1 w-24 bg-accent mx-auto mb-4"></div>
            </div>

            {/* Scene Title */}
            <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in transition-all duration-500">
              {currentSceneData.title}
            </h2>

            <p className="text-xl md:text-2xl text-white/90 mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {currentSceneData.subtitle}
            </p>

            <p className="text-lg text-blue-200 mb-8 animate-fade-in transition-colors duration-500" style={{ animationDelay: '0.4s' }}>
              {currentSceneData.description}
            </p>
          </div>

          {/* Scene Indicators */}
          <div className="flex justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {scenes.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  index === currentScene ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 rounded-full shadow-glow hover-scale transition-all duration-300"
              onClick={skipVideo}
            >
              Find Internet for Your Business
            </Button>
          </div>
        </div>
      </div>

      {/* Skip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={skipVideo}
        className="absolute top-8 right-8 z-20 text-white hover:bg-white/20 p-2"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Floating dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-300/40 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-blue-200/30 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-blue-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
};

export default VideoSplashBanner;
