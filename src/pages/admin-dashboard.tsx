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
import { useAddAsset, useAssets, useDeleteAsset, useUploadAsset } from '@/hooks/use-assets';
import { bySlotNumber, gallerySlots, isFixedSlot, testimonialSlots } from '@/lib/slots';
import { useNoIndex } from '@/hooks/use-no-index';
import type { ContentAsset } from '@/lib/api';

export default function AdminDashboard() {
  useNoIndex();
  const [, navigate] = useLocation();
  const { data: me, isLoading: meLoading } = useMe();
  const logout = useLogout();
  const { data: assetsBySlot, isLoading: assetsLoading } = useAssets();

  useEffect(() => {
    if (!meLoading && !me) navigate('/admin');
  }, [meLoading, me, navigate]);

  if (meLoading || !me) return null;

  const assets = Object.values(assetsBySlot ?? {});
  const extraGalleryAssets = assets.filter((a) => a.type === 'image' && !isFixedSlot(a.slot)).sort(bySlotNumber);
  const extraTestimonialAssets = assets
    .filter((a) => a.type === 'voicenote' && !isFixedSlot(a.slot))
    .sort(bySlotNumber);

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
                slot={slotDef.slot}
                type={slotDef.type}
                fallback={slotDef.fallback}
                asset={assetsBySlot?.[slotDef.slot]}
                loading={assetsLoading}
                isFixed
              />
            ))}
            {extraGalleryAssets.map((asset) => (
              <SlotCard key={asset.slot} slot={asset.slot} type={asset.type} asset={asset} loading={assetsLoading} isFixed={false} />
            ))}
          </div>
          <AddAssetButton type="image" label="إضافة صورة جديدة" />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">التسجيلات الصوتية (Testimonials)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {testimonialSlots.map((slotDef) => (
              <SlotCard
                key={slotDef.slot}
                slot={slotDef.slot}
                type={slotDef.type}
                fallback={slotDef.fallback}
                asset={assetsBySlot?.[slotDef.slot]}
                loading={assetsLoading}
                isFixed
              />
            ))}
            {extraTestimonialAssets.map((asset) => (
              <SlotCard key={asset.slot} slot={asset.slot} type={asset.type} asset={asset} loading={assetsLoading} isFixed={false} />
            ))}
          </div>
          <AddAssetButton type="voicenote" label="إضافة تسجيل صوتي جديد" />
        </section>
      </div>
    </div>
  );
}

function AddAssetButton({ type, label }: { type: 'image' | 'voicenote'; label: string }) {
  const add = useAddAsset();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    add.mutate(
      { type, file },
      {
        onSuccess: (asset) => toast.success(`تمت إضافة ${asset.slot}`),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'image' ? 'image/*' : 'audio/*'}
        className="hidden"
        onChange={handleFileChange}
        data-testid={`input-add-${type}`}
      />
      <Button
        variant="outline"
        disabled={add.isPending}
        onClick={() => fileInputRef.current?.click()}
        data-testid={`button-add-${type}`}
      >
        {add.isPending ? 'جاري الإضافة...' : label}
      </Button>
    </div>
  );
}

function SlotCard({
  slot,
  type,
  fallback,
  asset,
  loading,
  isFixed,
}: {
  slot: string;
  type: 'image' | 'voicenote';
  fallback?: string;
  asset: ContentAsset | undefined;
  loading: boolean;
  isFixed: boolean;
}) {
  const upload = useUploadAsset();
  const deleteMutation = useDeleteAsset();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasAsset = Boolean(asset);
  const currentUrl = asset?.url ?? fallback;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    upload.mutate(
      { slot, type, file },
      {
        onSuccess: () => toast.success(`تم رفع الملف لـ ${slot}`),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(slot, {
      onSuccess: () => toast.success(`تم حذف ${slot}`),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <Card data-testid={`card-slot-${slot}`}>
      <CardHeader>
        <CardTitle className="text-sm font-mono">{slot}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <Spinner className="size-5" />
        ) : currentUrl && type === 'image' ? (
          <img src={currentUrl} alt={slot} className="aspect-square w-full rounded-md object-cover" />
        ) : currentUrl ? (
          <audio controls src={currentUrl} className="w-full" />
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'image' ? 'image/*' : 'audio/*'}
          className="hidden"
          onChange={handleFileChange}
          data-testid={`input-file-${slot}`}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
            data-testid={`button-upload-${slot}`}
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
                  data-testid={`button-delete-${slot}`}
                >
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف {slot}؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isFixed
                      ? 'سيعود هذا العنصر لعرض الملف الافتراضي على الصفحة العامة حتى يتم رفع ملف جديد.'
                      : 'سيتم حذف هذا العنصر نهائيا من الصفحة العامة. هذا الإجراء لا يمكن التراجع عنه.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} data-testid={`button-confirm-delete-${slot}`}>
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
