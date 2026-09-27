"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { encodeFormUrl } from "@/lib/url";
import {
  Shield01Icon,
  QrCodeIcon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  Link01Icon,
  ArrowLeft01Icon,
  AlertCircleIcon,
} from "hugeicons-react";

export default function AdminPage() {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const defaultSampleUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc_ExampleFormUrl/viewform";

  const activeUrl = inputUrl.trim() || defaultSampleUrl;
  const encodedUrlParam = encodeFormUrl(activeUrl);
  const generatedQuizUrl = origin
    ? `${origin}/quiz?form=${encodedUrlParam}`
    : `/quiz?form=${encodedUrlParam}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedQuizUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Failed to copy link to clipboard");
    }
  };

  const handlePresetSelect = (url: string) => {
    setInputUrl(url);
    setError("");
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col justify-between bg-neutral-950 text-neutral-100 font-sans">
      {/* Navigation Header */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 text-neutral-950 flex items-center justify-center font-bold">
                <Shield01Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="font-sans font-semibold text-lg tracking-tight">
                Secure Quiz Wrapper
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft01Icon className="w-4 h-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-10 w-full flex-1">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 text-xs uppercase tracking-wider">
            <QrCodeIcon className="w-3.5 h-3.5 text-neutral-200" />
            Admin Console
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-white tracking-tight">
            Generate Secure Assessment Link
          </h1>
          <p className="text-neutral-400 text-sm md:text-base max-w-2xl">
            Enter target Google Form or Microsoft Form URL to generate a protected session wrapper and scannable QR Code for distribution.
          </p>
        </div>

        {/* Bento Grid layout for Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Link Input & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="space-y-6 bg-neutral-900/50">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-200 flex items-center gap-2">
                  <Link01Icon className="w-4 h-4 text-neutral-400" />
                  Target Form URL
                </label>
                <Input
                  type="url"
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    setError("");
                  }}
                  error={error}
                />
              </div>

              {/* Sample Quick Presets */}
              <div className="space-y-2 pt-2">
                <span className="text-xs text-neutral-400 font-medium">
                  Quick Testing Templates:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetSelect(
                        "https://docs.google.com/forms/d/e/1FAIpQLScf3nF9U3sR_SampleAssessment/viewform"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/60 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                  >
                    Google Form Template
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetSelect(
                        "https://forms.office.com/pages/responsepage.aspx?id=SampleMsFormId"
                      )
                    }
                    className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/60 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                  >
                    Microsoft Form Template
                  </button>
                </div>
              </div>

              {/* Generated URL Display */}
              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/90 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Protected Session URL</span>
                  <span className="font-mono text-[11px] text-neutral-500">PARAM ENCODED</span>
                </div>
                <p className="font-mono text-xs text-neutral-200 break-all bg-neutral-900/80 p-3 rounded-xl border border-neutral-800/80 select-all">
                  {generatedQuizUrl}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto flex-1"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400" />
                        Link Copied
                      </>
                    ) : (
                      <>
                        <Copy01Icon className="w-4 h-4" />
                        Copy Shareable Link
                      </>
                    )}
                  </Button>

                  <a
                    href={generatedQuizUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button variant="secondary" size="md" className="w-full">
                      Test Quiz Session
                      <ArrowRight01Icon className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>

            {/* Enforcement Parameters Card */}
            <Card className="space-y-4 bg-neutral-900/30">
              <h3 className="font-serif text-lg font-medium text-white flex items-center gap-2">
                <Shield01Icon className="w-4 h-4 text-neutral-400" />
                Active Security Rules Applied
              </h3>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic insertion of <code>?embedded=true</code> query parameter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Active window blur and tab visibility switch tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Right-click context menu and clipboard copy/paste blocking</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Right Column: QR Code Display (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="flex flex-col items-center justify-between p-8 text-center space-y-6 bg-neutral-900/60 h-full">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                  Distribution QR Code
                </span>
                <h3 className="font-serif text-2xl font-medium text-white">
                  Scan to Open Assessment
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Display or project this code for participants to immediately launch the quiz in controlled mode.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl shadow-black flex items-center justify-center">
                <QRCodeSVG
                  value={generatedQuizUrl}
                  size={200}
                  bgColor="#09090b"
                  fgColor="#f5f5f5"
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="w-full space-y-2 pt-2">
                <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 text-xs font-mono text-neutral-400 flex items-center justify-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 text-neutral-400" />
                  Scannable by any camera or mobile device
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-neutral-500 font-sans">
          Secure Quiz Wrapper Admin System — Integrity Management
        </div>
      </footer>
    </div>
  );
}
