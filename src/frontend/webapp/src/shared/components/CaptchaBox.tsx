'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface CaptchaBoxProps {
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  error?: string;
  placeholder?: string;
  label?: string;
  refreshLabel?: string;
  onCodeGenerated?: (code: string) => void;
}

const CHAR_SET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function CaptchaBox({
  value,
  onChange,
  onRefresh,
  error,
  placeholder = 'Nhập mã CAPTCHA',
  label = 'Xác thực bảo mật (CAPTCHA)',
  refreshLabel = 'Đổi mã khác',
  onCodeGenerated,
}: CaptchaBoxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setCurrentCode] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  const generateRandomCode = useCallback((length = 5) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
    }
    return result;
  }, []);

  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Nền gradient tinh tế
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Nhiễu hạt ngẫu nhiên
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 120 + 30)}, ${Math.floor(
        Math.random() * 120 + 30
      )}, ${Math.floor(Math.random() * 180 + 50)}, 0.45)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.8 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Các đường lượn sóng can thiệp chống bot
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 100 + 40)}, ${Math.floor(
        Math.random() * 100 + 40
      )}, ${Math.floor(Math.random() * 180 + 40)}, 0.5)`;
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 15, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width * 0.4,
        Math.random() * height,
        Math.random() * width * 0.7,
        Math.random() * height,
        width - Math.random() * 15,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Vẽ từng ký tự với góc xoay ngẫu nhiên
    const colors = ['#1e40af', '#047857', '#b45309', '#6d28d9', '#be123c', '#0369a1'];
    const charSpacing = width / (code.length + 0.8);

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const fontSize = Math.floor(Math.random() * 4) + 20;
      ctx.font = `900 ${fontSize}px "Courier New", monospace`;
      ctx.fillStyle = colors[i % colors.length];

      ctx.save();
      const x = (i + 0.65) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 36 - 18) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, []);

  const refreshCode = useCallback(() => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);
    const newCode = generateRandomCode(5);
    setCurrentCode(newCode);
    if (onCodeGenerated) {
      onCodeGenerated(newCode);
    }
    if (onRefresh) {
      onRefresh();
    }
    drawCaptcha(newCode);
  }, [generateRandomCode, onCodeGenerated, onRefresh, drawCaptcha]);

  useEffect(() => {
    refreshCode();
  }, [refreshCode]);

  return (
    <div className="space-y-2 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
          Bảo Mật Cấp 2
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          maxLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder={placeholder}
          className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white tracking-widest focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-500'
              : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
          }`}
        />

        <div
          onClick={refreshCode}
          className="relative cursor-pointer group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-2xs shrink-0 select-none bg-slate-100"
          title={refreshLabel}
        >
          <canvas
            ref={canvasRef}
            width={130}
            height={38}
            className="block"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <RefreshCw className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </div>
        </div>

        <button
          type="button"
          onClick={refreshCode}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
          title={refreshLabel}
        >
          <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-0.5">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
