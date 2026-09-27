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
  SmartPhone01Icon,
} from "hugeicons-react";

type NameGateModalProps = {
  isOpen: boolean;
  onSubmit: (name: string) => void;
};

const RULES = [
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
];

export function NameGateModal({ isOpen, onSubmit }: NameGateModalProps) {
  const { t, language } = useLanguage();
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
        className="max-w-md gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-md"
      >
        <DialogHeader className="space-y-5 px-6 pt-7 pb-0 text-left sm:px-7">
          <Logo className="h-6" priority />
          <div className="space-y-1.5">
            <DialogTitle className="font-display text-2xl font-medium tracking-[-0.02em]">
              {step === "name" ? t.quizGateTitle : t.quizGateRulesTitle}
            </DialogTitle>
            <DialogDescription className="text-pretty text-sm leading-relaxed">
              {step === "name" ? t.quizGateSub : t.quizGateRulesSub}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-6 pt-6 pb-7 sm:px-7">
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
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {RULES.map((rule) => (
                  <li key={rule.titleKey} className="flex gap-3 p-4">
                    <span aria-hidden className="mt-0.5 shrink-0">
                      {rule.icon}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-medium tracking-[-0.01em]">
                        {t[rule.titleKey]}
                      </p>
                      <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                        {t[rule.bodyKey]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
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
