# Design Steering

## Screen Reference Size

- User-provided screen images are mobile references based on `390 x 844` pixels (`width x height`) unless stated otherwise.
- Treat `390 x 844` as the design reference ratio, not as a fixed viewport size.
- Build inner elements with responsive proportions, spacing relationships, and flexible constraints instead of hard-coded fixed widths.
- Use fixed pixel values only for small atomic details where appropriate, such as border width, icon size, radius, or minimum touch target size.
- If the screen content exceeds the reference height, the page or relevant content container must support vertical scrolling automatically.
- Do not compress, overlap, or remove expected content just to force everything into the reference height.

## Icons

- When an icon is needed, first look for an existing asset in `frontend/assets/Icon`.
- Reuse existing icon assets before adding a new icon library, drawing a custom icon, or creating a new asset.
