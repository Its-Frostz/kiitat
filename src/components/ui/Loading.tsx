// 'use client';

// import React, { useEffect, useRef, useState } from 'react'
// import gsap from 'gsap'

// interface AnimationConfig {
//   theme: 'dark' | 'light'
//   startHue: number
//   endHue: number
//   duration: number
// }

// const LoadingAnimation: React.FC = () => {
//   const [isAnimating, setIsAnimating] = useState(false)
//   const [showFinalMessage, setShowFinalMessage] = useState(false)
//   const [config] = useState<AnimationConfig>({
//     theme: 'dark',
//     startHue: 0,
//     endHue: 360,
//     duration: 8000, // 8 seconds total animation
//   })

//   const itemsRef = useRef<HTMLLIElement[]>([])
//   const mainTimelineRef = useRef<gsap.core.Timeline | null>(null)
//   const containerRef = useRef<HTMLDivElement>(null)

//   const items = [
//     'design.',
//     'prototype.',
//     'solve.',
//     'build.',
//     'develop.',
//     'debug.',
//     'learn.',
//     'cook.',
//     'ship.',
//     'prompt.',
//     'collaborate.',
//     'create.',
//     'inspire.',
//     'follow.',
//     'innovate.',
//     'test.',
//     'optimize.',
//     'teach.',
//     'visualize.',
//     'transform.',
//     'scale.',
//     'do it All.',
//   ]

//   useEffect(() => {
//     // Set initial state
//     gsap.set(itemsRef.current, { opacity: 0.2 })
//     gsap.set(itemsRef.current[0], { opacity: 1 })
//     gsap.set(document.documentElement, {
//       '--hue': config.startHue,
//       '--chroma': 0,
//     })

//     return () => {
//       mainTimelineRef.current?.kill()
//     }
//   }, [config.startHue])

//   const startAnimation = () => {
//     if (isAnimating) return
//     setIsAnimating(true)

//     // Create main timeline
//     const tl = gsap.timeline({
//       onComplete: () => {
//         setShowFinalMessage(true)
//         setIsAnimating(false)
//       },
//     })

//     // Store timeline reference
//     mainTimelineRef.current = tl

//     // Animate hue change throughout entire duration
//     tl.to(document.documentElement, {
//       '--hue': config.endHue,
//       duration: config.duration / 1000,
//       ease: 'none',
//     }, 0)

//     // Animate chroma in at the beginning
//     tl.to(document.documentElement, {
//       '--chroma': 0.3,
//       duration: 0.5,
//       ease: 'power2.out',
//     }, 0.2)

//     // Create staggered animation for all items
//     const itemDuration = (config.duration / 1000) / items.length

//     items.forEach((_, index) => {
//       const startTime = index * (itemDuration * 0.8) // Slight overlap

//       if (index > 0) {
//         // Fade in current item
//         tl.to(itemsRef.current[index], {
//           opacity: 1,
//           duration: itemDuration * 0.3,
//           ease: 'power2.out',
//         }, startTime)
//       }

//       if (index < items.length - 1) {
//         // Fade out previous item
//         tl.to(itemsRef.current[index], {
//           opacity: 0.2,
//           duration: itemDuration * 0.3,
//           ease: 'power2.out',
//         }, startTime + itemDuration * 0.5)
//       }
//     })

//     // Animate chroma out near the end
//     tl.to(document.documentElement, {
//       '--chroma': 0,
//       duration: 0.5,
//       ease: 'power2.out',
//     }, (config.duration / 1000) - 1)

//     // Hide the animation container and show final message
//     tl.to(containerRef.current, {
//       opacity: 0,
//       duration: 0.5,
//       ease: 'power2.out',
//     }, (config.duration / 1000) - 0.5)
//   }

//   const resetAnimation = () => {
//     setIsAnimating(false)
//     setShowFinalMessage(false)
//     mainTimelineRef.current?.kill()

//     // Reset to initial state
//     gsap.set(itemsRef.current, { opacity: 0.2 })
//     gsap.set(itemsRef.current[0], { opacity: 1 })
//     gsap.set(document.documentElement, {
//       '--hue': config.startHue,
//       '--chroma': 0,
//     })
//     gsap.set(containerRef.current, { opacity: 1 })
//   }

