import { NextResponse } from "next/server";
import { getCookedMetrics, SHARED_METRICS } from "@/lib/cooked-feeds";
import { getLenses } from "@/lib/data";

/**
 * GET /api/cooked
 * Public endpoint — returns all cooked metrics + shared lens metrics.
 * Used by the Are We Cooked site to fetch its data.
 * No auth required (read-only, public data).
 */
export async function GET() {
  try {
    // Get dedicated cooked metrics
    const cookedMetrics = await getCookedMetrics();

    // Get shared metrics from Crisis Index lenses
    const lenses = await getLenses();
    const lensMap = new Map(lenses.map((l) => [l.id, l]));

    const sharedMetrics = SHARED_METRICS.map((def) => {
      const lens = lensMap.get(def.lensId);
      if (!lens) return null;
      const metric = lens.metrics.find((m) => m.label === def.metricLabel);
      if (!metric) return null;

      return {
        id: def.cookedId,
        bucket: def.bucket,
        label: def.label,
        value: metric.value,
        num: metric.num,
        spectrumMin: def.spectrumMin,
        spectrumMax: def.spectrumMax,
        invert: def.invert,
        feedId: metric.feedId || null,
        sourceLabel: "Crisis Index",
        updatedAt: null,
        dataDate: null,
      };
    }).filter(Boolean);

    return NextResponse.json({
      metrics: [...cookedMetrics, ...sharedMetrics],
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Cooked API] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cooked metrics" },
      { status: 500 }
    );
  }
}
