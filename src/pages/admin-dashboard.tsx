import { useEffect, useRef, type ChangeEvent } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLogout, useMe } from '@/hooks/use-auth';
import { useAssets, useDeleteAsset, useUploadAsset } from '@/hooks/use-assets';
import { gallerySlots, testimonialSlots, type SlotDef } from '@/lib/slots';
import type { ContentAsset } from '@/lib/api';

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: me, isLoading: meLoading } = useMe();
  const logout = useLogout();
  const { data: assetsBySlot, isLoading: assetsLoading } = useAssets();

  useEffect(() => {
    if (!meLoading && !me) navigate('/admin');
  }, [meLoading, me, navigate]);

  if (meLoading || !me) return null;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8" dir="rtl">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">لوحة تحكم المحتوى</h1>
            <p className="text-sm text-muted-foreground">مسجل دخول باسم {me.username}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/admin') })}
            data-testid="button-admin-logout"
          >
            تسجيل الخروج
          </Button>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">صور النتائج (Gallery)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {gallerySlots.map((slotDef) => (
              <SlotCard
                key={slotDef.slot}
                slotDef={slotDef}
                asset={assetsBySlot?.[slotDef.slot]}
                loading={assetsLoading}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">التسجيلات الصوتية (Testimonials)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {testimonialSlots.map((slotDef) => (
              <SlotCard
                key={slotDef.slot}
                slotDef={slotDef}
                asset={assetsBySlot?.[slotDef.slot]}
                loading={assetsLoading}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SlotCard({
  slotDef,
  asset,
  loading,
}: {
  slotDef: SlotDef;
  asset: ContentAsset | undefined;
  loading: boolean;
}) {
  const upload = useUploadAsset();
  const deleteMutation = useDeleteAsset();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasAsset = Boolean(asset);
  const currentUrl = asset?.url ?? slotDef.fallback;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    upload.mutate(
      { slot: slotDef.slot, type: slotDef.type, file },
      {
        onSuccess: () => toast.success(`تم رفع الملف لـ ${slotDef.slot}`),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(slotDef.slot, {
      onSuccess: () => toast.success(`تم حذف ${slotDef.slot}`),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <Card data-testid={`card-slot-${slotDef.slot}`}>
      <CardHeader>
        <CardTitle className="text-sm font-mono">{slotDef.slot}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <Spinner className="size-5" />
        ) : slotDef.type === 'image' ? (
          <img src={currentUrl} alt={slotDef.slot} className="aspect-square w-full rounded-md object-cover" />
        ) : (
          <audio controls src={currentUrl} className="w-full" />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={slotDef.type === 'image' ? 'image/*' : 'audio/*'}
          className="hidden"
          onChange={handleFileChange}
          data-testid={`input-file-${slotDef.slot}`}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
            data-testid={`button-upload-${slotDef.slot}`}
          >
            {upload.isPending ? 'جاري الرفع...' : hasAsset ? 'استبدال' : 'رفع'}
          </Button>
          {hasAsset && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${slotDef.slot}`}
                >
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف {slotDef.slot}؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيعود هذا العنصر لعرض الملف الافتراضي على الصفحة العامة حتى يتم رفع ملف جديد.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} data-testid={`button-confirm-delete-${slotDef.slot}`}>
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
