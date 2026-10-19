import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // Only the exact old seeded template is automated; retain real staff notes.
    function isGenericInterpretation(text) {
      return !text?.trim() || /^All markers show optimal health\.\s*Excellent baseline(?: for your treatment)?\.?$/i.test(text.trim());
    }

    let processed = 0;
    let priorityCorrected = 0;
    let interpretationCorrected = 0;
    let reviewerCleared = 0;
    let preserved = 0;
    let errors = 0;

    // Fetch all records in batches of 50
    let hasMore = true;
    let batchNum = 0;

    while (hasMore) {
      const batch = await base44.asServiceRole.entities.BiomarkerResult.list('-created_date', 50, batchNum * 50);
      batchNum++;

      if (!batch || batch.length === 0) {
        hasMore = false;
        break;
      }

      const updates = [];

      for (const b of batch) {
        try {
          const hMin = typeof b.general_health_min === "number" ? b.general_health_min : null;
          const hMax = typeof b.general_health_max === "number" ? b.general_health_max : null;
          const bMin = typeof b.bato_target_min === "number" ? b.bato_target_min : null;
          const bMax = typeof b.bato_target_max === "number" ? b.bato_target_max : null;
          const val = b.current_value;
          const dir = b.marker_direction || "middle_range";

          // ── Compute new is_priority ──
          let newPriority = false;
          if (hMin !== null && hMax !== null && hMin < hMax) {
            if (val < hMin || val > hMax) newPriority = true;
          }

          const oldPriority = !!b.is_priority;
          const priorityChanged = oldPriority !== newPriority;

          // ── Check if interpretation is generic/auto-seeded ──
          const hasGenericText = isGenericInterpretation(b.staff_interpretation);

          // If the interpretation is generic, treat as auto-generated regardless of review_status
          // — these were auto-seeded and incorrectly marked as reviewed
          const needsAutoInterp = hasGenericText || !b.review_status || b.review_status === "pending_review";

          let newInterpretation = b.staff_interpretation;
          let interpretationChanged = false;
          let shouldResetReview = false;

          if (needsAutoInterp) {
            const generated = generateAutoInterpretation(b, val, dir, hMin, hMax, bMin, bMax);
            if (generated !== b.staff_interpretation) {
              newInterpretation = generated;
              interpretationChanged = true;
            }
            // Reset review status for generic/auto records — they were never genuinely reviewed
            if (hasGenericText && b.review_status !== "pending_review") {
              shouldResetReview = true;
            }
          }

          if (priorityChanged || interpretationChanged || shouldResetReview) {
            const update = { id: b.id };
            if (priorityChanged) update.is_priority = newPriority;
            if (interpretationChanged) update.staff_interpretation = newInterpretation;
            if (shouldResetReview) {
              update.review_status = "pending_review";
              update.reviewed_by = null;
              update.reviewed_date = null;
              reviewerCleared++;
            }
            updates.push(update);

            if (priorityChanged) priorityCorrected++;
            if (interpretationChanged) interpretationCorrected++;
          } else {
            preserved++;
          }

          processed++;
        } catch (e) {
          errors++;
          processed++;
        }
      }

      if (updates.length > 0) {
        await base44.asServiceRole.entities.BiomarkerResult.bulkUpdate(updates);
      }

      hasMore = batch.length === 50;
    }

    return Response.json({
      status: "success",
      processed,
      priorityCorrected,
      interpretationCorrected,
      reviewerCleared,
      preservedManual: preserved,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateAutoInterpretation(b, val, dir, hMin, hMax, bMin, bMax) {
  const unit = b.unit || "";
  const valStr = `${val} ${unit}`.trim();
  const hasBato = bMin !== null && bMax !== null && bMin < bMax;
  const parts = [];

  if (hMin === null || hMax === null || hMin >= hMax) {
    parts.push(`${valStr}. The reference range for this marker is not yet available — BATO staff review is needed.`);
  } else if (val < hMin) {
    parts.push(`${valStr}. This result is below the listed general reference range of ${hMin}–${hMax} ${unit}.`);
  } else if (val > hMax) {
    parts.push(`${valStr}. This result is above the listed general reference range of ${hMin}–${hMax} ${unit}.`);
  } else if (hasBato && val >= bMin && val <= bMax) {
    parts.push(`${valStr}. This result is within BATO's preferred treatment-support range of ${bMin}–${bMax} ${unit}.`);
  } else if (hasBato && val < bMin) {
    parts.push(`${valStr}. This result is within the listed general reference range (${hMin}–${hMax} ${unit}) but below BATO's preferred treatment-support range of ${bMin}–${bMax} ${unit}.`);
  } else if (hasBato && val > bMax) {
    parts.push(`${valStr}. This result is within the listed general reference range (${hMin}–${hMax} ${unit}) but above BATO's preferred treatment-support range of ${bMin}–${bMax} ${unit}.`);
  } else {
    parts.push(`${valStr}. This result is within the listed general reference range.`);
  }

  const statusKey = getStatusKey(val, hMin, hMax, bMin, bMax);

  if (statusKey === "within_bato_target") {
    if (dir === "higher_until_limit") parts.push("This result is within BATO's preferred support range.");
    else if (dir === "lower_is_better") parts.push("This result is within BATO's preferred range.");
    else parts.push("The result is within the preferred range.");
  } else if (statusKey === "below_bato_target") {
    if (dir === "higher_until_limit") parts.push("This result is below BATO's preferred support range.");
    else if (dir === "lower_is_better") parts.push("Lower values may generally be preferred for this marker, but the result should still remain within an appropriate clinical range.");
    else parts.push("The result is below the preferred range.");
  } else if (statusKey === "above_bato_target") {
    if (dir === "higher_until_limit") parts.push("This result is above the listed target range and should be interpreted in context.");
    else if (dir === "lower_is_better") parts.push("This result is above BATO's preferred range.");
    else parts.push("The result is above the preferred range.");
  }

  if (statusKey === "outside_general_range") {
    parts.push("BATO staff or an appropriate clinician should review this result.");
  } else if (statusKey === "needs_review") {
    parts.push("BATO staff review is recommended.");
  }

  parts.push("This result should be interpreted together with your full medical history and other laboratory findings. It is not a diagnosis.");

  return parts.join(" ");
}

function getStatusKey(val, hMin, hMax, bMin, bMax) {
  if (hMin === null || hMax === null || hMin >= hMax) return "needs_review";
  if (val < hMin || val > hMax) return "outside_general_range";
  const hasBato = bMin !== null && bMax !== null && bMin < bMax;
  if (!hasBato) return "needs_review";
  if (val >= bMin && val <= bMax) return "within_bato_target";
  if (val < bMin) return "below_bato_target";
  if (val > bMax) return "above_bato_target";
  return "needs_review";
}