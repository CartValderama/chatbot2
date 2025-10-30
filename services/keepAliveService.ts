import { supabase } from '@/api/supabaseClient';

/**
 * Standalone Keep-Alive Service for Supabase
 *
 * This service can be used independently of React hooks, making it suitable for:
 * - Server-side keep-alive (API routes, server components)
 * - Non-React environments
 * - Advanced use cases requiring manual control
 *
 * BENEFITS OVER HOOK:
 * - More control over start/stop lifecycle
 * - Can be used in API routes or server-side code
 * - Single global instance prevents duplicate pings
 * - Better for testing and debugging
 */

interface KeepAliveServiceConfig {
  /** Interval in milliseconds (default: 5 minutes) */
  interval?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom ping function (advanced usage) */
  customPing?: () => Promise<void>;
}

class SupabaseKeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private config: Required<Omit<KeepAliveServiceConfig, 'customPing'>> & {
    customPing?: () => Promise<void>;
  };
  private isRunning = false;
  private lastPingTime: Date | null = null;
  private pingCount = 0;

  constructor() {
    this.config = {
      interval: 300000, // 5 minutes default
      debug: false,
    };
  }

  /**
   * Starts the keep-alive service
   * @param config - Configuration options
   * @returns true if started successfully, false if already running
   */
  start(config: KeepAliveServiceConfig = {}): boolean {
    if (this.isRunning) {
      if (config.debug || this.config.debug) {
        console.warn('[Keep-Alive Service] Already running');
      }
      return false;
    }

    // Merge config with defaults
    this.config = {
      interval: config.interval ?? 300000,
      debug: config.debug ?? false,
      customPing: config.customPing,
    };

    // Validate interval
    if (this.config.interval < 60000) {
      console.warn('[Keep-Alive Service] Interval too short. Minimum recommended: 60000ms (1 minute)');
      this.config.interval = 60000;
    }

    this.isRunning = true;

    if (this.config.debug) {
      console.log('[Keep-Alive Service] Starting with config:', {
        interval: this.config.interval / 1000 + 's',
        debug: this.config.debug,
      });
    }

    // Perform initial ping
    this.performPing();

    // Schedule recurring pings
    this.intervalId = setInterval(() => {
      this.performPing();
    }, this.config.interval);

    return true;
  }

  /**
   * Stops the keep-alive service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;

    if (this.config.debug) {
      console.log('[Keep-Alive Service] Stopped. Total pings:', this.pingCount);
    }
  }

  /**
   * Performs a single ping operation
   * This method can be called manually for testing or one-off pings
   */
  async performPing(): Promise<boolean> {
    try {
      // Use custom ping if provided, otherwise use default
      if (this.config.customPing) {
        await this.config.customPing();
      } else {
        // Default ping: lightweight auth session check
        const { error } = await supabase.auth.getSession();

        if (error) {
          if (this.config.debug) {
            console.warn('[Keep-Alive Service] Ping warning:', error.message);
          }
          return false;
        }
      }

      // Update metrics
      this.lastPingTime = new Date();
      this.pingCount++;

      if (this.config.debug) {
        console.log('[Keep-Alive Service] Ping #' + this.pingCount + ' successful at',
          this.lastPingTime.toISOString());
      }

      return true;
    } catch (err) {
      if (this.config.debug) {
        console.error('[Keep-Alive Service] Ping error:', err);
      }
      return false;
    }
  }

  /**
   * Gets the current status of the service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.config.interval,
      lastPingTime: this.lastPingTime,
      pingCount: this.pingCount,
      nextPingIn: this.lastPingTime && this.isRunning
        ? this.config.interval - (Date.now() - this.lastPingTime.getTime())
        : null,
    };
  }

  /**
   * Resets ping statistics
   */
  resetStats(): void {
    this.pingCount = 0;
    this.lastPingTime = null;
  }
}

// Export singleton instance
export const keepAliveService = new SupabaseKeepAliveService();

/**
 * USAGE EXAMPLES:
 *
 * 1. Basic usage in app initialization:
 * ```ts
 * import { keepAliveService } from '@/services/keepAliveService';
 *
 * keepAliveService.start({ interval: 300000, debug: true });
 * ```
 *
 * 2. In Next.js API route to keep alive server-side:
 * ```ts
 * // app/api/keep-alive/route.ts
 * import { keepAliveService } from '@/services/keepAliveService';
 *
 * export async function GET() {
 *   const status = keepAliveService.getStatus();
 *   return Response.json(status);
 * }
 * ```
 *
 * 3. With custom ping function:
 * ```ts
 * keepAliveService.start({
 *   interval: 300000,
 *   customPing: async () => {
 *     // Custom lightweight query
 *     await supabase.from('health_check').select('id').limit(1);
 *   }
 * });
 * ```
 *
 * 4. Check status:
 * ```ts
 * const status = keepAliveService.getStatus();
 * console.log('Service running:', status.isRunning);
 * console.log('Total pings:', status.pingCount);
 * console.log('Next ping in:', status.nextPingIn, 'ms');
 * ```
 */
