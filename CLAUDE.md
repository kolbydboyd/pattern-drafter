# People's Patterns — Update Session

Work through every numbered task below in order. Complete 
each task fully before moving to the next. After every task 
run `npm run build` to catch errors early. Do not stop for 
confirmation unless you hit an error you cannot resolve.

When all tasks are complete, report:
- Which tasks were completed successfully
- Any tasks that were skipped and why
- Any remaining build errors

## 1 - Polished Email Templates
Create polished HTML email templates for People's 
Patterns in src/lib/email-templates.js.

Brand:
  Font: system-ui with IBM Plex Mono for code/data
  Primary color: #2c2a26 (near black)
  Gold accent: #c9a96e
  Background: #f5f3ef (warm off-white)
  Max width: 560px centered
  Border radius: 6px on cards

Create these templates as functions that return 
HTML strings:

1. welcomeEmail({ name })
Subject: "Welcome to People's Patterns"

Layout:
  [Logo / wordmark: "People's Patterns" in gold]
  [Thin gold rule]
  
  "Made-to-measure patterns, starting at $7."
  
  "You're all set. Here's how to get started:"
  
  [Three steps in a clean grid]
  1. Enter your measurements once
     Takes 3 minutes. Save them to your profile 
     and never measure again.
  2. Choose your garment
     23 patterns and growing. Every one drafted 
     to your body, not a size chart.
  3. Print and sew
     Tiles to standard printer paper. Full 
     materials list and construction guide included.
  
  [Button: "Start Your First Pattern" → site URL]
  
  [Thin rule]
  "How to measure yourself →" (link to guide)
  
  [Footer]
  People's Patterns · peoplespatterns.com
  @peoplespatterns
  You're receiving this because you created an 
  account. [Unsubscribe] (for non-transactional only)

2. purchaseConfirmationEmail({ name, garmentName, 
   downloadUrl, measurements, expiresHours = 48 })
Subject: "Your [garmentName] pattern is ready"

Layout:
  [Logo]
  [Gold rule]
  
  "Your [garmentName] pattern is ready."
  
  [Large gold button: "Download Pattern →"]
  
  "This link expires in 48 hours. You can 
   re-download any time from your account."
  
  [Card: "Drafted to your measurements"]
  Show 4-6 key measurements in a clean two-column
  grid using monospace font:
    Waist    32″
    Hip      38″
    Rise     10.5″
    Inseam   30″
  
  [Thin rule]
  
  "Questions about your pattern? Reply to 
   this email — we read every one."
  
  [Footer]
  Order confirmation · peoplespatterns.com

3. fitFeedbackEmail({ name, garmentName, 
   purchaseDate, feedbackUrl })
Subject: "How did your [garmentName] fit?"

Layout:
  [Logo]
  [Gold rule]
  
  "Hope your [garmentName] turned out great."
  
  "If you've had a chance to sew it, your fit 
   feedback helps us improve the pattern for 
   everyone with similar measurements."
  
  [Button: "Share How It Fit →" → feedback form]
  
  [Three options as visual pills]
  "It fit perfectly"  "Needed adjustments"  "Still working on it"
  (all link to the feedback form)
  
  "Takes 2 minutes. Your response directly 
   improves the geometry for the next person 
   who sews this pattern."
  
  [Footer]
  You purchased [garmentName] on [date]
  peoplespatterns.com · Unsubscribe

4. passwordResetEmail({ resetUrl })
Subject: "Reset your People's Patterns password"

Layout:
  [Logo]
  [Gold rule]
  
  "Password reset requested."
  
  "Click the button below to set a new password. 
   This link expires in 1 hour."
  
  [Button: "Reset Password →"]
  
  "If you didn't request this, ignore this email. 
   Your password won't change."
  
  [Footer]
  peoplespatterns.com

All templates should:
  - Be responsive (work on mobile email clients)
  - Use inline CSS only (email clients strip <style> tags)
  - Include a plain text fallback version
  - Have preheader text (hidden preview text after subject)
  - Be tested against common email clients
    (Gmail, Apple Mail, Outlook basics)

## 2 - Centered Auth Modal with Benefits
Fix the auth modal positioning and add a benefits 
panel to the signup state.

POSITIONING:
  Change from upper-right to centered on screen.
  Add a dark overlay behind it:
    position: fixed
    inset: 0
    background: rgba(0, 0, 0, 0.55)
    z-index: 1000
    display: flex
    align-items: center
    justify-content: center
  
  The modal itself:
    max-width: 480px
    width: calc(100% - 32px)
    background: var(--bg-color)
    border-radius: 8px
    padding: 2rem
    box-shadow: 0 20px 60px rgba(0,0,0,0.3)
  
  Click outside the modal to close it.
  ESC key closes it.

SIGNUP STATE — add a benefits section above the form:

  "Save your measurements and get:"
  
  [Four benefit rows with gold checkmarks]
  ✓  Measurement profiles — enter once, use forever
  ✓  Purchase history — re-download any time
  ✓  Fit history — track what works for your body
  ✓  New pattern notifications
  
  [thin rule]
  
  [then the email/password form below]

LOGIN STATE — keep clean, no benefits panel.
  Just the form with a subtle 
  "Don't have an account? Sign up free" link.

TRIGGER MESSAGE — when the modal opens from a 
specific action, show a contextual headline:

  Triggered by save profile:
    "Save your measurements"
    Subtext: "Create a free account to save your 
    measurements and access them anywhere."

  Triggered by download/purchase:
    "Create an account to purchase"
    Subtext: "You'll be able to re-download 
    this pattern any time from your account."

  Triggered by header button:
    "Welcome to People's Patterns"
    No subtext.

Pass the trigger context when calling 
openAuthModal(trigger) so it can show the 
right headline.



## When all tasks are complete:
- Run `npm run build` one final time
- Confirm no files still contain `effCrossBack`
- Confirm no files still contain `calf / 4` or `ankle / 4`
- Confirm `easeDistribution` returns `total * 0.2` and `total * 0.3`
- Report which tasks were completed and any that were skipped