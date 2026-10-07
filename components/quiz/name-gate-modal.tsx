"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { useLanguage } from "@/components/providers";
import {
  Alert02Icon,
  ArrowExpand01Icon,
  ArrowRight01Icon,
  Globe02Icon,
  SmartPhone01Icon,
  Wifi01Icon,
} from "hugeicons-react";

type NameGateModalProps = {
  isOpen: boolean;
  onSubmit: (name: string) => void;
};

const RULES = [
  {
    icon: <Wifi01Icon className="size-4 text-emerald-500" />,
    titleKey: "ruleInternetTitle" as const,
    bodyKey: "ruleInternetSub" as const,
  },
  {
    icon: <SmartPhone01Icon className="size-4 text-warning" />,
    titleKey: "ruleDndTitle" as const,
    bodyKey: "ruleDndSub" as const,
  },
  {
    icon: <Alert02Icon className="size-4 text-destructive" />,
    titleKey: "ruleNoSwitchTitle" as const,
    bodyKey: "ruleNoSwitchSub" as const,
  },
  {
    icon: <ArrowExpand01Icon className="size-4 text-primary" />,
    titleKey: "ruleFullscreenTitle" as const,
    bodyKey: "ruleFullscreenSub" as const,
  },
  {
    icon: <Globe02Icon className="size-4 text-blue-500" />,
    titleKey: "ruleGoogleAccountTitle" as const,
    bodyKey: "ruleGoogleAccountSub" as const,
  },
];

export function NameGateModal({ isOpen, onSubmit }: NameGateModalProps) {
  const { t, language, toggleLanguage } = useLanguage();
  const [step, setStep] = React.useState<"name" | "rules">("name");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");

  const handleNext = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(t.quizGateNameRequired);
      return;
    }
    setError("");
    setStep("rules");
  };

  const handleStart = () => {
    if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    onSubmit(name.trim());
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md w-[calc(100vw-2rem)] max-h-[92vh] flex flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 space-y-4 px-5 pt-6 pb-2 text-left sm:space-y-5 sm:px-7 sm:pt-7 sm:pb-0">
          <div className="flex items-center justify-between">
            <Logo className="h-6" priority />
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe02Icon className="size-3.5 text-muted-foreground" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
          <div className="space-y-1">
            <DialogTitle className="font-display text-xl sm:text-2xl font-medium tracking-[-0.02em]">
              {step === "name" ? t.quizGateTitle : t.quizGateRulesTitle}
            </DialogTitle>
            <DialogDescription className="text-pretty text-xs sm:text-sm leading-relaxed">
              {step === "name" ? t.quizGateSub : t.quizGateRulesSub}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {step === "name" ? (
            <form onSubmit={handleNext} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="participant-name" className="text-xs text-muted-foreground">
                  {t.fullName}
                </Label>
                <Input
                  id="participant-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder={language === "id" ? "Contoh: Budi Santoso" : "e.g., John Doe"}
                  autoFocus
                  autoComplete="off"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "participant-name-error" : undefined}
                  className="h-10"
                />
                {error ? (
                  <p id="participant-name-error" className="text-xs text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="h-10 w-full gap-2">
                {t.quizGateNext}
                <ArrowRight01Icon className="size-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {t.quizGateFootnote}
              </p>
            </form>
          ) : (
            <div className="space-y-5">
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-muted/20">
                {RULES.map((rule) => (
                  <li key={rule.titleKey} className="flex gap-3 p-3.5 sm:p-4">
                    <span aria-hidden className="mt-0.5 shrink-0">
                      {rule.icon}
                    </span>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium tracking-[-0.01em]">
                        {t[rule.titleKey]}
                      </p>
                      <p className="text-pretty text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
                        {t[rule.bodyKey]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 pt-1">
                <Button onClick={handleStart} className="h-10 w-full gap-2">
                  {t.startQuiz}
                  <ArrowRight01Icon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("name")}
                  className="h-8 w-full text-xs text-muted-foreground"
                >
                  {t.changeName}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
