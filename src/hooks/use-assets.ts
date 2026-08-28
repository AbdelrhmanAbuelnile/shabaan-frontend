import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiJson,
  createAsset,
  deleteAsset,
  getUploadSignature,
  replaceAsset,
  uploadToCloudinary,
  type ContentAsset,
} from '@/lib/api';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async (): Promise<Record<string, ContentAsset>> => {
      const list = await apiJson<ContentAsset[]>('/assets');
      return Object.fromEntries(list.map((asset) => [asset.slot, asset]));
    },
    // Fail fast to the static fallback assets instead of retrying — a slow
    // or misconfigured backend shouldn't stall the public landing page or
    // leave the admin dashboard spinning.
    retry: false,
  });
}

export function useUploadAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slot,
      type,
      file,
    }: {
      slot: string;
      type: 'image' | 'voicenote';
      file: File;
    }) => {
      const signature = await getUploadSignature(type);
      const uploaded = await uploadToCloudinary(signature, file);
      return replaceAsset(slot, {
        type,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useAddAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, file }: { type: 'image' | 'voicenote'; file: File }) => {
      const signature = await getUploadSignature(type);
      const uploaded = await uploadToCloudinary(signature, file);
      return createAsset({
        type,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slot: string) => deleteAsset(slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
