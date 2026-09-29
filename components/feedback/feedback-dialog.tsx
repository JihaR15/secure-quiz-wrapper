"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Alert02Icon,
  Comment01Icon,
  Mail01Icon,
  UserIcon,
} from "hugeicons-react";
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
import { useLanguage } from "@/components/providers";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  defaultEmail?: string;
}

interface FeedbackFormProps {
  defaultName?: string;
  defaultEmail?: string;
  onClose: () => void;
}

function FeedbackForm({
  defaultName = "",
  defaultEmail = "",
  onClose,
}: FeedbackFormProps) {
  const { t } = useLanguage();

  const [name, setName] = React.useState(defaultName);
  const [email, setEmail] = React.useState(defaultEmail);
  const [category, setCategory] = React.useState<string>("Saran Fitur Baru");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const categories = React.useMemo(
    () => [
      { key: "feature", label: t.feedbackCatFeature },
      { key: "bug", label: t.feedbackCatBug },
      { key: "experience", label: t.feedbackCatExperience },
      { key: "other", label: t.feedbackCatOther },
    ],
    [t]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedMsg = message.trim();
    if (!trimmedMsg || trimmedMsg.length < 5) {
      setError(t.feedbackMinLength);
      return;
    }

    if (email.trim() && !email.includes("@")) {
      setError(t.email);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          category,
          message: trimmedMsg,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.feedbackError);
        return;
      }

      toast.success(t.feedbackSuccess);
      onClose();
    } catch {
      setError(t.toastNetworkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
      {/* Category Selection Pills */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {t.feedbackCategory}
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {categories.map((cat) => {
            const isSelected = category === cat.label;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.label)}
                className={`rounded-lg border px-2.5 py-1.5 text-center text-xs font-medium transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name and Email Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="feedbackName" className="text-xs text-muted-foreground">
            {t.feedbackName}
          </Label>
          <div className="relative flex items-center">
            <Input
              id="feedbackName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Ahmad Wijaya"
              className="h-10 pr-9"
            />
            <UserIcon className="pointer-events-none absolute right-3 size-4 text-muted-foreground/60" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="feedbackEmail" className="text-xs text-muted-foreground">
            {t.feedbackEmail}
          </Label>
          <div className="relative flex items-center">
            <Input
              id="feedbackEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmad@sekolah.sch.id"
              className="h-10 pr-9"
            />
            <Mail01Icon className="pointer-events-none absolute right-3 size-4 text-muted-foreground/60" />
          </div>
        </div>
      </div>
      <p className="text-[0.72rem] text-muted-foreground">
        {t.feedbackEmailHint}
      </p>

      {/* Message Textarea */}
      <div className="space-y-1.5">
        <Label htmlFor="feedbackMessage" className="text-xs text-muted-foreground">
          {t.feedbackMessage} <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="feedbackMessage"
          required
          rows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError("");
          }}
          placeholder={t.feedbackMessagePlaceholder}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Error notification */}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-xs leading-relaxed text-destructive"
        >
          <Alert02Icon className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
          className="h-10 sm:h-9"
        >
          {t.cancel}
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 sm:h-9 gap-2"
        >
          {submitting ? t.feedbackSending : t.feedbackSend}
          {submitting ? null : <Comment01Icon className="size-4" />}
        </Button>
      </div>
    </form>
  );
}

export function FeedbackDialog({
  open,
  onOpenChange,
  defaultName,
  defaultEmail,
}: FeedbackDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Comment01Icon className="size-4 text-primary" />
            <span>{t.feedbackTitle}</span>
          </DialogTitle>
          <DialogDescription>{t.feedbackSub}</DialogDescription>
        </DialogHeader>

        {open ? (
          <FeedbackForm
            defaultName={defaultName}
            defaultEmail={defaultEmail}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
