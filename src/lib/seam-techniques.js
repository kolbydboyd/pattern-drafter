/**
 * Returns a detailed, beginner-friendly instruction string for a flat-felled seam.
 *
 * A flat-felled seam encloses both raw edges inside the fold, leaving two parallel
 * rows of topstitching on the right side. It is standard in denim, workwear, and
 * tailored shirts because it is extremely durable and requires no serger.
 *
 * @param {object} opts
 * @param {string} opts.seam        - e.g. "shoulder seam", "side seam", "inseam"
 * @param {string} opts.sa          - full seam allowance, e.g. "⅝″" or "⅜″"
 * @param {string} opts.pressDir    - direction to press both SAs first, e.g. "back", "front", "yoke"
 * @param {string} opts.trimSide    - which SA ends up underneath and gets trimmed, e.g. "front", "back"
 * @param {string} opts.foldSide    - which SA folds over to enclose the trimmed one, e.g. "back", "front"
 * @param {string} opts.trimTo      - how much to trim the inner SA, e.g. "3/16″"
 * @param {string} opts.row1        - first topstitch row distance from fold, e.g. "⅛″"
 * @param {string} opts.row2        - second topstitch row distance from fold, e.g. "¼″"
 * @param {string} opts.thread      - thread description, e.g. "matching", "gold", "contrasting"
 * @param {string} [opts.extraTip]  - optional seam-specific extra tip sentence
 * @returns {string}
 */
export function flatFelledSeam({ seam, sa, pressDir, trimSide, foldSide, trimTo, row1, row2, thread, extraTip = '' }) {
  const tipSentence = extraTip ? ` ${extraTip}` : '';
  return (
    `A flat-felled seam encloses both raw edges inside the fold, leaving two parallel rows of topstitching visible from the right side. It is the standard finish for denim and workwear: extremely durable, no serger needed, and clean on both sides.\n\n` +
    `Sew the ${seam} right sides together at ${sa}. Press both seam allowances toward the ${pressDir}. You now have two SAs lying on top of each other on the ${pressDir} side.\n\n` +
    `Look at those two SAs from the inside: one is on top (the ${foldSide} SA) and one is underneath (the ${trimSide} SA). Trim only the LOWER, underneath SA — the ${trimSide} SA — down to ${trimTo}. Leave the ${foldSide} SA at full width. This is the one you will fold over.\n\n` +
    `Fold the full-width ${foldSide} SA over the trimmed ${trimSide} SA so the folded edge completely covers the raw trimmed edge. The fold should land about ${row1} past the original seam line on the ${pressDir} side. ` +
    `Press this fold firmly with a hot iron — press in stages: first flatten the seam, then fold and press the fell. A clapper or a wooden seam roller helps on denim. Pin every 2–3 inches through all layers to hold the fold while you stitch.\n\n` +
    `From the RIGHT SIDE, topstitch the first row at ${row1} from the visible fold. This anchors the folded edge. Add a second row at ${row2} from the fold, running parallel to the first. Stitch slowly — denim and canvas are thick. Use a denim needle (size 16/100 or heavier) and ${thread} thread.\n\n` +
    `You will now see two parallel rows of topstitching on the right side and a clean enclosed ridge on the inside with no raw edges showing. Press from the right side with steam to flatten and set the stitches.\n\n` +
    `Tip: before stitching, draw chalk lines at ${row1} and ${row2} from the fold, or use the edge of your presser foot as a guide for the first row and a piece of masking tape on the needle plate as a guide for the second.${tipSentence}`
  );
}
