import { FlightProvider, FlightProviderMode } from "./supplier-types";
import { TBOProvider } from "./tbo-provider";
import { ManualProvider } from "./manual-provider";

/**
 * Supplier-Agnostic Flight Provider Registry & Factory
 *
 * Current Phase Priority:
 * - TBO API credentials are NOT available yet (Application ID: 238072).
 * - All TBO environment variables are OPTIONAL and not required for deployment.
 * - Default flightSearchMode is explicitly "MANUAL".
 * - When TBO is missing or unconfigured:
 *   - NEVER calls the TBO API
 *   - NEVER shows fake flight results or prices
 *   - Always routes to the "Get Best Fare" / Manual Flight Request workflow
 */
class FlightProviderService {
  private providers: Map<string, FlightProvider> = new Map();
  // Default flightSearchMode is explicitly set to MANUAL
  private flightSearchMode: FlightProviderMode = "MANUAL";
  private activeProviderCode: "TBO" | "MANUAL" = "MANUAL";

  constructor() {
    const tbo = new TBOProvider();
    const manual = new ManualProvider();

    this.providers.set("TBO", tbo);
    this.providers.set("MANUAL", manual);

    // Default flightSearchMode is always MANUAL at this stage
    this.flightSearchMode = "MANUAL";
    this.activeProviderCode = "MANUAL";
  }

  /**
   * Returns current active flightSearchMode ("MANUAL" by default)
   */
  getFlightSearchMode(): FlightProviderMode {
    return this.flightSearchMode;
  }

  /**
   * Configure flight search mode.
   * If TBO_API is requested but credentials are not configured, safely remains MANUAL.
   */
  setFlightSearchMode(mode: FlightProviderMode) {
    if (mode === "TBO_API") {
      const tbo = this.providers.get("TBO");
      if (tbo && tbo.isConfigured()) {
        this.flightSearchMode = "TBO_API";
        this.activeProviderCode = "TBO";
        return;
      }
    }
    this.flightSearchMode = "MANUAL";
    this.activeProviderCode = "MANUAL";
  }

  /**
   * Get provider instance.
   * If mode is MANUAL or TBO is unconfigured, always returns the ManualProvider.
   */
  getProvider(code?: "TBO" | "MANUAL"): FlightProvider {
    if (this.flightSearchMode === "MANUAL" && (!code || code === "TBO")) {
      const tbo = this.providers.get("TBO");
      if (code === "TBO" && tbo && tbo.isConfigured()) {
        return tbo;
      }
      return this.providers.get("MANUAL")!;
    }

    const targetCode = code || this.activeProviderCode;
    const provider = this.providers.get(targetCode);
    if (!provider || !provider.isConfigured()) {
      return this.providers.get("MANUAL")!;
    }
    return provider;
  }

  getActiveProviderCode(): "TBO" | "MANUAL" {
    return this.activeProviderCode;
  }

  getSupplierStatuses() {
    const tbo = this.providers.get("TBO") as TBOProvider;
    const manual = this.providers.get("MANUAL") as ManualProvider;

    const tboConfigured = tbo?.isConfigured() || false;

    return [
      {
        code: "TBO",
        name: "TBO Air API",
        status: tboConfigured ? "CONNECTED" : "NOT_CONNECTED",
        applicationId: "238072",
        statusNote: tboConfigured
          ? "Live API Credentials Active"
          : "Application ID 238072 submitted. Credentials pending activation. Manual mode active.",
        enabled: tboConfigured,
      },
      {
        code: "MANUAL",
        name: "Xeetrix Travel Desk",
        status: "CONNECTED",
        statusNote: "Operational 24/7. Primary booking mode for B2C & B2B requests.",
        enabled: true,
      },
    ];
  }
}

export const flightProviderService = new FlightProviderService();