//   return (
//     <>
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');

//         @property --hue {
//           initial-value: 0;
//           syntax: '<number>';
//           inherits: false;
//         }
//         @property --chroma {
//           initial-value: 0;
//           syntax: '<number>';
//           inherits: true;
//         }

//         :root {
//           --start: 0;
//           --end: 360;
//           --lightness: 75%;
//           --base-chroma: 0.3;
//         }

//         [data-theme='dark'] {
//           --lightness: 75%;
//         }
//         [data-theme='light'] {
//           --lightness: 65%;
//         }

//         .color-item {
//           color: oklch(
//             var(--lightness) 
//             var(--base-chroma)
//             calc(var(--start) + (var(--step) * var(--i)))
//           );
//         }

//         .final-text {
//           background: linear-gradient(
//             rgb(255 255 255) 50%,
//             rgb(128 128 128)
//           );
//           background-clip: text;
//           -webkit-background-clip: text;
//           color: transparent;
//         }
//       `}</style>

//       <div className="min-h-screen bg-black text-white font-[Geist] flex items-center justify-center relative overflow-hidden">
//         {/* Grid Background */}
//         <div 
//           className="fixed inset-0 opacity-10 pointer-events-none"
//           style={{
//             backgroundImage: `
//               linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
//               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
//             `,
//             backgroundSize: '45px 45px',
//             mask: 'linear-gradient(-20deg, transparent 50%, white)',
//           }}
//         />

//         {!showFinalMessage ? (
//           <div className="text-center">
//             {/* Initial Landing Text */}
//             <div className="mb-12">
//               <h1 className="text-6xl md:text-8xl font-semibold leading-tight">
//                 <span className="final-text">
//                   you can
//                   <br />
//                   do Anything.
//                 </span>
//               </h1>
//             </div>

//             {/* Animation Container */}
//             <div 
//               ref={containerRef}
//               className="mb-12"
//               style={{ 
//                 opacity: isAnimating ? 1 : 0,
//                 visibility: isAnimating ? 'visible' : 'hidden',
//                 transition: 'opacity 0.3s ease-in-out',
//               }}
//             >
//               <div className="flex items-center justify-center gap-4">
//                 <h2 className="text-4xl md:text-6xl font-semibold final-text">
//                   you can&nbsp;
//                 </h2>
//                 <ul 
//                   className="text-4xl md:text-6xl font-semibold list-none p-0 m-0"
//                   style={{ '--count': items.length } as React.CSSProperties}
//                 >
//                   {items.map((item, index) => (
//                     <li
//                       key={index}
//                       ref={(el) => {
//                         if (el) itemsRef.current[index] = el
//                       }}
//                       className="color-item absolute"
//                       style={{
//                         '--i': index,
//                         '--step': `calc((var(--end) - var(--start)) / (var(--count) - 1))`,
//                         color: `oklch(var(--lightness) var(--chroma) calc(var(--hue) + ${index * 15}deg))`,
//                       } as React.CSSProperties}
//                     >
//                       {item}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>

//             {/* Start Button */}
//             {!isAnimating && (
//               <button
//                 onClick={startAnimation}
//                 className={`px-8 py-4 text-lg font-medium bg-white/10 hover:bg-white/20 
//                   border border-white/20 hover:border-white/40 rounded-lg
//                   transition-all duration-200 ease-out
//                   backdrop-blur-sm`}
//               >
//                 Begin Journey
//               </button>
//             )}
//           </div>
//         ) : (
//           /* Final Message */
//           <div className="text-center">
//             <h2 className="text-6xl md:text-8xl font-semibold mb-8">
//               <span className="final-text">All you need is courage.</span>
//             </h2>
//             <button
//               onClick={resetAnimation}
//               className={`px-6 py-3 text-base font-medium bg-white/10 hover:bg-white/20 
//                         border border-white/20 hover:border-white/40 rounded-lg
//                         transition-all duration-200 ease-out
//                         backdrop-blur-sm`}
//             >
//               Start Over
//             </button>
//           </div>
//         )}

