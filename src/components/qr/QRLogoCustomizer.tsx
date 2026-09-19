import React, { useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Check,
  X,
  Circle,
  Square,
  Sparkles,
  Link as LinkIcon,
  Globe,
  ShoppingBag,
  Scan,
  Sliders,
} from 'lucide-react';
import {
  type QRLogoSettings,
  LOGO_PRESETS,
  type LogoShape,
} from '../../lib/qrLogo';

interface QRLogoCustomizerProps {
  settings: QRLogoSettings;
  onChange: (newSettings: QRLogoSettings) => void;
  className?: string;
}

const COLOR_OPTIONS = [
  { label: 'Emerald Green', value: '#059669' },
  { label: 'Indigo Brand', value: '#4f46e5' },
  { label: 'Royal Blue', value: '#2563eb' },
  { label: 'Amber Gold', value: '#d97706' },
  { label: 'Purple Store', value: '#7c3aed' },
  { label: 'Dark Slate', value: '#0f172a' },
  { label: 'Clean White', value: '#ffffff' },
];

const SIZE_PRESETS = [
  { label: 'Compact', value: 16 },
  { label: 'Standard', value: 22 },
  { label: 'Large', value: 28 },
];

export const QRLogoCustomizer: React.FC<QRLogoCustomizerProps> = ({
  settings,
  onChange,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleToggle = (enabled: boolean) => {
    onChange({
      ...settings,
      enabled,
    });
  };

  const handlePresetSelect = (presetId: 'link' | 'globe' | 'sparkles' | 'shopping' | 'qr') => {
    const preset = LOGO_PRESETS.find((p) => p.id === presetId);
    onChange({
      ...settings,
      enabled: true,
      type: 'preset',
      presetId,
      bgColor: preset?.defaultBg || '#059669',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit file size to 2MB for base64 storage
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        ...settings,
        enabled: true,
        type: 'custom',
        customImage: dataUrl,
        bgColor: settings.bgColor || '#ffffff',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomImage = () => {
    onChange({
      ...settings,
      type: 'preset',
      presetId: 'link',
      customImage: undefined,
      bgColor: '#059669',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShapeChange = (shape: LogoShape) => {
    onChange({
      ...settings,
      shape,
    });
  };

  const handleColorChange = (bgColor: string) => {
    onChange({
      ...settings,
      bgColor,
    });
  };

  const handleSizeChange = (sizePercent: number) => {
    onChange({
      ...settings,
      sizePercent,
    });
  };

  const currentSize = settings.sizePercent || 22;

  return (
    <div className={`space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 ${className}`}>
      {/* Header with Enable Switch */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
              Center Emblem / Logo
            </h4>
            <p className="text-[11px] text-slate-500">
              Add a brand emblem or link icon in the center of the QR
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* Preset Badges: Responsive grid with clean horizontal card styling to prevent narrow squishing */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Preset Badges
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Preset 1: Green Link (Matches user screenshot) */}
              <button
                type="button"
                onClick={() => handlePresetSelect('link')}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  settings.type === 'preset' && settings.presetId === 'link'
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate">Link (Green)</span>
              </button>

              {/* Preset 2: Website / Globe */}
              <button
                type="button"
                onClick={() => handlePresetSelect('globe')}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  settings.type === 'preset' && settings.presetId === 'globe'
                    ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-6 h-6 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate">Website</span>
              </button>

              {/* Preset 3: Sparkles / Star */}
              <button
                type="button"
                onClick={() => handlePresetSelect('sparkles')}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  settings.type === 'preset' && settings.presetId === 'sparkles'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-6 h-6 shrink-0 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate">Special</span>
              </button>

              {/* Preset 4: Store / Shopping */}
              <button
                type="button"
                onClick={() => handlePresetSelect('shopping')}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  settings.type === 'preset' && settings.presetId === 'shopping'
                    ? 'bg-white border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-6 h-6 shrink-0 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate">Store</span>
              </button>

              {/* Preset 5: Scan Icon */}
              <button
                type="button"
                onClick={() => handlePresetSelect('qr')}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                  settings.type === 'preset' && settings.presetId === 'qr'
                    ? 'bg-white border-slate-900 ring-2 ring-slate-900/20 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="w-6 h-6 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Scan className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate">Scan Me</span>
              </button>
            </div>
          </div>

          {/* Custom Upload Option */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Or Upload Custom Brand Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            {settings.type === 'custom' && settings.customImage ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-300 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-1">
                    <img
                      src={settings.customImage}
                      alt="Custom logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Custom Logo Uploaded
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active in Center
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCustomImage}
                    title="Remove custom logo"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/30 transition-all rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white"
              >
                <Upload className="w-4 h-4" />
                <span>Upload PNG, JPG, or SVG Logo</span>
              </button>
            )}
          </div>

          {/* Height & Size Adjustment Section */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                Logo Height & Size Adjustment
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {currentSize}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={14}
                max={30}
                step={1}
                value={currentSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                <span>Small (14%)</span>
                <span className="text-emerald-700 font-semibold">Recommended (22%)</span>
                <span>Large (30%)</span>
              </div>
            </div>

            {/* Quick Size Preset Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {SIZE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleSizeChange(p.value)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all border ${
                    currentSize === p.value
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.label} ({p.value}%)
                </button>
              ))}
            </div>
          </div>

          {/* Emblem Shape & Color Options */}
          <div className="space-y-3 pt-2 border-t border-slate-200/70">
            {/* Shape Selection */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Emblem Shape
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleShapeChange('circle')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                    settings.shape === 'circle'
                      ? 'bg-white border-slate-900 text-slate-900 shadow-xs ring-1 ring-slate-900/10'
                      : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Circle className="w-4 h-4 text-emerald-600" /> Circle
                </button>
                <button
                  type="button"
                  onClick={() => handleShapeChange('square')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                    settings.shape === 'square'
                      ? 'bg-white border-slate-900 text-slate-900 shadow-xs ring-1 ring-slate-900/10'
                      : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Square className="w-4 h-4 text-emerald-600" /> Rounded Square
                </button>
              </div>
            </div>

            {/* Background Color Selection */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Badge Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((color) => {
                  const isSelected = settings.bgColor === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      title={color.label}
                      onClick={() => handleColorChange(color.value)}
                      style={{ backgroundColor: color.value }}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110 shadow-xs'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            color.value === '#ffffff' ? 'text-slate-900' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
