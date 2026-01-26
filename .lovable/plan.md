
## Plan: Fix OG Image Size and Dimensions

### Issues Identified
| Issue | Current | Required |
|-------|---------|----------|
| File size | 730.78 KB | < 600 KB |
| Dimensions | 1344x768px | 1200x630px |

### Solution

Regenerate the OG image with the correct specifications while keeping the same design:

**File: `public/og-image.png`**

1. Use the AI image generation tool to recreate the same design:
   - Dark charcoal/slate background
   - 3D metallic cube logo on the left
   - "BlockDrive" text in white
   - "Cloud Storage for the New Internet" tagline in teal/cyan
   - Minimalistic layout

2. Specify exact dimensions: **1200x630px** (standard OG ratio)

3. The regenerated image will be optimized to be under 600 KB

### Technical Details

- Use the existing OG image as reference for the regeneration
- Pass the favicon/logo reference for brand consistency
- Request PNG output optimized for web (smaller file size)
- No changes needed to `index.html` - the meta tags already point to the correct file path

### Expected Outcome
- OG image at exactly 1200x630px
- File size under 600 KB
- Same visual design maintained
- Full compatibility with WhatsApp, Twitter, Facebook, LinkedIn, etc.
