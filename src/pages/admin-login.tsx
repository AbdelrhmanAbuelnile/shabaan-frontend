import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin, useMe } from '@/hooks/use-auth';
import { useNoIndex } from '@/hooks/use-no-index';

export default function AdminLogin() {
  useNoIndex();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, navigate] = useLocation();
  const { data: me } = useMe();
  const login = useLogin();

  if (me) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate(
      { username, password },
      {
        onSuccess: () => navigate('/admin/dashboard'),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>تسجيل دخول الإدارة</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                data-testid="input-admin-username"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                data-testid="input-admin-password"
              />
            </div>
            <Button type="submit" disabled={login.isPending} data-testid="button-admin-login">
              {login.isPending ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
