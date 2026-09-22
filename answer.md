# Do you need the full Daraz-style KYC document workflow?

**Short answer: No.** For a college project your current seller-verification flow is enough — and actually more appropriate for a craft marketplace.

## What Daraz does (heavy KYC)
- Citizenship / passport scan
- PAN certificate
- Business registration certificate (for businesses)
- Passport photo
- Bank account + cheque/statement photo

This exists because Daraz is a large commercial platform that must comply with tax law and handle real payouts to thousands of sellers. That's a compliance requirement, not a feature.

## What your system already has
Your KalaBazzar `/seller/apply` flow picks between three verification paths:

| Path | What the seller provides |
|------|--------------------------|
| `social-media` | Links to social profiles |
| `marketplace` | Links to other marketplace profiles |
| `offline-artisan` | Workshop photos + craft story |

An admin then reviews and approves/rejects at `/admin/sellers`. That is a complete, demoable verification cycle (submit → review → approve → role upgrade → email).

## Why you should NOT build the full KYC for this project
1. **Time cost** — citizenship/PAN/bank-document uploads mean new upload fields, validation, secure storage, an admin review UI for every doc type, and 3-4 new model fields. That's a lot of work for little demo value.
2. **No real reason for it** — you use mock payments (`PAYMENT_MODE=mock`), so there are no real payouts that would legally require PAN/bank verification.
3. **Sensitivity** — handling citizenship/PAN scans in a student project raises privacy/security concerns you'd have to defend in a viva.
4. **More believable for your story** — a Nepali-handicraft marketplace authenticates artisans by their **craft**, not by government ID. Workshop photos + craft story is exactly what a real craft platform ("Are you actually the maker?") would want.

## What I'd recommend
- **Keep the 3-path flow as-is** — it's already "realistic enough."
- If you want an extra realistic touch without the heavy KYC, add a single optional text field like **PAN number** to the application form and display it to the admin in the review panel. One field, no file upload, no storage risk.
- If you're asked at viva *"why no citizenship/PAN like Daraz?"*, answer: Daraz is a mass marketplace running real-money payouts under tax compliance; KalaBazzar is an artisan-first marketplace with mock payouts, so identity is verified through craft-based proof (workshop, portfolio, store links) reviewed by an admin — which is a deliberate product decision, not an omission.

## Bottom line
Don't rebuild it. The step-by-step Daraz workflow you pasted is for a commercial platform; your `/seller/apply` → admin approval flow already demonstrates the same idea (apply → verify → approve → sell) with less overhead that fits a college project.