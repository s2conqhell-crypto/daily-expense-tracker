'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent } from '@/components/ui';
import { Wallet, Loader2, CheckCircle, AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const { user, verifyEmail, error, clearError } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const handleResend = async () => {
    clearError();
    setSending(true);
    try {
      await verifyEmail();
      setSent(true);
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send verification');
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground">Check your inbox for the verification link</p>
        </div>

        <Card className="border-0 shadow-xl shadow-primary/5">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              {sent ? (
                <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                We sent a verification email to <strong className="text-foreground">{user.email}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click the link in the email to verify your account, then refresh this page.
              </p>
            </div>

            {user.emailVerified && (
              <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4" /> Email verified! You&apos;re all set.
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            <Button variant="outline" className="w-full gap-1.5" onClick={handleResend} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {sending ? 'Sending...' : sent ? 'Resend Email' : 'Send Verification Email'}
            </Button>

            <Link href="/dashboard">
              <Button className="w-full gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
