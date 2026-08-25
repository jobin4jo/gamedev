import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  type: 'petal' | 'confetti' | 'sparkle' | 'ribbon';
  vx: number;
  vy: number;
  angle: number;
  angularSpeed: number;
  size: number;
  opacity: number;
}

@Component({
  selector: 'app-ribbon-cutting',
  templateUrl: './ribbon-cutting.component.html',
  styleUrls: ['./ribbon-cutting.component.scss']
})
export class RibbonCuttingComponent implements OnInit, OnDestroy {
  @ViewChild('celebrationCanvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;

  // Inauguration State
  isCutting: boolean = false;
  isCut: boolean = false;
  showCelebration: boolean = false;
  isMuted: boolean = false;
  
  // Customization
  eventName: string = 'PUSHPAGIRI ONAM FEST 2026';
  eventSubtitle: string = 'Digital Games & Cultural Management';
  dignitaryTitle: string = 'Honorable Chief Guests & Organizing Committee';

  // Scissors Pointer Cursor State (Scope: Screen only)
  cursorPos = { x: -100, y: -100 };
  isCursorInside: boolean = false;
  isSnipping: boolean = false;

  // Particle System
  private animationFrameId?: number;
  private particles: Particle[] = [];
  private audioCtx?: AudioContext;

  constructor(private router: Router) {}

  onMouseMove(e: MouseEvent): void {
    this.cursorPos = { x: e.clientX, y: e.clientY };
    this.isCursorInside = true;
  }

  onMouseDown(e: MouseEvent): void {
    this.isSnipping = true;
    this.playSnipSound();
    setTimeout(() => {
      this.isSnipping = false;
    }, 220);
  }

  onMouseLeave(): void {
    this.isCursorInside = false;
  }

  onMouseEnter(): void {
    this.isCursorInside = true;
  }

  ngOnInit(): void {
    // Check if previously cut in this session if needed, default to fresh
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }

  // Trigger Ribbon Cut
  cutRibbon(): void {
    if (this.isCutting || this.isCut) return;

    this.isCutting = true;
    this.playSnipSound();

    // Trigger scissor action
    setTimeout(() => {
      this.isCut = true;
      this.isCutting = false;
      this.showCelebration = true;

      // Play celebratory fanfare
      this.playFanfareSound();

      // Launch full petal & confetti explosion
      setTimeout(() => {
        this.initCanvasAndParticles();
      }, 100);
    }, 600);
  }

  // Replay Ceremony
  replayCeremony(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.particles = [];
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.isCut = false;
    this.isCutting = false;
    this.showCelebration = false;
  }

  // Sound Toggle
  toggleSound(): void {
    this.isMuted = !this.isMuted;
  }

  // Navigation handlers
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Sound Synthesizer via Web Audio API
  private getAudioContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private playSnipSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Metallic scissor snip simulation
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'highpass' as unknown as OscillatorType;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(8, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  private playFanfareSound(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Festive Kerala Chenda drum rhythm & brass fanfare notes
    // Traditional triumphant notes: C4, E4, G4, C5, E5, G5
    const notes = [
      { f: 523.25, t: 0.0, d: 0.18, vol: 0.35 }, // C5
      { f: 659.25, t: 0.18, d: 0.18, vol: 0.38 }, // E5
      { f: 783.99, t: 0.36, d: 0.22, vol: 0.42 }, // G5
      { f: 1046.50, t: 0.58, d: 0.65, vol: 0.50 }, // C6
      { f: 783.99, t: 0.90, d: 0.15, vol: 0.35 }, // G5
      { f: 1046.50, t: 1.05, d: 1.20, vol: 0.55 }, // C6 long sustain
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      // Warm harmonic overtone
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(n.f * 1.5, now + n.t);

      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.linearRampToValueAtTime(n.vol, now + n.t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc2.start(now + n.t);
      osc.stop(now + n.t + n.d);
      osc2.stop(now + n.t + n.d);
    });

    // Celebratory Chenda beat pulse
    for (let i = 0; i < 8; i++) {
      const beatTime = now + (i * 0.15);
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(140 + (i % 2 === 0 ? 30 : 0), beatTime);
      drumOsc.frequency.exponentialRampToValueAtTime(45, beatTime + 0.12);

      drumGain.gain.setValueAtTime(0.4, beatTime);
      drumGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.12);

      drumOsc.connect(drumGain);
      drumGain.connect(ctx.destination);

      drumOsc.start(beatTime);
      drumOsc.stop(beatTime + 0.12);
    }
  }

  // Canvas Petals & Confetti Particle System
  private initCanvasAndParticles(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = [
      '#FFB703', // Marigold Yellow
      '#FB8500', // Saffron Orange
      '#E63946', // Rose Red (Chethi)
      '#FFFFFF', // Jasmine White (Mulla)
      '#FFD166', // Gold
      '#06D6A0', // Leaf Emerald
      '#FF477E', // Hibiscus Pink
      '#F4A261'  // Warm Ochre
    ];

    this.particles = [];
    const count = Math.min(180, Math.floor(window.innerWidth / 8));

    for (let i = 0; i < count; i++) {
      const isPetal = Math.random() > 0.45;
      const isRibbon = !isPetal && Math.random() > 0.6;
      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 100,
        radius: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: isPetal ? 'petal' : (isRibbon ? 'ribbon' : 'confetti'),
        vx: (Math.random() - 0.5) * 18 * (Math.random() > 0.5 ? 1 : 1.2),
        vy: -Math.random() * 14 - 6, // Upward initial burst
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.08,
        size: Math.random() * 12 + 8,
        opacity: 1
      });
    }

    this.animateParticles(ctx, canvas);
  }

  private animateParticles(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.angularSpeed;

      // Gravity & air drag
      p.vy += 0.28;
      p.vx *= 0.985;

      // Fluttering effect for flower petals
      if (p.type === 'petal') {
        p.vx += Math.sin(p.angle * 2) * 0.35;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;

      if (p.type === 'petal') {
        // Draw teardrop floral petal (Mulla / Chethi)
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Petal vein
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.8);
        ctx.lineTo(0, p.size * 0.8);
        ctx.stroke();
      } else if (p.type === 'ribbon') {
        // Draw curly streamer ribbon
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.8, -p.size * 0.25, p.size * 1.6, p.size * 0.5);
      } else {
        // Confetti square / circle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.rect(-p.size * 0.4, -p.size * 0.4, p.size * 0.8, p.size * 0.8);
        ctx.fill();
      }

      ctx.restore();

      // Check boundary
      if (p.y < canvas.height + 50) {
        activeParticles++;
      }
    }

    if (activeParticles > 0 && this.showCelebration) {
      this.animationFrameId = requestAnimationFrame(() => this.animateParticles(ctx, canvas));
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
}
