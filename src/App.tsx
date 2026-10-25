import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { SearchBar } from './components/SearchBar';
import { ImageCard } from './components/ImageCard';
import { SettingsModal } from './components/SettingsModal';
import { LightboxModal } from './components/LightboxModal';
import { Toast } from './components/Toast';
import { UploadedImage, CloudflareConfig, ToastMessage } from './types';
import {
  getStoredImages,
  saveStoredImages,
  getStoredCloudflareConfig,
  saveStoredCloudflareConfig
} from './services/storage';
import { fileToDataUrl, getImageDimensions, uploadImage } from './services/cloudflare';
import { Images, AlertCircle } from 'lucide-react';

export default function App() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [cfConfig, setCfConfig] = useState<CloudflareConfig>({
    accountId: '',
    apiToken: '',
    accountHash: '',
    enabled: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    filename: string;
  } | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setImages(getStoredImages());
    setCfConfig(getStoredCloudflareConfig());
  }, []);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveConfig = (newConfig: CloudflareConfig) => {
    setCfConfig(newConfig);
    saveStoredCloudflareConfig(newConfig);
    addToast('Storage settings updated!', 'success');
  };

  const handleClearAll = () => {
    setImages([]);
    saveStoredImages([]);
    addToast('All images removed from vault', 'info');
  };

  const handleCleanBase64 = () => {
    const cleaned = images.filter((img) => !img.url.startsWith('data:'));
    const count = images.length - cleaned.length;
    setImages(cleaned);
    saveStoredImages(cleaned);
    addToast(`Removed ${count} old base64 cards.`, 'info');
  };

  const hasBase64Images = useMemo(() => {
    return images.some((img) => img.url.startsWith('data:'));
  }, [images]);

  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      addToast('Please select valid image files (PNG, JPG, WEBP, GIF, SVG)', 'error');
      return;
    }

    setIsUploading(true);
    const newItems: UploadedImage[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress({
        current: i + 1,
        total: fileArray.length,
        filename: file.name
      });

      try {
        // Fast local dimensions calculation
        const localDataUrl = await fileToDataUrl(file);
        const dims = await getImageDimensions(localDataUrl);

        // Upload to real cloud CDN / Cloudflare
        const uploadResult = await uploadImage(file, cfConfig);

        const newItem: UploadedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.url,
          uploadedAt: new Date().toISOString(),
          width: dims.width,
          height: dims.height,
          source: uploadResult.provider,
          cloudflareId: uploadResult.id
        };

        newItems.unshift(newItem);
      } catch (err: any) {
        addToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
      }
    }

    if (newItems.length > 0) {
      const updated = [...newItems, ...images];
      setImages(updated);
      saveStoredImages(updated);
      addToast(`Uploaded ${newItems.length} ${newItems.length === 1 ? 'image' : 'images'}! Direct HTTPS links ready.`, 'success');
    }

    setIsUploading(false);
    setUploadProgress(null);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast('Direct image URL copied to clipboard!', 'success');
  };

  const handleDeleteImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    saveStoredImages(updated);
    addToast('Image deleted from vault', 'info');
  };

  const filteredImages = useMemo(() => {
    let result = [...images];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (img) =>
          img.name.toLowerCase().includes(q) ||
          img.type.toLowerCase().includes(q)
      );
    }

    if (selectedFormat !== 'ALL') {
      result = result.filter((img) =>
        img.name.toUpperCase().endsWith('.' + selectedFormat)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sortBy === 'size-desc') {
        return b.size - a.size;
      }
      if (sortBy === 'size-asc') {
        return a.size - b.size;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [images, searchQuery, selectedFormat, sortBy]);

  const totalSize = useMemo(() => {
    return images.reduce((acc, img) => acc + img.size, 0);
  }, [images]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b13] text-slate-100">
      
      <Header
        totalCount={images.length}
        totalSize={totalSize}
        isCloudflareActive={Boolean(cfConfig.enabled && cfConfig.accountId && cfConfig.apiToken)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Old base64 warning cleanup bar if any exist */}
        {hasBase64Images && (
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You have older cards with base64 data URLs. Clean them to keep only real public HTTPS URLs.</span>
            </div>
            <button
              onClick={handleCleanBase64}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-semibold shrink-0"
            >
              Remove Base64 Cards
            </button>
          </div>
        )}

        {/* Upload Zone */}
        <UploadZone
          onFilesSelected={handleFilesSelected}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        {/* Gallery Controls & Search */}
        {images.length > 0 && (
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {/* Card Grid */}
        {images.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/10">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400">
              <Images className="w-7 h-7 text-cyan-400/70" />
            </div>
            <h3 className="font-semibold text-base text-white mb-1">
              No images uploaded yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Drag & drop images above or click to browse. Each image gets an instant public HTTPS URL card!
            </p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12 border border-slate-800 rounded-xl bg-slate-900/20">
            <p className="text-sm text-slate-400">
              No images match your search filter "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onCopyUrl={handleCopyUrl}
                onDelete={handleDeleteImage}
                onPreview={setPreviewImage}
              />
            ))}
          </div>
        )}

      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        FlareDrop • Real Public Image CDN & Cloudflare Vault
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={cfConfig}
        onSaveConfig={handleSaveConfig}
        onClearAllImages={handleClearAll}
      />

      <LightboxModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
        onCopyUrl={handleCopyUrl}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
