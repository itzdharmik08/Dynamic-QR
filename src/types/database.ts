import type { QRLogoSettings } from '../lib/qrLogo';

export type QRStatus = 'active' | 'inactive';

export interface DynamicQR {
  id: string;
  user_id?: string | null;
  qr_code: string;
  title: string;
  destination_url: string;
  status: QRStatus;
  scan_count: number;
  logo_settings?: QRLogoSettings;
  created_at: string;
  updated_at: string;
}

export interface CreateQRInput {
  title?: string;
  destination_url: string;
  status?: QRStatus;
  qr_code?: string;
  logo_settings?: QRLogoSettings;
}

export interface UpdateQRInput {
  title?: string;
  destination_url?: string;
  status?: QRStatus;
  logo_settings?: QRLogoSettings;
}

export interface QRStats {
  total: number;
  active: number;
  inactive: number;
  totalScans: number;
}
