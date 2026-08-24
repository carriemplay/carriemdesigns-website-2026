# Carrie Mah Portfolio - Project Styling Rules

Please adhere to these design guidelines whenever modifying the codebase for this portfolio website:

## 1. Cards and Layout
- **Fun Facts Card (`.hero-right`)**:
  - Must stack horizontally initially with a `12px` gap.
  - The avatar image should remain a raw rectangular layout (no circular masks or border strokes around it).
  - All text blocks inside this card must be left-aligned (never center-aligned).
- **My Experience Job Cards (`.job-item`)**:
  - The job company and dates must be positioned on the same row, anchored to the left and right boundaries respectively.
  - Job roles must use `h4` tags (`<h4 class="job-role">...</h4>`) instead of `h3` tags.

## 2. Link Styling and Anchor Formatting
- **Manager ReadME Link**:
  - Only the text "Manager ReadME" should be wrapped in an anchor `<a>` link.
  - Preceding emoji and context text ("📕 view my ") must remain unbolded plain text.
- **Medium Article Link**:
  - Only the text "Medium article" should be wrapped in an anchor `<a>` link.
  - Preceding and succeeding context text ("📰 view my ", " about The Design Squiggle...") must remain unbolded plain text.
  - Vertically align the emoji to the top of the text block rather than center-aligned.
- **Link Decorations**:
  - Links should be bolded and underlined by default (as styled in `.bold-link`).

## 3. Case Studies
- **Case Study Imagery (`.padded-graphic`)**:
  - Mockup images must sit inside the graphic containers with a minimum of `72px` padding on all sides to prevent squeezed/disproportionate rendering.
- **Case Study Metadata and Tags**:
  - The tags (e.g., `Design Leadership`, `Global Compliance`, `Design Ops`) must use regular title/sentence casing matching the images, never uppercase.
