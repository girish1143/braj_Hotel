'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Destination } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  Video,
  Layers,
  MapPin,
  Eye
} from 'lucide-react';

interface DestinationVideoHeroProps {
  destination: Destination;
}

export default function DestinationVideoHero({ destination }: DestinationVideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Default fallback scenes if not specified
  const scenes = destination.videoScenes && destination.videoScenes.length > 0
    ? destination.videoScenes
    : [
        {
          id: 'scene-1',
          title: 'Sacred Evening Aarti & River Diyas',
          videoUrl: destination.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-candles-and-flowers-floating-in-a-river-at-night-42953-large.mp4',
          description: 'Earthen deepams floating along holy waters at dusk'
        },
        {
          id: 'scene-2',
          title: 'Ancient Temple Sanctum & Pillars',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traditional-temple-architecture-in-india-42939-large.mp4',
          description: 'Intricate sandstone shikhara architecture'
        },
        {
          id: 'scene-3',
          title: 'Sacred Sunrise Riverfront Ghats',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-boats-on-the-ganges-river-at-sunrise-42945-large.mp4',
          description: 'Peaceful dawn reflection on holy ghats'
        }
      ];

  const currentScene = scenes[activeSceneIndex] || scenes[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [activeSceneIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="relative bg-neutral-950 text-white overflow-hidden min-h-[480px] sm:min-h-[560px] flex items-center">
      {/* 1. Background Video Player */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Poster Image shown while video loads or as fallback */}
        <Image
          src={destination.heroImage || destination.image}
          alt={destination.name}
          fill
          priority
          className={`object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-30' : 'opacity-70'
          }`}
        />

        {/* Real MP4 Video Element */}
        <video
          ref={videoRef}
          key={currentScene.videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-90 contrast-105"
        >
          <source src={currentScene.videoUrl} type="video/mp4" />
        </video>

        {/* Atmospheric Gradient Overlays for Maximum Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.1),rgba(10,5,2,0.85))] pointer-events-none" />
      </div>

      {/* 2. Top Bar: Back Link & Video Live Badge */}
      <div className="absolute top-6 inset-x-0 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center text-xs text-amber-300 hover:text-white bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/30 transition font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Braj Home
        </Link>

        {/* Live Video Ambience Controls */}
        <div className="flex items-center space-x-2">
          {/* Live Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
            <span className="text-white font-medium">Braj Dham Video</span>
            <span className="text-neutral-400 text-[10px]">•</span>
            <span className="text-amber-400 font-bold">{currentScene.title}</span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-amber-400 text-white hover:text-amber-300 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
            title={isPlaying ? 'Pause background video' : 'Play background video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
          </button>

          {/* Mute/Unmute Button */}
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:border-amber-400 text-white hover:text-amber-300 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 3. Hero Content Center */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-black text-amber-400 bg-amber-950/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-500/40 shadow-sm">
                {destination.hindiName}
              </span>
              <span className="text-xs font-bold text-amber-200 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {destination.popularStaysCount}+ Verified Stays
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif tracking-tight text-white drop-shadow-md">
              {destination.name}
            </h1>

            <p className="text-base sm:text-xl text-amber-100/90 font-medium font-serif italic max-w-2xl leading-relaxed drop-shadow">
              {destination.tagline}
            </p>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed font-sans">
              {destination.shortOverview}
            </p>
          </div>

          {/* Spiritual Significance Glass Card */}
          <div className="bg-neutral-900/80 backdrop-blur-md p-5 rounded-3xl border border-amber-400/30 text-xs text-amber-100 max-w-xs shadow-2xl">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold mb-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sacred Significance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-300">
              {destination.spiritualSignificance}
            </p>
            <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-amber-300 font-semibold flex items-center">
              <span>Best time:</span>
              <span className="text-white ml-1.5 font-normal">{destination.bestTimeToVisit}</span>
            </div>
          </div>
        </div>

        {/* 4. Scene Switcher Tabs (Bottom Row) */}
        <div className="mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-bold flex items-center mr-1">
              <Video className="w-3.5 h-3.5 text-amber-400 mr-1" />
              Background Scene:
            </span>
            {scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-[11px] flex items-center space-x-1 ${
                  activeSceneIndex === idx
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-black'
                    : 'bg-black/50 hover:bg-black/80 text-neutral-300 border border-white/15'
                }`}
              >
                <span>{scene.title}</span>
              </button>
            ))}
          </div>

          <div className="text-[10px] text-amber-300/80 font-medium">
            HD video loop of sacred Braj Dham
          </div>
        </div>
      </div>
    </div>
  );
}
