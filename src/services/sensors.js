const SENSOR_API_BASE = import.meta.env.VITE_SENSOR_API_BASE ?? "http://127.0.0.1:5000";
const WEIGHT_ENDPOINT = import.meta.env.VITE_SENSOR_WEIGHT_ENDPOINT ?? "/sensor/weight";
const HEIGHT_ENDPOINT = import.meta.env.VITE_SENSOR_HEIGHT_ENDPOINT ?? "/sensor/height";
const SENSOR_TIMEOUT_MS = Number(import.meta.env.VITE_SENSOR_TIMEOUT_MS ?? 6000);

export class SensorApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "SensorApiError";
  }
}

function joinUrl(base, path) {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getNumberFromPayload(payload, keys) {
  if (typeof payload === "number" && Number.isFinite(payload)) return payload;
  if (!payload || typeof payload !== "object") return null;

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  if (payload.data && typeof payload.data === "object") {
    for (const key of keys) {
      const value = payload.data[key];
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
        return Number(value);
      }
    }
  }

  return null;
}

async function requestSensorValue(endpoint, keys, signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SENSOR_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (signal) signal.addEventListener("abort", onAbort, { once: true });

  try {
    const response = await fetch(joinUrl(SENSOR_API_BASE, endpoint), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new SensorApiError(`Sensor API failed with HTTP ${response.status}`);
    }

    const payload = await response.json();
    const value = getNumberFromPayload(payload, keys);
    if (value == null) {
      throw new SensorApiError("Sensor API returned no numeric value");
    }
    return value;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new SensorApiError("Sensor request timed out");
    }
    if (error instanceof SensorApiError) throw error;
    throw new SensorApiError("Could not connect to sensor API");
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

export async function readWeightKg(signal) {
  const value = await requestSensorValue(WEIGHT_ENDPOINT, ["weightKg", "weight", "kg", "value"], signal);
  return Number(value.toFixed(1));
}

export async function readHeightCm(signal) {
  const value = await requestSensorValue(HEIGHT_ENDPOINT, ["heightCm", "height", "cm", "value"], signal);
  return Math.round(value);
}
