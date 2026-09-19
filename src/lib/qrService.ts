import { supabase, isSupabaseConfigured } from './supabase';
import type { DynamicQR, CreateQRInput, UpdateQRInput, QRStats } from '../types/database';
import { generateShortCode, normalizeUrl } from './utils';
import { DEFAULT_LOGO_SETTINGS } from './qrLogo';

export let isTableMissingInSupabase = false;

// Default initial seed data for local in-memory testing
const INITIAL_DEMO_DATA: DynamicQR[] = [
  {
    id: 'demo-1-uuid',
    user_id: 'demo-user',
    qr_code: 'DEMO123',
    title: 'Product 001 Showcase',
    destination_url: 'https://example.com/product-1',
    status: 'active',
    scan_count: 5,
    logo_settings: DEFAULT_LOGO_SETTINGS,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'demo-2-uuid',
    user_id: 'demo-user',
    qr_code: 'SUMMER24',
    title: 'Summer Sale Promo',
    destination_url: 'https://example.com/summer-sale',
    status: 'active',
    scan_count: 18,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'demo-3-uuid',
    user_id: 'demo-user',
    qr_code: 'ARCHIVE9',
    title: 'Outdated Winter Campaign',
    destination_url: 'https://example.com/winter-archive',
    status: 'inactive',
    scan_count: 32,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

// In-memory runtime storage for demo / fallback mode
// STRICT SECURITY POLICY: We NEVER persist QR database records, destination URLs, or user data into localStorage or sessionStorage
let inMemoryData: DynamicQR[] = [...INITIAL_DEMO_DATA];

function getLocalData(): DynamicQR[] {
  return [...inMemoryData];
}

function saveLocalData(data: DynamicQR[]): void {
  inMemoryData = [...data];
}

function isMissingTableError(err: unknown): boolean {
  if (!err) return false;
  const msg = (err && typeof err === 'object' && 'message' in err)
    ? String((err as { message: string }).message)
    : String(err);
  return msg.includes('schema cache') || msg.includes('does not exist') || msg.includes('dynamic_qrs');
}

export const qrService = {
  /**
   * Check if the remote table is missing
   */
  getIsTableMissing(): boolean {
    return isTableMissingInSupabase;
  },

  /**
   * Reset status so subsequent calls will retry querying Supabase
   */
  resetTableMissingStatus(): void {
    isTableMissingInSupabase = false;
  },

  /**
   * Fetch all QR codes for current user (or fallback to local storage)
   */
  async getQRs(userId?: string): Promise<DynamicQR[]> {
    // Require authenticated user ID so unauthenticated callers receive zero records
    if (!userId) {
      return [];
    }

    if (isSupabaseConfigured && supabase && !isTableMissingInSupabase) {
      try {
        const { data, error } = await supabase
          .from('dynamic_qrs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) {
          if (isMissingTableError(error)) {
            console.warn('Supabase dynamic_qrs table not found. Using local fallback store.');
            isTableMissingInSupabase = true;
          } else {
            throw new Error(error.message);
          }
        } else {
          isTableMissingInSupabase = false;
          return (data || []) as DynamicQR[];
        }
      } catch (err) {
        if (isMissingTableError(err)) {
          isTableMissingInSupabase = true;
        } else {
          throw err;
        }
      }
    }

    // Local fallback
    const items = getLocalData();
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Get single QR by internal UUID
   */
  async getQRById(id: string): Promise<DynamicQR | null> {
    if (isSupabaseConfigured && supabase && !isTableMissingInSupabase) {
      try {
        const { data, error } = await supabase
          .from('dynamic_qrs')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          if (isMissingTableError(error)) {
            isTableMissingInSupabase = true;
          } else {
            throw new Error(error.message);
          }
        } else {
          return data as DynamicQR | null;
        }
      } catch (err) {
        if (isMissingTableError(err)) {
          isTableMissingInSupabase = true;
        } else {
          throw err;
        }
      }
    }

    // Local fallback
    const items = getLocalData();
    return items.find((item) => item.id === id) || null;
  },

  /**
   * Get single QR by public shortcode (used by /q/:code and scanner)
   */
  async getQRByCode(code: string): Promise<DynamicQR | null> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured && supabase && !isTableMissingInSupabase) {
      try {
        const { data, error } = await supabase
          .from('dynamic_qrs')
          .select('*')
          .ilike('qr_code', cleanCode)
          .maybeSingle();

        if (error) {
          if (isMissingTableError(error)) {
            isTableMissingInSupabase = true;
          } else {
            throw new Error(error.message);
          }
        } else {
          return data as DynamicQR | null;
        }
      } catch (err) {
        if (isMissingTableError(err)) {
          isTableMissingInSupabase = true;
        } else {
          throw err;
        }
      }
    }

    // Local fallback
    const items = getLocalData();
    return items.find((item) => item.qr_code.toUpperCase() === cleanCode) || null;
  },

  /**
   * Create a new dynamic QR
   */
  async createQR(input: CreateQRInput, userId?: string): Promise<DynamicQR> {
    const code = (input.qr_code && input.qr_code.trim())
      ? input.qr_code.trim().toUpperCase()
      : generateShortCode();

    const normalizedDest = normalizeUrl(input.destination_url);

    if (isSupabaseConfigured && supabase && !isTableMissingInSupabase) {
      try {
        const payload: Record<string, unknown> = {
          qr_code: code,
          title: input.title?.trim() || `QR-${code}`,
          destination_url: normalizedDest,
          status: input.status || 'active',
          scan_count: 0,
        };

        if (input.logo_settings !== undefined) {
          payload.logo_settings = input.logo_settings;
        }

        if (userId) {
          payload.user_id = userId;
        }

        let result = await supabase
          .from('dynamic_qrs')
          .insert([payload])
          .select()
          .single();

        // If remote database doesn't have logo_settings column yet, retry without it
        if (result.error && result.error.message?.includes('logo_settings')) {
          delete payload.logo_settings;
          result = await supabase
            .from('dynamic_qrs')
            .insert([payload])
            .select()
            .single();
        }

        if (result.error) {
          if (result.error.code === '23505') {
            throw new Error(`QR Code "${code}" is already taken. Please choose another code.`);
          }
          if (isMissingTableError(result.error)) {
            isTableMissingInSupabase = true;
          } else {
            throw new Error(result.error.message);
          }
        } else {
          return {
            ...(result.data as DynamicQR),
            logo_settings: input.logo_settings,
          };
        }
      } catch (err) {
        if (isMissingTableError(err)) {
          isTableMissingInSupabase = true;
        } else {
          throw err;
        }
      }
    }

    // Local fallback
    const items = getLocalData();
    if (items.some((item) => item.qr_code.toUpperCase() === code)) {
      throw new Error(`QR Code "${code}" already exists. Please choose a different code.`);
    }

    const newRecord: DynamicQR = {
      id: window.crypto.randomUUID ? window.crypto.randomUUID() : `local-${Date.now()}`,
      user_id: userId || 'demo-user',
      qr_code: code,
      title: input.title?.trim() || `QR-${code}`,
      destination_url: normalizedDest,
      status: input.status || 'active',
      scan_count: 0,
      logo_settings: input.logo_settings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    items.unshift(newRecord);
    saveLocalData(items);
    return newRecord;
  },

  /**
   * Update destination, title, status, or logo settings of an existing QR
   */
  async updateQR(id: string, input: UpdateQRInput): Promise<DynamicQR> {
    const updates: Partial<DynamicQR> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.destination_url !== undefined) updates.destination_url = normalizeUrl(input.destination_url);
    if (input.status !== undefined) updates.status = input.status;
    if (input.logo_settings !== undefined) updates.logo_settings = input.logo_settings;

    if (isSupabaseConfigured && supabase && !isTableMissingInSupabase) {
      try {
        let result = await supabase
          .from('dynamic_qrs')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        // If remote database doesn't have logo_settings column yet, retry without it
        if (result.error && result.error.message?.includes('logo_settings')) {
          const fallbackUpdates = { ...updates };
          delete fallbackUpdates.logo_settings;
          result = await supabase
            .from('dynamic_qrs')
            .update(fallbackUpdates)
            .eq('id', id)
            .select()
            .single();
        }

        if (result.error) {
          if (isMissingTableError(result.error)) {
            isTableMissingInSupabase = true;
          } else {
            throw new Error(result.error.message);
          }
        } else {
          return {
            ...(result.data as DynamicQR),
            ...(input.logo_settings !== undefined ? { logo_settings: input.logo_settings } : {}),
          };
        }
      } catch (err) {
        if (isMissingTableError(err)) {
          isTableMissingInSupabase = true;
        } else {
          throw err;
        }
      }
    }

    // Local fallback
    const items = getLocalData();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('QR record not found');

    const updated = {
      ...items[index],
      ...updates,
    };
    items[index] = updated;
    saveLocalData(items);
    return updated;
  },

  /**
   * Delete a QR record
   */
  async deleteQR(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase && !isTableMissingInSupabase) {
      try {
        const { error } = await supabase
          .from('dynamic_qrs')
          .delete()
          .eq('id', id);

        if (error) {
          if (isMissingTableError(error)) {
            isTableMissingInSupabase = true;
          } else {
            throw new Error(error.message);
          }
        } else {
          return;
        }
      } catch (err) {
        if (isMissingTableError(err)) {
          isTableMissingInSupabase = true;
        } else {
          throw err;
        }
      }
    }

    // Local fallback
    const items = getLocalData().filter((item) => item.id !== id);
    saveLocalData(items);
  },

  /**
   * Atomically increment the scan count when a QR is scanned
   */
  async incrementScanCount(code: string): Promise<void> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured && supabase && !isTableMissingInSupabase) {
      try {
        const { error: rpcError } = await supabase.rpc('increment_scan_count', {
          qr_code_param: cleanCode,
        });

        if (rpcError) {
          await supabase
            .from('dynamic_qrs')
            .update({ updated_at: new Date().toISOString() })
            .ilike('qr_code', cleanCode);
        }
        return;
      } catch {
        // ignore and fallback
      }
    }

    // Local fallback
    const items = getLocalData();
    const index = items.findIndex((item) => item.qr_code.toUpperCase() === cleanCode);
    if (index !== -1 && items[index].status === 'active') {
      items[index].scan_count += 1;
      items[index].updated_at = new Date().toISOString();
      saveLocalData(items);
    }
  },

  /**
   * Aggregate statistics
   */
  async getStats(userId?: string): Promise<QRStats> {
    if (!userId) {
      return { total: 0, active: 0, inactive: 0, totalScans: 0 };
    }
    const qrs = await this.getQRs(userId);
    const total = qrs.length;
    const active = qrs.filter((q) => q.status === 'active').length;
    const inactive = qrs.filter((q) => q.status === 'inactive').length;
    const totalScans = qrs.reduce((acc, curr) => acc + (curr.scan_count || 0), 0);

    return { total, active, inactive, totalScans };
  }
};