//         {/* Loading Indicator */}
//         {isAnimating && (
//           <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
//             <div className="flex items-center gap-2 text-white/60">
//               <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
//               <span className="text-sm">Loading your possibilities...</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

// export default LoadingAnimation
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

interface Config {
  theme: 'dark' | 'light';
  animate: boolean;
  start: number;
  end: number;
  debug: boolean;
  duration: number;
  autoPlay: boolean;
  loop: boolean;
}

interface TimelineRefs {
  masterTimeline: gsap.core.Timeline | null;
}

const TimelineAnimationComponent: React.FC = () => {
  const [config] = useState<Config>({
    theme: 'dark',
    animate: true,
    start: Math.floor(Math.random() * 101),
    end: Math.floor(Math.random() * 101) + 900,
    debug: false,
    duration: 10,
    autoPlay: true,
    loop: false,
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const timelineRefs = useRef<TimelineRefs>({
    masterTimeline: null,
  });

  const items: string[] = [
    'design.',
    'prototype.',
    'solve.',
    'build.',
    'develop.',
    'debug.',
    'learn.',
    'cook.',
    'ship.',
    'prompt.',
    'collaborate.',
    'create.',
    'inspire.',
    'follow.',
    'innovate.',
    'test.',
    'optimize.',
    'teach.',
    'visualize.',
    'transform.',
    'scale.',
    'do it All.',
  ];

  const updateDocumentProperties = useCallback(() => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.dataset.theme = config.theme;
    document.documentElement.dataset.animate = config.animate.toString();
    document.documentElement.dataset.debug = config.debug.toString();
    document.documentElement.style.setProperty('--start', config.start.toString());
    document.documentElement.style.setProperty('--hue', config.start.toString());
    document.documentElement.style.setProperty('--end', config.end.toString());

    if (!config.animate) {
      timelineRefs.current.masterTimeline?.pause();
      gsap.set(itemsRef.current.filter(Boolean), { opacity: 1 });
      gsap.set(document.documentElement, { '--chroma': 0, '--hue': config.start });
    } else {
      gsap.set(itemsRef.current.filter(Boolean), { 
        opacity: (i: number) => (i !== 0 ? 0.2 : 1) 
      });
      gsap.set(document.documentElement, { '--chroma': 0, '--hue': config.start });
    }
  }, [config]);

  const createTimeline = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Kill existing timeline
    if (timelineRefs.current.masterTimeline) {
      timelineRefs.current.masterTimeline.kill();
    }

    const validItems = itemsRef.current.filter(Boolean) as HTMLLIElement[];
    if (!validItems.length) return;

    // Create master timeline
    const masterTl = gsap.timeline({
      duration: config.duration,
      repeat: config.loop ? -1 : 0,
      onUpdate: () => {
        setProgress(masterTl.progress() * 100);
      },
      onComplete: () => {
        setIsPlaying(false);
      },
    });

    // Timeline for item opacity changes
    const dimmerTl = gsap.timeline();
    
    validItems.forEach((item, index) => {
      if (index === 0) return;
      
      const startTime = (index / validItems.length) * config.duration;
      
      dimmerTl.to(item, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      }, startTime);
      
      if (index > 0 && index < validItems.length - 1) {
        dimmerTl.to(validItems[index - 1], {
          opacity: 0.2,
          duration: 0.3,
          ease: 'power2.out',
        }, startTime);
      }
    });

    // Timeline for hue changes
    const hueTl = gsap.timeline();
    hueTl.fromTo(
      document.documentElement,
      { '--hue': config.start },
      {
        '--hue': config.end,
        duration: config.duration,
        ease: 'none',
      }
    );

    // Timeline for chroma changes
    const chromaTl = gsap.timeline();
    
    chromaTl.fromTo(
      document.documentElement,
      { '--chroma': 0 },
      {
        '--chroma': 0.3,
        duration: config.duration * 0.1,
        ease: 'power2.out',
      }
    );
    
    chromaTl.fromTo(
      document.documentElement,
      { '--chroma': 0.3 },
      {
        '--chroma': 0,
        duration: config.duration * 0.1,
        ease: 'power2.in',
      },
      config.duration * 0.9
    );

    // Add all timelines to master timeline
    masterTl.add(dimmerTl, 0);
    masterTl.add(hueTl, 0);
    masterTl.add(chromaTl, 0);

    masterTl.pause();
    
    timelineRefs.current.masterTimeline = masterTl;
  }, [config.duration, config.loop, config.start, config.end]);

  const playAnimation = useCallback(() => {
    if (timelineRefs.current.masterTimeline) {
      timelineRefs.current.masterTimeline.play();
      setIsPlaying(true);
    }
  }, []);

  const pauseAnimation = useCallback(() => {
    if (timelineRefs.current.masterTimeline) {
      timelineRefs.current.masterTimeline.pause();
      setIsPlaying(false);
    }
  }, []);

  const restartAnimation = useCallback(() => {
    if (timelineRefs.current.masterTimeline) {
      timelineRefs.current.masterTimeline.restart();
      setIsPlaying(true);
    }
  }, []);

  const seekToProgress = useCallback((progressPercent: number) => {
    if (timelineRefs.current.masterTimeline) {
      const seekTime = (progressPercent / 100) * config.duration;
      timelineRefs.current.masterTimeline.seek(seekTime);
      setProgress(progressPercent);
    }
  }, [config.duration]);

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = (clickX / rect.width) * 100;
    seekToProgress(progressPercent);
  }, [seekToProgress]);

  // Handle mounting for Next.js SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    updateDocumentProperties();
    const timeoutId = setTimeout(() => {
      createTimeline();
      if (config.autoPlay) {
        playAnimation();
      }
    }, 100);

    // capture current timeline reference to avoid ref mutation lint warning
    const currentTimeline = timelineRefs.current.masterTimeline;

    return () => {
      clearTimeout(timeoutId);
      currentTimeline?.kill();
    };
  }, [config, isMounted, updateDocumentProperties, createTimeline, playAnimation]);

  // Don't render anything on server side
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');

        @property --hue {
          initial-value: 0;
          syntax: '<number>';
          inherits: false;
        }
        @property --chroma {
          initial-value: 0;
          syntax: '<number>';
          inherits: true;
        }

        [data-debug='true'] li {
          outline: 0.05em dashed currentColor;
        }
        [data-debug='true'] :is(h2, li:last-of-type) {
          outline: 0.05em dashed canvasText;
        }

        :root {
          --start: 0;
          --end: 360;
          --lightness: 65%;
          --base-chroma: 0.3;
          --font-size-min: 14;
          --font-size-max: 20;
          --font-ratio-min: 1.1;
          --font-ratio-max: 1.33;
          --font-width-min: 375;
          --font-width-max: 1500;
        }

        [data-theme='dark'] {
          --lightness: 75%;
        }
        [data-theme='light'] {
          --lightness: 65%;
        }
        @media (prefers-color-scheme: dark) {
          --lightness: 75%;
        }

        ul {
          --step: calc((var(--end) - var(--start)) / (var(--count) - 1));
        }
        li:not(:last-of-type) {
          color: oklch(
            var(--lightness) var(--base-chroma)
              calc(var(--start) + (var(--step) * var(--i)))
          );
        }

        section:first-of-type {
          --font-level: 6;
          display: flex;
          line-height: 1.25;
          width: 100%;
          padding-left: 5rem;
        }
        section:last-of-type {
          min-height: 100vh;
          display: flex;
          place-items: center;
          width: 100%;
          justify-content: center;
        }
        section:last-of-type h2 {
          --font-level: 6;
        }
        main {
          width: 100%;
        }
        section:first-of-type h2 {
          position: sticky;
          top: calc(50% - 0.5lh);
          font-size: inherit;
          margin: 0;
          display: inline-block;
          height: fit-content;
          font-weight: 600;
        }
        ul {
          font-weight: 600;
          padding-inline: 0;
          margin: 0;
          list-style-type: none;
        }

        h2,
        li:last-of-type {
          background: linear-gradient(
            canvasText 50%,
            color-mix(in oklch, canvas, canvasText 25%)
          );
          background-clip: text;
          color: transparent;
        }

        header {
          min-height: 100vh;
          display: flex;
          place-items: center;
          width: 100%;
          padding-inline: 5rem;
        }

        h1 {
          --font-size-min: 24;
          --font-level: 8;
          text-wrap: pretty;
          line-height: 0.98;
          margin: 0;
          background: linear-gradient(
            canvasText 60%,
            color-mix(in oklch, canvas, canvasText)
          );
          background-clip: text;
          color: transparent;
        }

        html {
          color-scheme: light dark;
        }

        [data-theme='light'] {
          color-scheme: light only;
        }

        [data-theme='dark'] {
          color-scheme: dark only;
        }

        .fluid {
          --fluid-min: calc(
            var(--font-size-min) * pow(var(--font-ratio-min), var(--font-level, 0))
          );
          --fluid-max: calc(
            var(--font-size-max) * pow(var(--font-ratio-max), var(--font-level, 0))
          );
          --fluid-preferred: calc(
            (var(--fluid-max) - var(--fluid-min)) /
              (var(--font-width-max) - var(--font-width-min))
          );
          --fluid-type: clamp(
            (var(--fluid-min) / 16) * 1rem,
            ((var(--fluid-min) / 16) * 1rem) -
              (((var(--fluid-preferred) * var(--font-width-min)) / 16) * 1rem) +
              (var(--fluid-preferred) * var(--variable-unit, 100vi)),
            (var(--fluid-max) / 16) * 1rem
          );
          font-size: var(--fluid-type);
        }

        *,
        *:after,
        *:before {
          box-sizing: border-box;
        }

        body {
          display: grid;
          place-items: center;
          background: light-dark(white, black);
          min-height: 100vh;
          font-family: 'Geist', 'SF Pro Text', 'SF Pro Icons', 'AOS Icons',
            'Helvetica Neue', Helvetica, Arial, sans-serif, system-ui;
          margin: 0;
          padding: 0;
        }

        body::before {
          --size: 45px;
          --line: color-mix(in hsl, canvasText, transparent 70%);
          content: '';
          height: 100vh;
          width: 100vw;
          position: fixed;
          background: linear-gradient(
                90deg,
                var(--line) 1px,
                transparent 1px var(--size)
              )
              50% 50% / var(--size) var(--size),
            linear-gradient(var(--line) 1px, transparent 1px var(--size)) 50% 50% /
              var(--size) var(--size);
          mask: linear-gradient(-20deg, transparent 50%, white);
          top: 0;
          transform-style: flat;
          pointer-events: none;
          z-index: -1;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .controls {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          align-items: center;
          background: rgba(0, 0, 0, 0.8);
          padding: 1rem;
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
          z-index: 1000;
        }

        .controls button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          background: white;
          color: black;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .controls button:hover:not(:disabled) {
          background: #f0f0f0;
        }

        .controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }

        .progress-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          cursor: pointer;
        }

        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 2px;
          transition: width 0.1s ease;
        }
      `}</style>

      <header>
        <h1 className="fluid">
          you can
          <br />
          do Anything.
        </h1>
      </header>

      <main>
        <section className="content fluid">
          <h2>
            <span aria-hidden="true">you can&nbsp;</span>
            <span className="sr-only">you can ship things.</span>
          </h2>
          <ul aria-hidden="true" style={{ '--count': items.length } as React.CSSProperties}>
            {items.map((item, index) => (
              <li
                key={index}
                ref={(el) => {
                  itemsRef.current[index] = el;
                }}
                style={{ '--i': index } as React.CSSProperties}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="fluid">All you need is courage.</h2>
        </section>
      </main>

      <div className="controls">
        <button onClick={playAnimation} disabled={isPlaying}>
          Play
        </button>
        <button onClick={pauseAnimation} disabled={!isPlaying}>
          Pause
        </button>
        <button onClick={restartAnimation}>
          Restart
        </button>
        <div className="progress-container">
          <span>{Math.round(progress)}%</span>
          <div className="progress-bar" onClick={handleProgressBarClick}>
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TimelineAnimationComponent;
