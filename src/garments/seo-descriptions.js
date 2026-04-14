// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * SEO descriptions and FAQ content for each garment.
 * Used by the build-time pre-rendering script and pattern-page.js.
 */

const SEO_DESCRIPTIONS = {
  'cargo-shorts': {
    metaDescription: 'Draft a custom-fit cargo shorts sewing pattern from your exact measurements. Patch pockets, adjustable inseam, and relaxed fit - all sized to your body. Tiled PDF included.',
    pageIntro: 'Roomy cargo shorts with patch pockets, drafted to your waist, hip, and inseam measurements. Choose your inseam length and pocket placement for a pair that fits exactly how you want.',
    faq: [
      { q: 'What fabric works best for cargo shorts?', a: 'Medium-weight cotton twill, canvas, or ripstop are ideal. A fabric with some body holds the pocket shape well.' },
      { q: 'How much ease is built into the pattern?', a: 'The cargo shorts include generous wearing ease for a relaxed fit. Your exact waist, hip, and thigh measurements are used as the starting point.' },
    ],
  },
  'gym-shorts': {
    metaDescription: 'Generate a custom-fit gym shorts sewing pattern built to your measurements. Elastic waist, side pockets, and adjustable inseam length. Beginner-friendly tiled PDF.',
    pageIntro: 'Simple elastic-waist gym shorts drafted to your waist and hip measurements. A great beginner project with minimal pieces and a comfortable, relaxed fit.',
    faq: [
      { q: 'Can I use knit fabric for gym shorts?', a: 'Yes - athletic knits, jersey, or woven fabrics like nylon and polyester all work well. The elastic waist accommodates stretch and non-stretch fabrics.' },
      { q: 'How do I choose the right inseam length?', a: 'The pattern lets you set your preferred inseam. A 5-inch inseam hits mid-thigh, while 7-9 inches sits closer to the knee.' },
    ],
  },
  'swim-trunks': {
    metaDescription: 'Create custom-fit swim trunks from your exact body measurements. Elastic waistband, mesh liner option, and adjustable length. Beginner-friendly sewing pattern as tiled PDF.',
    pageIntro: 'Swim trunks drafted to your waist and hip measurements with an elastic waistband. Choose your preferred length and customize the fit for a pair that stays comfortable in and out of the water.',
    faq: [
      { q: 'What fabric should I use for swim trunks?', a: 'Board short fabric (polyester or nylon with a DWR finish) is the standard choice. Look for fabric with 2-way stretch for comfort.' },
      { q: 'Do I need a serger to sew swim trunks?', a: 'A serger gives the cleanest finish on swimwear fabric, but you can use a zigzag stitch or stretch stitch on a regular sewing machine.' },
    ],
  },
  'pleated-shorts': {
    metaDescription: 'Draft custom-fit pleated shorts from your body measurements. Single or double front pleats, tailored waistband, and zip fly. Tiled PDF sewing pattern.',
    pageIntro: 'Tailored pleated shorts with a structured waistband, drafted from your waist, hip, and rise measurements. Front pleats add room through the thigh for a polished, comfortable fit.',
    faq: [
      { q: 'What is the difference between single and double pleats?', a: 'Single pleats give a cleaner, more modern look. Double pleats add more room through the thigh and hip for a traditional, relaxed silhouette.' },
      { q: 'What fabric weight works for pleated shorts?', a: 'Medium-weight wovens like linen, cotton twill, or tropical wool hold the pleat shape and drape well.' },
    ],
  },
  'straight-jeans': {
    metaDescription: 'Generate a custom-fit straight jeans sewing pattern from your exact measurements. Five-pocket styling, zip fly, and straight leg. Tiled PDF with construction guide.',
    pageIntro: 'Classic five-pocket straight jeans drafted to your waist, hip, rise, inseam, and thigh measurements. Every panel is sized to your body for a true personal fit.',
    faq: [
      { q: 'What weight of denim should I use?', a: 'A 10-12 oz denim is the sweet spot for everyday jeans - sturdy enough for structure, light enough to sew on a home machine.' },
      { q: 'Do I need a special needle for denim?', a: 'Yes - use a denim/jeans needle (size 90/14 or 100/16) and a longer stitch length (3.0-3.5mm) for clean seams through thick layers.' },
    ],
  },
  'chinos': {
    metaDescription: 'Create custom-fit chinos from your body measurements. Flat-front, slash pockets, and a clean tapered leg. Tiled PDF sewing pattern with full instructions.',
    pageIntro: 'Flat-front chinos drafted from your waist, hip, rise, and inseam. Slash pockets and a tapered leg give a modern silhouette, all sized to your measurements.',
    faq: [
      { q: 'What fabric works best for chinos?', a: 'Cotton twill in a 7-10 oz weight is the classic choice. Stretch cotton twill (with 2-3% elastane) adds comfort.' },
      { q: 'How is the fit different from jeans?', a: 'Chinos have a slightly cleaner construction with flat-felled or serged seams instead of traditional jean topstitching, and a slimmer, tapered leg.' },
    ],
  },
  'pleated-trousers': {
    metaDescription: 'Draft custom-fit pleated trousers from your exact measurements. Single or double pleats, tailored waistband, and full-length leg. Tiled PDF sewing pattern.',
    pageIntro: 'Tailored pleated trousers drafted from your waist, hip, rise, and inseam measurements. Front pleats and a structured waistband create a refined silhouette sized exactly to your body.',
    faq: [
      { q: 'What fabric is best for pleated trousers?', a: 'Wool suiting, wool-blend, or tropical wool for year-round wear. Linen and cotton twill also work well for warmer months.' },
      { q: 'Are pleated trousers hard to sew?', a: 'They require precision at the waistband and fly, but the construction is straightforward once those steps are mastered. Rated as a tailored-level project.' },
    ],
  },
  'sweatpants': {
    metaDescription: 'Generate custom-fit sweatpants from your exact measurements. Elastic waist, ribbed cuffs, and a relaxed tapered leg. Tiled PDF sewing pattern.',
    pageIntro: 'Relaxed sweatpants with an elastic waistband and ribbed cuffs, drafted to your waist, hip, and inseam. A comfortable everyday pant that fits your body, not a size chart.',
    faq: [
      { q: 'What fabric do I need for sweatpants?', a: 'French terry or fleece-back jersey in a medium weight. You will also need ribbing for the waistband and cuffs.' },
      { q: 'Do I need a serger?', a: 'A serger makes knit construction faster, but a sewing machine with a stretch stitch or zigzag works fine.' },
    ],
  },
  'tee': {
    metaDescription: 'Create a custom-fit t-shirt sewing pattern from your exact measurements. Crew neck, v-neck, or scoop - choose your neckline and sleeve length. Beginner-friendly tiled PDF.',
    pageIntro: 'A classic t-shirt drafted to your chest, shoulder, neck, and sleeve measurements. Choose your neckline style and sleeve length for a tee that fits your body perfectly.',
    faq: [
      { q: 'What type of knit fabric works for a t-shirt?', a: 'Cotton jersey is the most popular choice. Look for a fabric with about 25% stretch across the grain for a comfortable fit.' },
      { q: 'Can a beginner sew a t-shirt?', a: 'Yes - the t-shirt is one of the best beginner garment projects. It has few pieces, simple construction, and teaches you how to work with knit fabric.' },
    ],
  },
  'camp-shirt': {
    metaDescription: 'Draft a custom-fit camp shirt sewing pattern from your measurements. Relaxed fit, convertible collar, and short sleeves. Tiled PDF with construction instructions.',
    pageIntro: 'A relaxed-fit camp collar shirt drafted to your chest, shoulder, and torso measurements. The convertible collar and straight hem create a casual, boxy silhouette.',
    faq: [
      { q: 'What fabric is best for a camp shirt?', a: 'Lightweight wovens like rayon, linen, cotton lawn, or chambray drape well and suit the relaxed camp shirt silhouette.' },
      { q: 'What makes a camp collar different from a regular collar?', a: 'A camp collar (also called a revere collar) lays flat and open, with no stand or band. It creates a relaxed, notched-lapel look.' },
    ],
  },
  'fitted-camp-shirt': {
    metaDescription: 'Draft a custom-fit fitted camp shirt sewing pattern from your measurements. Tapered waist, camp collar, short sleeves. Tiled PDF with construction instructions.',
    pageIntro: 'A fitted camp collar shirt drafted to your chest, shoulder, and torso measurements. Waist suppression tapers the side seams for a sharp silhouette without sacrificing the relaxed camp collar look.',
    faq: [
      { q: 'How fitted is the fitted camp shirt?', a: 'The pattern adds 2 inches of ease to your chest measurement and tapers the side seams inward at the natural waist for a clean, athletic silhouette.' },
      { q: 'What fabric works best for a fitted camp shirt?', a: 'Lightweight linen, cotton lawn, or chambray. The crisp hand of linen holds the tapered shape well.' },
    ],
  },
  'fitted-linen-camp': {
    metaDescription: 'Draft a custom-fit fitted linen camp shirt sewing pattern. Long sleeve, camp collar, tapered waist. Tiled PDF with construction instructions.',
    pageIntro: 'A long-sleeve fitted camp shirt drafted to your measurements. The camp collar, tapered side seams, and linen fabric combine a relaxed aesthetic with a sharp, athletic fit.',
    faq: [
      { q: 'Can I roll the sleeves on a long-sleeve camp shirt?', a: 'Yes. Roll the sleeve to just below the elbow and secure with a button tab if desired, or simply fold and press.' },
      { q: 'What fabric works for a long-sleeve fitted camp shirt?', a: 'Medium-weight linen is ideal. It drapes well, presses crisply, and softens beautifully with wear.' },
    ],
  },
  'crewneck': {
    metaDescription: 'Generate a custom-fit crewneck sweatshirt sewing pattern from your measurements. Ribbed cuffs and hem, set-in sleeves, and relaxed fit. Tiled PDF pattern.',
    pageIntro: 'A classic crewneck sweatshirt drafted to your chest, shoulder, and sleeve measurements. Ribbed cuffs, collar, and hem band for a clean, comfortable finish.',
    faq: [
      { q: 'What fabric works for a crewneck sweatshirt?', a: 'French terry or fleece-back sweatshirt fleece in a medium to heavy weight. You will also need ribbing for the neckband, cuffs, and hem.' },
      { q: 'How much ease does the crewneck have?', a: 'The pattern includes standard sweatshirt ease for a relaxed fit. Your chest and shoulder measurements are used as the starting point, with ease added for comfort.' },
    ],
  },
  'hoodie': {
    metaDescription: 'Create a custom-fit hoodie sewing pattern from your exact measurements. Kangaroo pocket, drawstring hood, and ribbed cuffs. Tiled PDF with full instructions.',
    pageIntro: 'A pullover hoodie with a kangaroo pocket and drawstring hood, drafted to your chest, shoulder, and sleeve measurements. Every panel is sized to your body.',
    faq: [
      { q: 'What fabric do I need for a hoodie?', a: 'Medium to heavy weight sweatshirt fleece or French terry. You will also need ribbing for cuffs and hem, plus a drawstring cord for the hood.' },
      { q: 'Is sewing a hoodie difficult?', a: 'The hoodie is rated as a tailored-level project due to the hood construction and kangaroo pocket. Comfortable handling knit fabrics is recommended.' },
    ],
  },
  'crop-jacket': {
    metaDescription: 'Draft a custom-fit crop jacket sewing pattern from your measurements. Cropped length, front closure, and tailored fit. Tiled PDF sewing pattern.',
    pageIntro: 'A cropped jacket drafted to your chest, shoulder, and torso measurements. The shortened body and tailored seams create a modern silhouette that pairs well with high-waisted bottoms.',
    faq: [
      { q: 'What fabric works for a crop jacket?', a: 'Medium-weight wovens with body work best - denim, twill, canvas, or wool melton. A lining fabric is recommended for a clean interior finish.' },
      { q: 'Where does the crop length hit?', a: 'The jacket is drafted to sit at or just above the natural waist. Your torso length measurement determines the exact placement.' },
    ],
  },
  'denim-jacket': {
    metaDescription: 'Generate a custom-fit denim jacket sewing pattern from your exact measurements. Classic trucker styling with chest pockets and a tailored fit. Tiled PDF pattern.',
    pageIntro: 'A classic denim jacket with trucker-style yoke and chest pockets, drafted to your chest, shoulder, and arm measurements. Tailored construction for a jacket that fits like it was made for you - because it was.',
    faq: [
      { q: 'What weight of denim should I use?', a: 'A 10-12 oz denim gives the right structure for a jacket. Heavier weights (14 oz+) are harder to sew through multiple layers on a home machine.' },
      { q: 'Do I need special equipment?', a: 'A denim needle (90/14 or 100/16), heavy-duty thread, and a walking foot are recommended. A hammer or clapper helps flatten thick seams.' },
    ],
  },
  'wide-leg-trouser-w': {
    metaDescription: 'Create custom-fit wide-leg trousers from your measurements. High waist, flowing leg, and flattering drape. Tiled PDF sewing pattern for women.',
    pageIntro: 'Wide-leg trousers drafted to your waist, hip, rise, and inseam measurements. A high waistband and flowing leg create a flattering, comfortable silhouette sized exactly to your body.',
    faq: [
      { q: 'What fabric drapes well for wide-leg trousers?', a: 'Rayon twill, crepe, linen, or lightweight wool all create beautiful drape. Avoid stiff fabrics that will add bulk to the wide leg.' },
      { q: 'How wide is the leg opening?', a: 'The leg width is proportional to your hip measurement and designed for a balanced, flattering silhouette. The pattern drafts the width automatically based on your body.' },
    ],
  },
  'straight-trouser-w': {
    metaDescription: 'Draft custom-fit straight trousers from your exact measurements. Clean lines, flat front, and a versatile straight leg. Tiled PDF sewing pattern for women.',
    pageIntro: 'Straight-leg trousers drafted to your waist, hip, rise, and inseam measurements. A flat front and clean lines make these a wardrobe workhorse that fits your body perfectly.',
    faq: [
      { q: 'How do straight trousers differ from wide-leg?', a: 'Straight trousers follow the line of the leg without flaring or tapering, creating a more structured and versatile silhouette.' },
      { q: 'What fabric is best for work trousers?', a: 'Wool suiting, ponte, or cotton twill with a small amount of stretch all work well for trousers that need to look polished and feel comfortable.' },
    ],
  },
  'easy-pant-w': {
    metaDescription: 'Generate a custom-fit easy pant sewing pattern from your measurements. Elastic waist, relaxed fit, and simple construction. Beginner-friendly tiled PDF for women.',
    pageIntro: 'An elastic-waist pant drafted to your waist and hip measurements. Simple pull-on construction makes this a perfect beginner project that still fits beautifully.',
    faq: [
      { q: 'What makes this an "easy" pant?', a: 'The elastic waistband eliminates the need for a fly, waistband facing, or buttonhole. Fewer pieces and simpler construction make it a great first pants project.' },
      { q: 'What fabrics work for easy pants?', a: 'Knits like ponte or French terry, or drapey wovens like rayon and linen. The elastic waist works with both stretch and non-stretch fabrics.' },
    ],
  },
  'button-up-w': {
    metaDescription: 'Create a custom-fit button-up shirt sewing pattern from your measurements. Tailored bust darts, collar stand, and button placket. Tiled PDF for women.',
    pageIntro: 'A tailored button-up shirt drafted to your bust, shoulder, and waist measurements. Bust darts, a fitted waist, and a proper collar stand create a polished fit sized to your body.',
    faq: [
      { q: 'Is sewing a button-up shirt difficult?', a: 'The button-up is rated as a tailored-level project. The collar, placket, and buttonholes require precision, but the included instructions walk through each step.' },
      { q: 'What fabric should I use?', a: 'Shirting-weight cotton (poplin, broadcloth, or oxford cloth) is the classic choice. Chambray and lightweight linen also work well.' },
    ],
  },
  'shell-blouse-w': {
    metaDescription: 'Draft a custom-fit shell blouse sewing pattern from your measurements. Sleeveless, clean neckline, and darted fit. Tiled PDF sewing pattern for women.',
    pageIntro: 'A sleeveless shell blouse drafted to your bust, shoulder, and waist measurements. Clean lines and a darted fit make it perfect layered under a blazer or worn on its own.',
    faq: [
      { q: 'What is a shell blouse?', a: 'A shell is a sleeveless, fitted top with a simple neckline - a wardrobe staple that works under jackets, cardigans, or on its own in warm weather.' },
      { q: 'What fabric works for a shell blouse?', a: 'Lightweight wovens like silk, crepe de chine, cotton voile, or rayon challis all drape beautifully for a shell blouse.' },
    ],
  },
  'fitted-tee-w': {
    metaDescription: 'Generate a custom-fit fitted tee sewing pattern from your measurements. Shaped side seams, feminine fit, and multiple neckline options. Beginner-friendly tiled PDF.',
    pageIntro: 'A fitted t-shirt with shaped side seams, drafted to your bust, waist, and shoulder measurements. Choose your neckline and sleeve length for a tee that flatters your figure.',
    faq: [
      { q: 'How is this different from the unisex t-shirt?', a: 'The fitted tee includes bust darts or shaping and tapered side seams for a closer, more feminine fit. It uses bust and waist measurements instead of just chest.' },
      { q: 'What knit fabric should I use?', a: 'Cotton jersey with 25-50% stretch across the grain is ideal. Cotton-lycra blends give a smoother, more fitted look.' },
    ],
  },
  'slip-skirt-w': {
    metaDescription: 'Create a custom-fit slip skirt sewing pattern from your measurements. Bias-cut drape, elastic waist, and adjustable length. Beginner-friendly tiled PDF.',
    pageIntro: 'A bias-cut slip skirt drafted to your waist and hip measurements. The bias grain creates a fluid drape that skims the body, and the elastic waist makes construction simple.',
    faq: [
      { q: 'What fabric creates the best drape for a slip skirt?', a: 'Satin, crepe, silk charmeuse, or rayon all drape beautifully on the bias. Avoid stiff fabrics - the bias cut needs a fabric that flows.' },
      { q: 'How much extra fabric does bias cutting require?', a: 'Bias-cut garments use more fabric than straight-grain. The materials list in your pattern PDF calculates the exact yardage needed for your measurements.' },
    ],
  },
  'a-line-skirt-w': {
    metaDescription: 'Draft a custom-fit A-line skirt sewing pattern from your measurements. Flattering flare, waistband, and adjustable length. Tiled PDF sewing pattern for women.',
    pageIntro: 'An A-line skirt drafted to your waist and hip measurements. The gentle flare from waist to hem flatters every figure, and every dimension is sized to your body.',
    faq: [
      { q: 'What makes an A-line skirt flattering?', a: 'The A-line shape follows the body at the waist and hip, then flares gently to the hem. This creates a balanced silhouette that works for most body types.' },
      { q: 'What length options are available?', a: 'You set the skirt length based on your preference - above the knee, knee-length, or midi. The pattern drafts to your exact specification.' },
    ],
  },
  'shirt-dress-w': {
    metaDescription: 'Generate a custom-fit shirt dress sewing pattern from your measurements. Button front, collar, waist shaping, and full skirt. Tiled PDF for women.',
    pageIntro: 'A button-front shirt dress drafted to your bust, waist, and hip measurements. Collar, cuffs, and waist shaping create a polished, wear-anywhere dress sized to your body.',
    faq: [
      { q: 'What fabric works for a shirt dress?', a: 'Cotton poplin, chambray, linen, or rayon twill - any light to medium-weight woven with a soft hand. The dress benefits from fabric that holds a collar shape.' },
      { q: 'How complex is this pattern?', a: 'The shirt dress is rated as a tailored-level project. It combines a fitted bodice with collar, placket, and buttonholes. Comfortable sewing skills are recommended.' },
    ],
  },
  'wrap-dress-w': {
    metaDescription: 'Create a custom-fit wrap dress sewing pattern from your measurements. True wrap front, waist tie, and adjustable fit. Tiled PDF sewing pattern for women.',
    pageIntro: 'A true wrap dress drafted to your bust, waist, and hip measurements. The wrap front adjusts to your body, and the waist tie creates a flattering, comfortable fit.',
    faq: [
      { q: 'What fabric is best for a wrap dress?', a: 'Drapey wovens like rayon, jersey, or matte crepe work beautifully. The wrap construction benefits from fabric that flows and ties easily.' },
      { q: 'Will the wrap stay closed?', a: 'The pattern includes an interior tie point that anchors the wrap securely, plus the exterior waist tie. This prevents gapping and keeps the dress in place.' },
    ],
  },
  'baggy-jeans': {
    metaDescription: 'Draft custom-fit baggy jeans from your exact measurements. Relaxed through the hip and thigh with a wide straight leg. Five-pocket styling. Tiled PDF sewing pattern.',
    pageIntro: 'Baggy jeans with a relaxed fit through the hip and thigh, drafted to your waist, hip, rise, and inseam measurements. Five-pocket construction with a wide straight leg.',
    faq: [
      { q: 'How baggy are the baggy jeans?', a: 'The pattern adds extra ease through the hip, thigh, and leg for a noticeably relaxed fit. Your measurements still anchor the proportions so nothing looks oversized.' },
      { q: 'What denim weight works best?', a: 'A 10-12 oz denim balances drape and structure. Lighter weights (8 oz) give a softer hand; heavier weights (14 oz) hold a stiffer shape.' },
    ],
  },
  'baggy-shorts': {
    metaDescription: 'Generate custom-fit baggy shorts (jorts) from your measurements. Relaxed fit, wide leg, and five-pocket styling. Tiled PDF sewing pattern.',
    pageIntro: 'Baggy denim shorts (jorts) drafted to your waist, hip, and inseam measurements. A relaxed, wide-leg silhouette with five-pocket construction.',
    faq: [
      { q: 'What length do the baggy shorts hit?', a: 'You set the inseam length. A longer inseam (8-10 inches) gives the classic baggy jort look, while shorter works for a more casual cut.' },
      { q: 'Can I use non-denim fabric?', a: 'Yes - cotton twill, canvas, or any medium-weight woven fabric works well for the baggy shorts silhouette.' },
    ],
  },
  '874-work-pants': {
    metaDescription: 'Create custom-fit 874-style work pants from your exact measurements. Straight leg, tunnel belt loops, and durable construction. Tiled PDF sewing pattern.',
    pageIntro: 'Classic straight-leg work pants drafted to your waist, hip, rise, and inseam measurements. Tunnel belt loops and a structured waistband for a timeless workwear silhouette.',
    faq: [
      { q: 'What fabric should I use for work pants?', a: 'Heavy cotton twill (8-10 oz) or poly-cotton blend gives the right weight and durability. A stiff hand holds the straight-leg shape.' },
      { q: 'How do these differ from chinos?', a: 'Work pants have a straighter, roomier leg, tunnel belt loops instead of sewn-on loops, and heavier construction designed for durability over polish.' },
    ],
  },
  'button-up': {
    metaDescription: 'Draft a custom-fit button-up shirt sewing pattern from your measurements. Collar stand, button placket, and tailored fit. Tiled PDF with construction guide.',
    pageIntro: 'A classic button-up shirt drafted to your chest, shoulder, neck, and sleeve measurements. Collar stand, button placket, and optional chest pocket for a shirt that fits your body.',
    faq: [
      { q: 'What fabric works for a button-up shirt?', a: 'Shirting-weight cotton (poplin, broadcloth, oxford cloth) is the standard. Chambray, linen, and flannel are popular alternatives.' },
      { q: 'Is this pattern difficult?', a: 'The button-up requires precision at the collar, placket, and buttonholes. The included step-by-step instructions guide you through each detail.' },
    ],
  },
  'athletic-formal-jacket': {
    metaDescription: 'Generate a custom-fit athletic formal jacket sewing pattern from your measurements. Structured shoulders, clean lines, and sport-tailored fit. Tiled PDF pattern.',
    pageIntro: 'An athletic formal jacket that blends sport structure with tailored finishing, drafted to your chest, shoulder, and arm measurements. Structured shoulders and a fitted waist for a sharp silhouette.',
    faq: [
      { q: 'What fabric works for an athletic formal jacket?', a: 'Wool suiting, ponte, or technical wovens with some body. A fusible interfacing on the front panels adds structure.' },
      { q: 'Do I need to line this jacket?', a: 'A lining is recommended for a clean interior finish and smooth wear over shirts. The pattern includes lining pieces.' },
    ],
  },
  'cargo-work-pants': {
    metaDescription: 'Create custom-fit cargo work pants from your exact measurements. Cargo pockets, reinforced construction, and a straight leg. Tiled PDF sewing pattern.',
    pageIntro: 'Cargo work pants with large cargo pockets, drafted to your waist, hip, rise, and inseam measurements. Reinforced construction built for durability and a functional fit.',
    faq: [
      { q: 'How many pockets do the cargo work pants have?', a: 'The pattern includes front slash pockets, back welt pockets, and large bellows cargo pockets on each leg - plenty of storage for tools and everyday carry.' },
      { q: 'What fabric is durable enough for work pants?', a: 'Heavy cotton twill (10-12 oz), duck canvas, or poly-cotton blends give the weight and durability needed for workwear.' },
    ],
  },
  'apron': {
    metaDescription: 'Draft a custom-fit apron sewing pattern from your measurements. Full coverage, adjustable neck strap, and front pockets. Beginner-friendly tiled PDF.',
    pageIntro: 'A full-coverage apron drafted to your torso measurements with a front pocket and adjustable ties. A quick, satisfying beginner project that makes a great gift.',
    faq: [
      { q: 'What fabric is best for an apron?', a: 'Medium-weight cotton, linen, canvas, or denim are all durable and washable. Waxed canvas adds water resistance for kitchen use.' },
      { q: 'How long does it take to sew an apron?', a: 'An apron is one of the fastest garment projects - most sewists can complete one in 1-2 hours, making it a great project for a single afternoon.' },
    ],
  },
  'bow-tie': {
    metaDescription: 'Create a custom-fit bow tie sewing pattern from your neck measurement. Self-tie, adjustable strap, and multiple width options. Beginner-friendly tiled PDF.',
    pageIntro: 'A self-tie bow tie drafted to your neck circumference. Choose your width and style for a bow tie that fits perfectly and ties with a satisfying handmade knot.',
    faq: [
      { q: 'What fabric works for a bow tie?', a: 'Silk, cotton shirting, linen, or wool suiting all work well. Lightweight to medium-weight fabrics with a crisp hand tie the best knots.' },
      { q: 'Is this a pre-tied or self-tie bow tie?', a: 'This is a self-tie bow tie with an adjustable neck strap. The pattern includes instructions for tying a classic bow tie knot.' },
    ],
  },
  'tank-top': {
    metaDescription: 'Generate a custom-fit tank top sewing pattern from your measurements. Scoop neck, racerback or standard straps, and relaxed fit. Beginner-friendly tiled PDF.',
    pageIntro: 'A tank top drafted to your chest, shoulder, and torso measurements. Choose your strap style and neckline depth for a comfortable, custom-fit layering piece.',
    faq: [
      { q: 'What fabric should I use for a tank top?', a: 'Cotton jersey or a cotton-modal blend with good stretch and recovery. Lightweight knits with 25%+ stretch across the grain work best.' },
      { q: 'Can a beginner sew a tank top?', a: 'Yes - the tank top is one of the simplest garment projects. Few pattern pieces and straightforward construction make it perfect for learning knit sewing.' },
    ],
  },
  'circle-skirt-w': {
    metaDescription: 'Draft a custom-fit circle skirt sewing pattern from your measurements. Full circle, half circle, or quarter circle options. Beginner-friendly tiled PDF for women.',
    pageIntro: 'A circle skirt drafted to your waist measurement with your choice of fullness. The circular construction creates a flowing, twirl-worthy skirt sized exactly to your body.',
    faq: [
      { q: 'What is the difference between full, half, and quarter circle?', a: 'A full circle skirt uses the most fabric and has the most dramatic flare. Half circle is a practical everyday fullness. Quarter circle is more fitted and uses less fabric.' },
      { q: 'What fabric drapes best for a circle skirt?', a: 'Lightweight fabrics like rayon, chiffon, or cotton lawn create the most fluid drape. Medium-weight cotton holds more structure.' },
    ],
  },
  'pencil-skirt-w': {
    metaDescription: 'Create a custom-fit pencil skirt sewing pattern from your measurements. Fitted silhouette, back vent, and waistband. Beginner-friendly tiled PDF for women.',
    pageIntro: 'A pencil skirt drafted to your waist, hip, and desired length measurements. The fitted silhouette follows your curves with a back vent for ease of movement.',
    faq: [
      { q: 'What fabric works for a pencil skirt?', a: 'Suiting fabric, ponte, or cotton twill with a small amount of stretch. The fitted silhouette benefits from fabric that holds its shape and recovers well.' },
      { q: 'Do I need a lining?', a: 'A lining is optional but recommended for woven fabrics. It prevents the skirt from clinging and gives a more polished finish.' },
    ],
  },
  'leggings': {
    metaDescription: 'Generate custom-fit leggings from your exact measurements. High or mid waist, full or cropped length, and a second-skin fit. Beginner-friendly tiled PDF.',
    pageIntro: 'Leggings drafted to your waist, hip, inseam, and thigh measurements. A true custom fit that moves with your body, not against it.',
    faq: [
      { q: 'What fabric do I need for leggings?', a: 'A 4-way stretch knit with good recovery is essential - cotton-lycra, nylon-spandex, or performance knit. The fabric should stretch at least 50% and snap back.' },
      { q: 'Do I need a serger for leggings?', a: 'A serger gives the most professional finish, but a sewing machine with a stretch stitch or narrow zigzag works well for leggings.' },
    ],
  },
  'athletic-formal-trousers': {
    metaDescription: 'Draft custom-fit athletic formal trousers from your measurements. Tapered leg, stretch waistband, and sport-tailored construction. Tiled PDF sewing pattern.',
    pageIntro: 'Athletic formal trousers that combine a tailored look with sport comfort, drafted to your waist, hip, and inseam. A tapered leg and structured waistband bridge the gap between gym and office.',
    faq: [
      { q: 'What fabric works for athletic formal trousers?', a: 'Technical suiting with stretch, ponte, or performance twill. Look for fabrics that hold a crease but move with you.' },
      { q: 'How do these differ from regular trousers?', a: 'The athletic formal cut has more room through the thigh and a tapered leg, designed for athletic builds. The waistband includes stretch for comfort.' },
    ],
  },
  'tshirt-dress-w': {
    metaDescription: 'Create a custom-fit t-shirt dress sewing pattern from your measurements. Relaxed fit, knit construction, and adjustable length. Beginner-friendly tiled PDF for women.',
    pageIntro: 'A t-shirt dress drafted to your bust, waist, and hip measurements. The relaxed knit construction makes this a comfortable, easy-wearing dress you can sew in an afternoon.',
    faq: [
      { q: 'What knit fabric works for a t-shirt dress?', a: 'Cotton jersey, cotton-modal, or rayon jersey with good drape. A medium-weight knit with 25%+ stretch gives the best results.' },
      { q: 'How does the fit compare to a regular tee?', a: 'The t-shirt dress uses the same shoulder and bust fit as the fitted tee, extended to your chosen dress length with optional waist shaping.' },
    ],
  },
  'slip-dress-w': {
    metaDescription: 'Generate a custom-fit slip dress sewing pattern from your measurements. Bias-cut body, spaghetti straps, and fluid drape. Beginner-friendly tiled PDF for women.',
    pageIntro: 'A bias-cut slip dress drafted to your bust, waist, and hip measurements. Spaghetti straps and a fluid silhouette that skims the body for an effortless, elegant look.',
    faq: [
      { q: 'What fabric gives the best slip dress drape?', a: 'Silk charmeuse, satin-back crepe, or rayon are the classic choices. Any lightweight fabric that flows on the bias will work beautifully.' },
      { q: 'Is bias cutting difficult?', a: 'Bias cutting requires a bit more care when laying out and cutting, but the construction itself is straightforward. The pattern guides you through the process.' },
    ],
  },
  'a-line-dress-w': {
    metaDescription: 'Draft a custom-fit A-line dress sewing pattern from your measurements. Fitted bodice, flared skirt, and flattering proportions. Tiled PDF for women.',
    pageIntro: 'An A-line dress drafted to your bust, waist, and hip measurements. A fitted bodice flows into a gently flared skirt for a universally flattering silhouette.',
    faq: [
      { q: 'What makes an A-line dress flattering?', a: 'The A-line shape skims the body at the bust and waist, then gradually widens to the hem. This balanced silhouette works well for nearly every body type.' },
      { q: 'What fabric is best for an A-line dress?', a: 'Medium-weight cotton, linen, or ponte for structure. Lighter fabrics like rayon or chambray give a softer drape.' },
    ],
  },
  'sundress-w': {
    metaDescription: 'Create a custom-fit sundress sewing pattern from your measurements. Adjustable straps, relaxed fit, and breezy construction. Beginner-friendly tiled PDF for women.',
    pageIntro: 'A breezy sundress drafted to your bust and waist measurements. Adjustable straps and a relaxed fit make this an easy warm-weather staple you can sew quickly.',
    faq: [
      { q: 'What fabric is best for a sundress?', a: 'Lightweight cottons (lawn, voile, poplin), rayon, or linen are ideal. Breathable fabrics keep you cool and give the relaxed drape a sundress needs.' },
      { q: 'Is this a good beginner project?', a: 'Yes - the sundress has simple construction with few pieces, making it a great project for building confidence with woven garments.' },
    ],
  },
  'tote-bag': {
    metaDescription: 'Draft a custom-sized tote bag sewing pattern. Adjustable dimensions, interior pocket, and sturdy construction. Beginner-friendly tiled PDF.',
    pageIntro: 'A tote bag pattern with customizable dimensions and sturdy construction. Choose your size and add an interior pocket for a functional, handmade bag.',
    faq: [
      { q: 'What fabric works for a tote bag?', a: 'Canvas, duck cloth, denim, or waxed cotton are all durable choices. Medium to heavy-weight wovens hold the bag shape best.' },
      { q: 'Do I need special equipment?', a: 'A standard sewing machine handles most tote bag fabrics. Use a denim or heavy-duty needle (90/14+) for canvas and denim.' },
    ],
  },
  'linen-shirt': {
    metaDescription: 'Generate a custom-fit linen shirt sewing pattern from your measurements. Relaxed fit, natural texture, and breezy construction. Tiled PDF with full instructions.',
    pageIntro: 'A relaxed linen shirt drafted to your chest, shoulder, and sleeve measurements. Designed to showcase the natural texture and drape of linen with a comfortable, unfussy fit.',
    faq: [
      { q: 'Does linen shrink?', a: 'Yes - always pre-wash and dry your linen before cutting. Expect 3-5% shrinkage on the first wash. The pattern accounts for your finished measurements.' },
      { q: 'How do I handle linen fraying?', a: 'Linen frays freely at cut edges. Serge or zigzag your seam allowances, or use French seams for a clean enclosed finish.' },
    ],
  },
  'chambray-work-shirt': {
    metaDescription: 'Create a custom-fit chambray work shirt from your exact measurements. Chest pockets, reinforced yoke, and durable construction. Tiled PDF sewing pattern.',
    pageIntro: 'A chambray work shirt with chest pockets and a reinforced yoke, drafted to your chest, shoulder, and arm measurements. Classic workwear construction meets a custom fit.',
    faq: [
      { q: 'What is chambray?', a: 'Chambray is a plain-weave cotton fabric with a colored warp and white weft, giving it a softer look than denim. It is lighter weight and more breathable.' },
      { q: 'How is this different from the button-up shirt?', a: 'The chambray work shirt has workwear-inspired details: chest pockets, a reinforced back yoke, and slightly roomier proportions for layering and movement.' },
    ],
  },
  // ── Style variant SEO descriptions ──────────────────────────────────────────
  'oversized-tee': { metaDescription: 'Draft a custom-fit oversized tee sewing pattern from your measurements. Relaxed, boxy fit with dropped shoulders. Beginner-friendly tiled PDF.', pageIntro: 'An oversized tee with generous ease and a boxy silhouette, drafted to your exact measurements.', faq: [{ q: 'How oversized is it?', a: 'The pattern adds 10+ inches of ease at the chest for a distinctly relaxed, boxy fit.' }] },
  'muscle-tee': { metaDescription: 'Generate a custom-fit muscle tee sewing pattern. Relaxed fit, short sleeves. Tiled PDF pattern.', pageIntro: 'A relaxed-fit muscle tee drafted to your chest and shoulder measurements.', faq: [{ q: 'What makes a muscle tee different?', a: 'A muscle tee has a slightly looser fit with short sleeves that sit higher on the arm.' }] },
  'longline-tee': { metaDescription: 'Create a custom-fit longline tee sewing pattern. Extended length with curved shirttail hem. Tiled PDF.', pageIntro: 'A longline tee with an extended body and curved shirttail hem.', faq: [{ q: 'How long is the longline tee?', a: 'It adds 3-4 inches below a standard tee, typically hitting mid-hip to upper thigh.' }] },
  'pocket-tee': { metaDescription: 'Draft a custom-fit pocket tee sewing pattern. Classic fit with a chest patch pocket. Beginner-friendly tiled PDF.', pageIntro: 'A classic-fit tee with a chest patch pocket, drafted to your exact measurements.', faq: [{ q: 'Where is the pocket placed?', a: 'The pocket is positioned on the left chest, sized proportionally to your body.' }] },
  'scoop-tee-w': { metaDescription: 'Generate a custom-fit scoop neck tee for women. Fitted silhouette with a flattering scoop neckline. Tiled PDF.', pageIntro: 'A fitted scoop neck tee drafted to your bust, shoulder, and torso measurements.', faq: [{ q: 'How deep is the scoop?', a: 'The scoop sits about 3 inches below the collarbone - flattering without being revealing.' }] },
  'long-sleeve-fitted-tee-w': { metaDescription: 'Create a custom-fit long sleeve fitted tee for women. Body-skimming fit with full-length sleeves. Tiled PDF.', pageIntro: 'A fitted long-sleeve tee drafted to your bust, shoulder, and arm measurements.', faq: [{ q: 'What fabric works best?', a: 'Cotton jersey or cotton-modal blend with good recovery.' }] },
  'cropped-tee-w': { metaDescription: 'Draft a custom-fit cropped tee for women. Fitted with a shortened body. Tiled PDF pattern.', pageIntro: 'A cropped fitted tee that ends at or just above your natural waist.', faq: [{ q: 'Where does the crop hit?', a: 'Typically 2-3 inches above the natural waist, based on your torso measurement.' }] },
  'zip-hoodie': { metaDescription: 'Generate a custom-fit zip-up hoodie sewing pattern. Full separating zipper and hood. Tiled PDF.', pageIntro: 'A zip-up hoodie with a full separating zipper, drafted to your measurements.', faq: [{ q: 'What zipper do I need?', a: 'A separating (jacket-style) zipper, 22-24 inches long.' }] },
  'oversized-hoodie': { metaDescription: 'Create a custom-fit oversized hoodie sewing pattern. Extra-roomy pullover with kangaroo pocket. Tiled PDF.', pageIntro: 'An oversized pullover hoodie with generous ease.', faq: [{ q: 'How oversized is it?', a: 'The oversized hoodie adds 10+ inches of ease at the chest.' }] },
  'scholar-hoodie': { metaDescription: 'Draft a custom-fit Scholar-style dropped-shoulder hoodie sewing pattern. Oversized pullover with two-panel hood, kangaroo pocket, and ribbed hem and cuffs. Tiled PDF.', pageIntro: 'An oversized dropped-shoulder pullover hoodie inspired by the Alo Scholar Hooded Sweater. Two-panel hood, kangaroo pocket, and a tall ribbed hem.', faq: [{ q: 'What is a dropped shoulder?', a: 'The shoulder seam sits 2 to 3 inches past the natural shoulder, so the sleeve hangs off the upper arm. The cap is shallow and pins flat to the armhole with no easing.' }, { q: 'What fabric works best?', a: 'A heavyweight knitted cotton, heavy french terry, or stable sweater knit. Aim for 12 oz or heavier so the dropped shoulder drapes correctly.' }] },
  'raglan-sweatshirt': { metaDescription: 'Draft a custom-fit raglan sweatshirt sewing pattern. Diagonal shoulder seams for easy color-blocking. Tiled PDF.', pageIntro: 'A raglan-sleeve sweatshirt with diagonal seams from neckline to underarm.', faq: [{ q: 'What is a raglan sleeve?', a: 'Raglan sleeves run diagonally from the neckline to the underarm - great for color-blocking.' }] },
  'slim-jeans': { metaDescription: 'Generate custom-fit slim jeans from your measurements. Tapered leg, five-pocket construction. Tiled PDF.', pageIntro: 'Slim-fit jeans drafted to your waist, hip, and inseam measurements.', faq: [{ q: 'How slim are they?', a: 'The leg tapers from hip to ankle. Stretch denim (2-3% spandex) is recommended.' }] },
  'high-rise-jeans': { metaDescription: 'Create custom-fit high-rise jeans from your measurements. Higher waistband, straight leg. Tiled PDF.', pageIntro: 'High-rise straight-leg jeans drafted to your measurements.', faq: [{ q: 'How high is the rise?', a: 'The rise sits at or just above your natural waist - 1.5-2 inches higher than mid-rise.' }] },
  'soloist-jeans': { metaDescription: 'Draft custom-fit Soloist-style straight jeans from your measurements. Square-scoop front pockets, pointed back yoke, mid rise, and a clean straight leg. Tiled PDF with full construction guide.', pageIntro: 'Straight jeans inspired by the Takahiromiyashita The Soloist silhouette. Square-scoop front pocket openings, pointed back yoke, and a mid rise drafted to your waist, hip, rise, and inseam.', faq: [{ q: 'What is a square-scoop pocket?', a: 'An L-shaped opening with a horizontal top and a vertical side, finishing about 5.5 inches below the waistband. It reads more architectural than a traditional slant pocket and is a signature Soloist styling detail.' }, { q: 'What weight of denim should I use?', a: '10-12 oz rigid or mechanical-stretch denim. The straight leg and mid rise both benefit from a denim with enough body to hold the silhouette clean.' }] },
  'slim-chinos': { metaDescription: 'Draft custom-fit slim chinos from your measurements. Tapered leg, slant pockets. Tiled PDF.', pageIntro: 'Slim-fit chinos drafted to your waist, hip, and inseam.', faq: [{ q: 'How do slim chinos differ from regular?', a: 'Only the leg taper changes - narrower from thigh to hem.' }] },
  'tapered-joggers': { metaDescription: 'Generate custom-fit tapered joggers from your measurements. Elastic waist, rib cuffs. Tiled PDF.', pageIntro: 'Tapered joggers with elastic waist and rib-knit cuffs.', faq: [{ q: 'How are joggers different from sweatpants?', a: 'Joggers have a tapered leg narrowing toward the ankle with a rib cuff.' }] },
  'scholar-sweatpants': { metaDescription: 'Draft Scholar-style oversized straight-leg sweatpants from your measurements. Welt-zip side pockets, drawstring waist, and a generous baggy seat. Tiled PDF.', pageIntro: 'Oversized straight-leg sweatpants inspired by the Alo Scholar Straight Leg Sweatpant. Welt-zip side pockets, deep crotch scoop, and an elastic-and-drawstring waistband.', faq: [{ q: 'What makes the side pockets different?', a: 'Each pocket is a horizontal welt opening with a 6 inch coil zipper, set 2 to 3 inches below the waistband. Cleaner and more secure than an in-seam slash pocket.' }, { q: 'What weight of fabric should I use?', a: 'A heavyweight french terry, heavy jersey, or stable sweater knit. Aim for at least 12 oz so the leg hangs straight and the waistband holds shape.' }] },
  'running-shorts': { metaDescription: 'Create custom-fit running shorts from your measurements. Slim fit with optional mesh liner. Tiled PDF.', pageIntro: 'Lightweight running shorts drafted to your waist and hip measurements.', faq: [{ q: 'What fabric works?', a: 'Lightweight performance knit, mesh, or ripstop nylon.' }] },
  'basketball-shorts': { metaDescription: 'Draft custom-fit basketball shorts from your measurements. Relaxed fit, longer inseam. Tiled PDF.', pageIntro: 'Relaxed-fit basketball shorts with a longer inseam.', faq: [{ q: 'How long are they?', a: 'Basketball shorts use a longer inseam (9-10 inches) for more knee coverage.' }] },
  'vacation-shirt': { metaDescription: 'Generate a custom-fit vacation shirt sewing pattern. Camp collar, relaxed fit, chest pocket. Tiled PDF.', pageIntro: 'A relaxed camp-collar shirt with a chest pocket.', faq: [{ q: 'What is a camp collar?', a: 'A flat, open collar with a notch at the neckline - the classic Hawaiian shirt collar.' }] },
  'racerback-tank': { metaDescription: 'Draft a custom-fit racerback tank sewing pattern. Fitted with converging back straps. Tiled PDF.', pageIntro: 'A fitted racerback tank drafted to your bust and shoulder measurements.', faq: [{ q: 'What is a racerback?', a: 'Straps converge between the shoulder blades, leaving the upper back exposed.' }] },
  'cropped-tank': { metaDescription: 'Create a custom-fit cropped tank sewing pattern. Wide straps, relaxed fit, shortened body. Tiled PDF.', pageIntro: 'A cropped tank with wide straps and a relaxed fit.', faq: [{ q: 'Where does the crop hit?', a: 'The cropped tank ends at or just above the natural waist.' }] },
  'maxi-wrap-dress-w': { metaDescription: 'Generate a custom-fit maxi wrap dress sewing pattern. Floor-length with long sleeves. Tiled PDF.', pageIntro: 'A floor-length wrap dress with long sleeves.', faq: [{ q: 'How long is maxi length?', a: 'The maxi reaches the ankle or floor, based on your nape-to-floor measurement.' }] },
  'linen-shirt-dress-w': { metaDescription: 'Create a custom-fit linen shirt dress sewing pattern. Band collar, relaxed fit, sash belt. Tiled PDF.', pageIntro: 'A relaxed linen shirt dress with a band collar and sash belt.', faq: [{ q: 'What makes this different from the regular shirt dress?', a: 'Band collar instead of point collar, more relaxed fit, designed for linen.' }] },
  'long-sleeve-tee-dress-w': { metaDescription: 'Draft a custom-fit long sleeve tee dress sewing pattern. Knee-length knit dress. Tiled PDF.', pageIntro: 'A knee-length T-shirt dress with long sleeves.', faq: [{ q: 'What fabric works best?', a: 'Cotton jersey, cotton-modal, or ponte knit with good recovery.' }] },
  'maxi-tee-dress-w': { metaDescription: 'Generate a custom-fit maxi tee dress sewing pattern. Floor-length knit dress. Tiled PDF.', pageIntro: 'A floor-length T-shirt dress with short sleeves.', faq: [{ q: 'Do I need different fabric for maxi?', a: 'A slightly heavier jersey (6-7 oz) helps a maxi hang well without clinging.' }] },
  'midi-aline-dress-w': { metaDescription: 'Create a custom-fit midi A-line dress sewing pattern. Mid-calf with gentle flare. Tiled PDF.', pageIntro: 'A midi-length A-line dress drafted to your measurements.', faq: [{ q: 'Where does midi hit?', a: 'Midi falls at mid-calf, typically 30-34 inches from the waist.' }] },
  'maxi-sundress-w': { metaDescription: 'Draft a custom-fit maxi sundress sewing pattern. Floor-length with tie straps. Tiled PDF.', pageIntro: 'A floor-length sundress with tie straps and a gathered skirt.', faq: [{ q: 'How full is the skirt?', a: 'The skirt uses a 1.5-2x gathering ratio for soft fullness.' }] },
  'tiered-sundress-w': { metaDescription: 'Generate a custom-fit tiered sundress sewing pattern. Multiple gathered tiers. Tiled PDF.', pageIntro: 'A tiered sundress with progressively wider gathered tiers.', faq: [{ q: 'How many tiers?', a: 'Three tiers below the bodice, each progressively wider.' }] },
  'maxi-slip-dress-w': { metaDescription: 'Create a custom-fit maxi slip dress sewing pattern. Floor-length with spaghetti straps. Tiled PDF.', pageIntro: 'A floor-length slip dress with spaghetti straps.', faq: [{ q: 'What fabric works?', a: 'Drapey fabrics like satin, crepe, or rayon challis.' }] },
  'capri-leggings': { metaDescription: 'Draft custom-fit capri leggings from your measurements. Mid-calf length. Tiled PDF.', pageIntro: 'Capri-length leggings ending at mid-calf.', faq: [{ q: 'Where do capris end?', a: 'Mid-calf, about 2-3 inches below the knee.' }] },
  'biker-shorts': { metaDescription: 'Generate custom-fit biker shorts from your measurements. High-waist, mid-thigh. Tiled PDF.', pageIntro: 'High-waist biker shorts ending at mid-thigh.', faq: [{ q: 'What fabric do I need?', a: 'Cotton-spandex (92/8 or 87/13) with 4-way stretch and good recovery.' }] },
  'woven-tank-w': { metaDescription: 'Create a custom-fit woven tank sewing pattern. Relaxed fit, round neckline. Tiled PDF.', pageIntro: 'A relaxed woven tank with a round neckline.', faq: [{ q: 'How is a woven tank different from knit?', a: 'Woven tanks use non-stretch fabric (linen, cotton, voile) with darts or shaping for fit.' }] },
  'poplin-blouse-w': { metaDescription: 'Draft a custom-fit poplin blouse sewing pattern. Semifitted with bust darts. Tiled PDF.', pageIntro: 'A semifitted poplin blouse with a point collar and bust darts.', faq: [{ q: 'What is poplin?', a: 'A crisp, smooth plain-weave cotton fabric ideal for structured blouses.' }] },
  'linen-tunic-w': { metaDescription: 'Generate a custom-fit linen tunic sewing pattern. Relaxed fit, band collar. Tiled PDF.', pageIntro: 'A relaxed linen tunic with a band collar and three-quarter sleeves.', faq: [{ q: 'How long is the tunic?', a: 'Mid-hip or below, 4-6 inches longer than a standard shirt.' }] },
  'lightweight-denim-jacket': { metaDescription: 'Create a custom-fit lightweight denim jacket sewing pattern. Relaxed fit. Tiled PDF.', pageIntro: 'A relaxed-fit denim jacket in lighter-weight denim.', faq: [{ q: 'What weight denim?', a: '6-8 oz denim or chambray for an easy, less structured feel.' }] },
  'lounge-pant-w': { metaDescription: 'Draft custom-fit lounge pants sewing pattern. Wide leg, elastic waist. Tiled PDF.', pageIntro: 'Wide-leg lounge pants with an elastic waist.', faq: [{ q: 'What fabric works?', a: 'Modal jersey, rayon, bamboo knit, or lightweight linen.' }] },
  'cigarette-pants-w': { metaDescription: 'Generate custom-fit cigarette pants sewing pattern. Slim, tapered, cropped. Tiled PDF.', pageIntro: 'Slim cigarette pants with a high rise and cropped ankle.', faq: [{ q: 'How are cigarette pants different from skinny?', a: 'Slim and straight but not skin-tight. Typically in woven fabric with a small amount of stretch.' }] },
  'linen-wide-legs-w': { metaDescription: 'Create custom-fit linen wide-leg trousers sewing pattern. Elastic waist. Tiled PDF.', pageIntro: 'Wide-leg linen trousers with an elastic waist and high rise.', faq: [{ q: 'Does linen wrinkle?', a: 'Yes - that is part of its charm. Pre-wash before cutting.' }] },
  'mini-circle-skirt-w': { metaDescription: 'Draft a custom-fit mini circle skirt sewing pattern. Full circle, elastic waist. Tiled PDF.', pageIntro: 'A full-circle mini skirt with an elastic waist.', faq: [{ q: 'How much fabric?', a: 'A full circle skirt needs about 2-3 yards of 45-inch fabric.' }] },
  'midi-circle-skirt-w': { metaDescription: 'Generate a custom-fit midi circle skirt sewing pattern. Half circle, structured waistband. Tiled PDF.', pageIntro: 'A half-circle midi skirt with a structured waistband and invisible zip.', faq: [{ q: 'Full vs half circle?', a: 'A half circle has gentler flare, uses less fabric, and hangs closer to the body.' }] },
  'market-tote': { metaDescription: 'Create a custom-fit market tote sewing pattern. Large, lined, boxed corners. Tiled PDF.', pageIntro: 'A large market tote with boxed corners and lining.', faq: [{ q: 'What fabric?', a: 'Canvas, cotton twill, or heavy linen for the outer. Lightweight cotton for lining.' }] },
  'beach-tote': { metaDescription: 'Draft a custom-fit beach tote sewing pattern. Large, unlined, lightweight. Tiled PDF.', pageIntro: 'A large, lightweight beach tote - designed to shake out sand.', faq: [{ q: 'Can I use waterproof fabric?', a: 'Yes - outdoor fabric, PUL, or laminated cotton all work well.' }] },

  // ── New modules (2026-04-08) ──────────────────────────────────────────────
  'open-cardigan': {
    metaDescription: 'Draft a custom-fit open cardigan / shacket sewing pattern. Oversized drop-shoulder layer, open front, hip to mid-thigh length. Tiled PDF with full instructions.',
    pageIntro: 'An oversized open-front layer drafted to your chest, shoulder, and sleeve measurements. Drop shoulder construction, no buttons — designed to drape open. Choose hip or mid-thigh length.',
    faq: [
      { q: 'What is a drop shoulder?', a: 'The shoulder seam extends past the natural shoulder point, creating a relaxed silhouette without a traditional armhole curve. It is beginner-friendly to sew.' },
      { q: 'What fabric works best?', a: 'Medium-weight wovens with good drape: linen, cotton canvas, flannel, or lightweight wool. Avoid stiff fabrics that do not hang well.' },
    ],
  },
  'duster-cardigan': {
    metaDescription: 'Create a custom-fit duster cardigan sewing pattern. Oversized, mid-thigh length, open front. Tiled PDF.',
    pageIntro: 'A long, oversized open-front duster drafted from your measurements. Mid-thigh length with drop shoulder construction.',
    faq: [
      { q: 'How long is a duster?', a: 'Mid-thigh, roughly 28-34 inches from the shoulder depending on your torso length.' },
      { q: 'Can I add pockets?', a: 'Yes - the pattern includes optional patch pockets positioned at hip level on each front panel.' },
    ],
  },
  'shacket': {
    metaDescription: 'Generate a custom-fit shacket sewing pattern. Hip-length shirt-jacket, open front, relaxed fit. Tiled PDF.',
    pageIntro: 'A hip-length shirt-jacket with a relaxed open-front silhouette. Drop shoulder, patch pockets, no buttons.',
    faq: [
      { q: 'What is a shacket?', a: 'A shirt worn as a jacket — hip length, slightly oversized, made in heavier fabric like canvas, flannel, or heavy linen.' },
      { q: 'Can I wear it as a shirt?', a: 'Yes - its hip length and relaxed proportions work as a shirt layer over a tee.' },
    ],
  },
  'chore-coat': {
    metaDescription: 'Draft a custom-fit chore coat / overshirt sewing pattern. Boxy hip-length, button front, patch pockets, camp collar. Tiled PDF.',
    pageIntro: 'A boxy hip-length overshirt drafted to your exact measurements. Button placket, camp or band collar, chest flap pockets and lower patch pockets. Wear it as a shirt or a light jacket.',
    faq: [
      { q: 'What is a chore coat?', a: 'A structured hip-length overshirt in heavy workwear fabric — canvas, linen, or flannel. It has the proportions of a jacket but is constructed like a shirt.' },
      { q: 'What fabric works best?', a: 'Cotton canvas (10-12 oz), medium-weight linen, cotton twill, or lightweight denim. The fabric should have enough body to hold the boxy shape.' },
    ],
  },
  'linen-overshirt': {
    metaDescription: 'Create a custom-fit linen overshirt sewing pattern. Hip-length, camp collar, chest pockets. Tiled PDF.',
    pageIntro: 'A relaxed linen overshirt with a camp collar and chest pockets, drafted from your measurements.',
    faq: [
      { q: 'What weight of linen?', a: 'Medium-weight linen (5-7 oz) gives the right balance of structure and drape. Pre-wash hot to prevent shrinkage after sewing.' },
      { q: 'What is a camp collar?', a: 'A flat open collar with no stand — it folds back over the front placket. Common on resort and workwear shirts.' },
    ],
  },
  'canvas-work-coat': {
    metaDescription: 'Draft a custom-fit canvas work coat sewing pattern. Oversized long coat, band collar, 4 pockets. Tiled PDF.',
    pageIntro: 'An oversized long canvas work coat with a band collar and four pockets, drafted to your measurements.',
    faq: [
      { q: 'Is canvas hard to sew?', a: 'It is stiffer than quilting cotton but sewable on a home machine with a denim needle (90/14) and longer stitch length (3.0 mm).' },
      { q: 'Does canvas soften after washing?', a: 'Yes - prewash before cutting, and each wash will soften it further.' },
    ],
  },
  'wide-leg-trouser-m': {
    metaDescription: 'Draft a custom-fit wide-leg trouser sewing pattern for men. Higher rise, full-width leg, clean drape. Tiled PDF with full instructions.',
    pageIntro: 'Wide-leg trousers drafted to your waist, hip, rise, and inseam. Higher mid-rise with a full-width leg that drapes straight from hip to hem. Flat front default with optional single or double pleats.',
    faq: [
      { q: 'How is this different from the women\'s version?', a: 'The men\'s version uses different rise defaults (mid-rise), smaller crotch extensions, and flat front as the default. The leg width and drape math is the same.' },
      { q: 'What fabric works best?', a: 'Wool suiting or wool blends drape best. Cotton twill, linen, and tencel twill are good warm-weather options.' },
    ],
  },
  'pleated-trouser-m': {
    metaDescription: 'Generate a custom-fit pleated trouser sewing pattern for men. Single pleat, high rise, structured waistband. Tiled PDF.',
    pageIntro: 'Pleated dress trousers with a single front pleat, high rise, and structured waistband.',
    faq: [
      { q: 'What direction do pleats fold?', a: 'Toward the side seam — this opens toward the center front when seated, adding room.' },
      { q: 'What fabric is best for pleated trousers?', a: 'Wool suiting or wool crepe for dress trousers. Cotton twill and linen for casual versions.' },
    ],
  },
  'henley': {
    metaDescription: 'Create a custom-fit Henley shirt sewing pattern. 3-button neckline placket, no collar, relaxed fit. Tiled PDF.',
    pageIntro: 'A relaxed top with a 3-button vertical placket at the neckline and no collar. Works in woven (linen, poplin, chambray) or knit (jersey, interlock) fabric. Set-in sleeve in long, 3/4, or short length.',
    faq: [
      { q: 'What is a Henley?', a: 'A collarless shirt with a partial button placket at the neckline — typically 3-5 buttons. One step up from a plain tee without the formality of a full button-up.' },
      { q: 'Woven or knit?', a: 'Both work. Woven Henleys (linen, poplin) have a more structured look. Knit Henleys (jersey) are softer and have more ease of movement.' },
    ],
  },
  'long-sleeve-henley': {
    metaDescription: 'Draft a custom-fit long sleeve Henley sewing pattern. 3-button placket, knit, relaxed fit. Tiled PDF.',
    pageIntro: 'A long-sleeve relaxed knit Henley with a 3-button placket and no collar.',
    faq: [
      { q: 'What knit works best?', a: 'Cotton jersey (5-7 oz) or cotton-modal blend gives the classic Henley feel. Slub jersey adds texture.' },
      { q: 'Do I need a serger?', a: 'A serger gives the best finish on knit seams, but you can use a stretch stitch or narrow zigzag on a standard machine.' },
    ],
  },
  'kids-tee': {
    metaDescription: "Generate a custom-fit kids T-shirt sewing pattern from your child's measurements. Sized 2T–14, beginner-friendly, knit fabric. Tiled PDF included.",
    pageIntro: "A crew or scoop neck T-shirt drafted to your child's chest, shoulder, and torso measurements. Short or long sleeve options. Beginner-friendly with just four pieces.",
    faq: [
      { q: 'What fabric works best for a kids tee?', a: 'Cotton jersey (4–6 oz) is the easiest choice — it washes well, stays soft, and is easy to sew. Rayon jersey drapes beautifully but needs a bit more care.' },
      { q: 'Do I need a serger?', a: 'A serger gives the cleanest finish, but a stretch stitch on a regular machine works well. Use a ballpoint needle 75/11 to avoid snags on knit fabric.' },
    ],
  },
  'kids-joggers': {
    metaDescription: "Draft a custom-fit kids joggers sewing pattern from your child's measurements. Elastic waistband, beginner-friendly. Sizes 2T–14. Tiled PDF.",
    pageIntro: "Pull-on joggers with a full-circle elastic waistband, drafted to your child's waist, hip, and inseam. Straight leg or tapered jogger style. Includes a built-in growth hem tuck.",
    faq: [
      { q: 'Why no drawstring?', a: 'Drawstrings are a safety hazard for young children and are banned from some children\'s garments. The elastic-only waistband is safer and just as comfortable.' },
      { q: 'What is the growth hem tuck?', a: 'The pattern includes a 1.5″ hem allowance. Fold up only 1″ to leave a hidden tuck inside — later you can let it down for another season of wear.' },
    ],
  },
  'kids-leggings': {
    metaDescription: "Create a custom-fit kids leggings sewing pattern from your child's measurements. Zero ease, 4-way stretch knit, elastic waist. Sizes 2T–14. Tiled PDF.",
    pageIntro: "Fitted knit leggings with a full-circle elastic waistband, drafted to your child's measurements. Full length, capri, or bike short options. Just three pieces — the easiest kids pattern.",
    faq: [
      { q: 'What stretch percentage does the fabric need?', a: '4-way stretch with at least 50% stretch recovery is required. Cotton-spandex blends (95/5 or 90/10) are the most popular choice.' },
      { q: 'Can I use this pattern for leggings with pockets?', a: 'The current pattern is pocket-free to keep the construction simple. Side seam pockets can be added by sewing pocket bags into the side seams before closing them.' },
    ],
  },
  'kids-shorts': {
    metaDescription: "Generate custom-fit kids pull-on shorts from your child's measurements. Elastic waist, beginner-friendly. Sizes 2T–14. Tiled PDF included.",
    pageIntro: "Simple pull-on shorts with a full-circle elastic waistband, drafted to your child's waist and hip measurements. Choose from short, mid, or bermuda length. The most beginner-friendly kids pattern.",
    faq: [
      { q: 'What fabric works for kids shorts?', a: 'Cotton twill and cotton poplin give a crisp, durable result great for everyday wear. Cotton jersey makes a softer, more athletic pull-on short.' },
      { q: 'How long should the elastic be?', a: 'Cut the elastic to about 85% of your child\'s waist measurement — it should stretch on comfortably but hold up securely during play.' },
    ],
  },
  'kids-dress': {
    metaDescription: "Draft a custom-fit kids A-line dress sewing pattern from your child's measurements. Elastic back neck, beginner-friendly. Sizes 2T–14. Tiled PDF.",
    pageIntro: "A shaped bodice with a flared A-line skirt, drafted to your child's chest, shoulder, and full length measurements. No bust dart — flat chest block. Back neck elastic for easy over-head dressing.",
    faq: [
      { q: 'What fabric is best for a kids dress?', a: 'Lightweight cotton lawn, poplin, or linen blend drapes beautifully and washes easily. Pre-wash before cutting — natural fibers can shrink 3–5%.' },
      { q: 'How does the back neckline work without a zipper?', a: 'The back neckline has a casing for ¼″ elastic that stretches enough for the dress to go over a child\'s head. This makes dressing easier and eliminates the need for a zipper.' },
    ],
  },
};

export default SEO_DESCRIPTIONS;
