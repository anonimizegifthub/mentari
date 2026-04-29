import React from 'react';
import { StudentProfile } from '../types';

export const getProfileStyles = (profile: Partial<StudentProfile>) => {
    // DEFAULT BLUE GRADIENT
    let bgClass = "bg-gradient-to-br from-blue-600 to-indigo-700"; 
    let containerStyle: React.CSSProperties = {};
    let borderClass = "border-white/20";
    let fontClass = "";
    let animationClass = "";
    let textEffectClass = "";
    let specialEffect: React.ReactNode = null;

    const activeBg = profile.activeBackground || "";
    const activeBorder = profile.activeBorder || "";
    const activeFont = profile.activeFont || "";
    const activeEffect = profile.activeEffect || "";

    // --- BACKGROUND LOGIC ---
    if (activeBg === 'bg_space') {
        bgClass = "bg-slate-900";
        containerStyle = { backgroundImage: "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)" };
        specialEffect = React.createElement('div', { className: "absolute inset-0 overflow-hidden pointer-events-none" },
            Array.from({ length: 30 }).map((_, i) => 
                React.createElement('div', { 
                    key: i, 
                    className: "absolute rounded-full bg-white animate-pulse", 
                    style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, opacity: Math.random() * 0.7 + 0.3, animationDuration: `${Math.random() * 3 + 1}s` } 
                })
            )
        );
    } 
    else if (activeBg === 'bg_forest') {
        bgClass = "bg-emerald-900";
        containerStyle = { backgroundImage: "linear-gradient(to bottom right, #064e3b, #065f46, #022c22)" };
    }
    else if (activeBg === 'bg_library') {
        bgClass = "bg-[#2A1B0E]"; 
        containerStyle = { background: `repeating-linear-gradient(90deg, #3E2723 0px, #3E2723 20px, #4E342E 20px, #4E342E 22px), linear-gradient(#3E2723, #271a15)` };
    }
    else if (activeBg === 'bg_sky') {
        bgClass = "bg-sky-300";
        containerStyle = { backgroundImage: "linear-gradient(to top, #bae6fd, #38bdf8)" };
    }
    else if (activeBg === 'bg_sunset') {
        bgClass = "bg-orange-500";
        containerStyle = { backgroundImage: "linear-gradient(to bottom right, #f97316, #db2777, #7e22ce)" };
    }
    else if (activeBg === 'bg_matrix') {
        bgClass = "bg-black";
        containerStyle = { backgroundColor: '#000' };
        specialEffect = React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden opacity-30" },
            Array.from({ length: 15 }).map((_, i) => 
                React.createElement('div', { 
                    key: i, 
                    className: "absolute top-0 text-[10px] font-mono text-emerald-500", 
                    style: { left: `${i * 7}%`, animation: `rain ${2 + Math.random() * 3}s linear infinite`, animationDelay: `${Math.random() * 2}s` } 
                }, "1010011010111001")
            )
        );
    }
    else if (activeBg === 'bg_ocean') {
        bgClass = "bg-cyan-900";
        containerStyle = { background: "linear-gradient(to bottom, #083344, #155e75, #0891b2)" };
    }
    else if (activeBg === 'bg_ice') {
        bgClass = "bg-cyan-100";
        containerStyle = { backgroundImage: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)" };
    }
    else if (activeBg === 'bg_cyber') {
        bgClass = "bg-purple-900";
        containerStyle = { background: `radial-gradient(circle at 50% 50%, #2a0a4e 0%, #000000 100%)` };
        specialEffect = React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden" },
            React.createElement('div', { className: "absolute inset-0 opacity-20", style: { backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' } }),
            React.createElement('div', { className: "absolute top-0 left-0 w-full h-1 bg-fuchsia-500/30 animate-pulse", style: { top: '20%' } })
        );
    }
    else if (activeBg === 'bg_void') {
        bgClass = "bg-slate-950";
        containerStyle = { background: "black" };
        specialEffect = React.createElement('div', { className: "absolute inset-0 overflow-hidden pointer-events-none opacity-20" },
            React.createElement('div', { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" })
        );
    }
    else if (activeBg === 'bg_royal') {
        bgClass = "bg-red-900";
        containerStyle = { backgroundImage: "radial-gradient(circle, #7f1d1d 0%, #450a0a 100%)" };
    }
    else if (activeBg === 'bg_lava') {
        bgClass = "bg-orange-900";
        containerStyle = { backgroundImage: "radial-gradient(circle at center, #92400e 0%, #450a0a 100%)" };
    }
    else if (activeBg === 'bg_sakura') {
        bgClass = "bg-pink-100";
        containerStyle = { backgroundImage: "linear-gradient(to bottom, #fdf2f8, #fbcfe8)" };
    }
    else if (activeBg === 'bg_neural_link') {
        bgClass = "bg-slate-900";
        containerStyle = { background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)" };
        specialEffect = React.createElement('div', { className: "absolute inset-0 pointer-events-none opacity-20" },
            Array.from({ length: 8 }).map((_, i) => 
                React.createElement('div', { key: i, className: "absolute border border-blue-500/30 rounded-full animate-ping", style: { width: `${20 * i}%`, height: `${20 * i}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDuration: '3s' } })
            )
        );
    }
    else if (activeBg === 'bg_pixel_grid') {
        bgClass = "bg-indigo-950";
        containerStyle = { 
            backgroundImage: "linear-gradient(rgba(129, 140, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(129, 140, 248, 0.1) 1px, transparent 1px)", 
            backgroundSize: "40px 40px" 
        };
    }
    else if (activeBg === 'bg_circuit_board') {
        bgClass = "bg-slate-950";
        containerStyle = { 
            backgroundImage: "radial-gradient(circle at 50% 50%, #0c1b3d 0%, #020617 100%)",
            position: 'relative'
        };
        specialEffect = React.createElement('div', { className: "absolute inset-0 pointer-events-none opacity-10" },
            React.createElement('div', { className: "w-full h-full", style: { backgroundImage: 'url("https://www.transparenttextures.com/patterns/circuit-board.png")', backgroundSize: '200px' } })
        );
    }
    else if (activeBg === 'bg_data_core') {
        bgClass = "bg-indigo-950";
        containerStyle = { background: "radial-gradient(circle, #1e1b4b 0%, #020617 100%)" };
        specialEffect = React.createElement('div', { className: "absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" },
            Array.from({ length: 5 }).map((_, i) => 
                React.createElement('div', { key: i, className: "absolute border-2 border-blue-500/20 rounded-full animate-pulse", style: { width: `${i * 150}px`, height: `${i * 150}px`, animationDelay: `${i * 0.5}s` } })
            )
        );
    }
    else if (activeBg === 'bg_digital_horizon') {
        bgClass = "bg-black";
        containerStyle = { backgroundImage: "linear-gradient(to bottom, #000 0%, #0c1b3d 100%)" };
        specialEffect = React.createElement('div', { className: "absolute inset-0 pointer-events-none" },
            React.createElement('div', { className: "absolute bottom-0 w-full h-[150px]", style: { perspective: '100px' } },
                React.createElement('div', { className: "w-full h-full", style: { transform: 'rotateX(60deg)', backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' } })
            )
        );
    }
    else if (activeBg === 'bg_hacker_space') {
        bgClass = "bg-slate-950";
        containerStyle = { background: "#050505" };
        specialEffect = React.createElement('div', { className: "absolute inset-0 pointer-events-none opacity-20 overflow-hidden" },
            Array.from({ length: 12 }).map((_, i) => 
                React.createElement('div', { key: i, className: "absolute text-[7px] text-emerald-500 font-mono", style: { top: `${i * 8}%`, left: '5px', opacity: 0.8 } }, "> EXECUTING_DATA_CORE_SCAN...")
            )
        );
    }

    // --- BORDER LOGIC ---
    if (activeBorder === 'border_dashed') borderClass = "border-dashed border-slate-300";
    else if (activeBorder === 'border_nature') borderClass = "border-nature";
    else if (activeBorder === 'border_wood') borderClass = "border-wood";
    else if (activeBorder === 'border_water') borderClass = "border-water";
    else if (activeBorder === 'border_neon_pulse') borderClass = "border-neon-pulse";
    else if (activeBorder === 'border_chroma') borderClass = "border-chroma";
    else if (activeBorder === 'border_obsidian') borderClass = "border-slate-900 border-8 border-double shadow-2xl";
    else if (activeBorder === 'border_neon') borderClass = "border-glow-neon ring-4 ring-cyan-400/20";
    else if (activeBorder === 'border_gold') borderClass = "border-yellow-400 ring-4 ring-yellow-500/30 border-double border-8";
    else if (activeBorder === 'border_prism') borderClass = "border-prism";
    else if (activeBorder === 'border_data') borderClass = "border-data";
    else if (activeBorder === 'border_lava') borderClass = "border-lava";
    else if (activeBorder === 'border_diamond') borderClass = "border-diamond";
    else if (activeBorder === 'border_cyber_circuit') borderClass = "border-cyber-circuit";
    else if (activeBorder === 'border_glow_neon') borderClass = "border-glow-neon";
    else if (activeBorder === 'border_glitch_binary') borderClass = "border-glitch-binary";
    else if (activeBorder === 'border_quantum') borderClass = "border-quantum";
    else if (activeBorder === 'border_cyber_hex') borderClass = "border-cyber-hex";
    else if (activeBorder === 'border_neural_mesh') borderClass = "border-neural-mesh";

    // --- FONT LOGIC ---
    if (activeFont === 'font_comic') fontClass = "font-comic";
    else if (activeFont === 'font_elegant') fontClass = "font-elegant";
    else if (activeFont === 'font_marker') fontClass = "font-marker";
    else if (activeFont === 'font_arcade') fontClass = "font-arcade";
    else if (activeFont === 'font_heavy') fontClass = "font-heavy";
    else if (activeFont === 'font_stencil') fontClass = "font-stencil";
    else if (activeFont === 'font_retro') fontClass = "font-retro";
    else if (activeFont === 'font_vapor') fontClass = "font-vapor";
    else if (activeFont === 'font_scifi') fontClass = "font-scifi";
    else if (activeFont === 'font_binary') fontClass = "font-binary";
    else if (activeFont === 'font_liquid') fontClass = "font-liquid";

    // --- EFFECT & ANIMATION LOGIC ---
    if (activeEffect === 'anim_float') animationClass = "effect-float";
    else if (activeEffect === 'anim_wiggle') animationClass = "effect-wiggle";
    else if (activeEffect === 'effect_neon_text') textEffectClass = "drop-shadow-[0_0_10px_rgba(255,255,255,1)] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300 animate-pulse";
    else if (activeEffect === 'effect_glitch') textEffectClass = "effect-glitch-text";

    const IndependentEffect = () => {
        if (activeEffect === 'effect_fireflies') return React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden z-10" },
            Array.from({ length: 12 }).map((_, i) => 
                React.createElement('div', { key: i, className: "absolute rounded-full bg-yellow-300 blur-[3px] animate-pulse", style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: '5px', height: '5px', animationDuration: `${1 + Math.random() * 2}s` } })
            )
        );
        if (activeEffect === 'effect_confetti') return React.createElement('div', { className: "absolute inset-0 pointer-events-none opacity-50 overflow-hidden z-10" },
            Array.from({ length: 20 }).map((_, i) => 
                React.createElement('div', { key: i, className: `absolute w-2 h-2 rounded-sm animate-spin ${['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'][i%4]}`, style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `2s` } })
            )
        );
        if (activeEffect === 'effect_leaves') return React.createElement('div', { className: "absolute inset-0 pointer-events-none opacity-60 overflow-hidden z-10" },
            Array.from({ length: 15 }).map((_, i) => 
                React.createElement('i', { key: i, className: "fas fa-leaf text-orange-400 absolute text-[12px] animate-pulse", style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `${3 + Math.random() * 2}s` } })
            )
        );
        if (activeEffect === 'effect_snow') return React.createElement('div', { className: "absolute inset-0 pointer-events-none opacity-50 overflow-hidden z-10" },
            Array.from({ length: 20 }).map((_, i) => 
                React.createElement('i', { key: i, className: "fas fa-snowflake text-white absolute text-[12px] animate-bounce", style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `${2 + Math.random() * 3}s` } })
            )
        );
        if (activeEffect === 'effect_bloom') return React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden z-10" },
            Array.from({ length: 8 }).map((_, i) => 
                React.createElement('div', { key: i, className: "absolute bg-white/20 rounded-full animate-ping", style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: '100px', height: '100px', animationDuration: `${2 + Math.random() * 2}s` } })
            )
        );
        if (activeEffect === 'effect_rain') return React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden z-10" },
            Array.from({ length: 40 }).map((_, i) => 
                React.createElement('div', { key: i, className: "absolute bg-blue-300/40 w-[1px] h-[15px]", style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animation: `rain ${0.3 + Math.random()}s linear infinite` } })
            ),
            React.createElement('style', null, `@keyframes rain { 0% { transform: translateY(-100px); opacity: 1; } 100% { transform: translateY(800px); opacity: 0; } }`)
        );
        if (activeEffect === 'effect_cyber_aura') return React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden z-10" },
            React.createElement('div', { className: "absolute inset-0 border-4 border-cyan-500/20 shadow-[inset_0_0_50px_rgba(6,182,212,0.3)] animate-pulse" })
        );
        if (activeEffect === 'effect_data_flow') return React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-20" },
            Array.from({ length: 10 }).map((_, i) => 
                React.createElement('div', { key: i, className: "absolute text-[8px] font-mono text-emerald-400 whitespace-nowrap", style: { left: `${i * 10}%`, top: '-20px', animation: `rain ${1 + Math.random()}s linear infinite` } }, "DATA_STREAM_v17.0")
            )
        );
        if (activeEffect === 'effect_scanline') return React.createElement('div', { className: "absolute inset-0 pointer-events-none z-10", style: { background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' } });
        if (activeEffect === 'effect_hearts') return React.createElement('div', { className: "absolute inset-0 pointer-events-none overflow-hidden z-10" },
            Array.from({ length: 10 }).map((_, i) => 
                React.createElement('i', { key: i, className: "fas fa-heart text-pink-500 absolute text-sm animate-bounce opacity-40", style: { top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDuration: `${2 + Math.random()*2}s` } })
            )
        );
        return null;
    };

    return { bgClass, containerStyle, borderClass, fontClass, animationClass, specialEffect, textEffectClass, IndependentEffect };
};