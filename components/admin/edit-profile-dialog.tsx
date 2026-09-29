"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Alert02Icon,
  LockPasswordIcon,
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

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentEmail: string;
  onSuccess: (updatedName: string) => void;
}

interface EditProfileFormProps {
  currentName: string;
  currentEmail: string;
  onClose: () => void;
  onSuccess: (updatedName: string) => void;
}

function EditProfileForm({
  currentName,
  currentEmail,
  onClose,
  onSuccess,
}: EditProfileFormProps) {
  const { t } = useLanguage();

  const [name, setName] = React.useState(currentName);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.nameRequired);
      return;
    }

    const wantsPasswordChange = Boolean(
      currentPassword || newPassword || confirmPassword
    );

    if (wantsPasswordChange) {
      if (!currentPassword) {
        setError(t.oldPasswordRequired);
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setError(t.passwordMinLength);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t.passwordMismatch);
        return;
      }
    }

    // Check if anything actually changed
    const nameChanged = trimmedName !== currentName;
    if (!nameChanged && !wantsPasswordChange) {
      onClose();
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload: {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
      } = { name: trimmedName };

      if (wantsPasswordChange) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.toastNetworkError);
        return;
      }

      toast.success(t.accountUpdated);
      onSuccess(data.admin?.name || trimmedName);
      onClose();
    } catch {
      setError(t.toastNetworkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
      {/* Readonly Email */}
      <div className="space-y-1.5">
        <Label htmlFor="accountEmail" className="text-xs text-muted-foreground">
          {t.email}
        </Label>
        <div className="relative flex items-center">
          <Input
            id="accountEmail"
            type="email"
            value={currentEmail}
            disabled
            className="h-10 bg-muted/40 pr-9 text-muted-foreground cursor-not-allowed select-none"
          />
          <Mail01Icon className="pointer-events-none absolute right-3 size-4 text-muted-foreground/60" />
        </div>
        <p className="text-[0.75rem] text-muted-foreground/80">
          {t.emailReadOnlyNote}
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="accountName" className="text-xs text-muted-foreground">
          {t.fullName}
        </Label>
        <Input
          id="accountName"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. Ahmad Wijaya"
          className="h-10"
        />
      </div>

      {/* Change Password Section */}
      <div className="rounded-xl border border-border/80 bg-card/40 p-3.5 sm:p-4 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <LockPasswordIcon className="size-3.5 text-primary" />
          <span>{t.changePasswordSection}</span>
        </div>
        <p className="text-[0.75rem] text-muted-foreground">
          {t.changePasswordHint}
        </p>

        <div className="space-y-1.5">
          <Label
            htmlFor="currentPassword"
            className="text-xs text-muted-foreground"
          >
            {t.oldPassword}
          </Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="h-9 bg-background"
            autoComplete="current-password"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="newPassword"
              className="text-xs text-muted-foreground"
            >
              {t.newPassword}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 bg-background"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs text-muted-foreground"
            >
              {t.confirmPassword}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 bg-background"
              autoComplete="new-password"
            />
          </div>
        </div>
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
          className="h-10 sm:h-9"
        >
          {submitting ? t.savingChanges : t.saveChanges}
        </Button>
      </div>
    </form>
  );
}

export function EditProfileDialog({
  open,
  onOpenChange,
  currentName,
  currentEmail,
  onSuccess,
}: EditProfileDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="size-4 text-primary" />
            <span>{t.accountSettings}</span>
          </DialogTitle>
          <DialogDescription>{t.accountSettingsSub}</DialogDescription>
        </DialogHeader>

        {open ? (
          <EditProfileForm
            currentName={currentName}
            currentEmail={currentEmail}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
