Since the goal is functional, minimalist, and developer-friendly, the prompt should explicitly ask the AI to adhere to those constraints while ensuring the design clearly separates the input form from the output display.

Here is a blunt, effective prompt you can give to an image generation AI (like DALL-E, Midjourney, or Gemini's Image Tool) to get a high-quality, professional, and practical UI concept:

---

### 🎨 AI Image Generation Prompt

> "Generate a **minimalist, modern, and developer-friendly UI concept** for a 'Digital Library Management' application.
>
> **Style:** Clean, flat design (no gradients), high contrast, using a color scheme of **dark navy blue and bright orange** as accents against a stark white or light gray background. Think GitHub or Vercel aesthetic.
>
> **Layout:** The page must be clearly divided into two main, distinct sections:
>
> 1.  **Left/Top Section (Input):** A clean form titled 'Add New Book.' Include labeled fields for 'Title,' 'Author,' 'Pages,' and a distinct toggle switch or checkbox for 'Read Status.' The submit button should be the primary accent color (orange).
> 2.  **Right/Bottom Section (Display):** Titled 'Current Books.' Show a grid of at least four compact, card-style elements. Each card must clearly display the book's title, author, and page count. Include two small action buttons on each card: a 'Toggle Read Status' button and a 'Remove' button.
>
> **Crucially, the design must look like a functional web application, not a marketing page.** Focus on structure, clear typography, and excellent information hierarchy. Use the font family 'Inter' or similar clean sans-serif."


create object literal, destructure object with class keyword and constrution function, and construct a new template with the new keyword.



<div class="book-card">
                <div class="book-info">
                    <p class="card-title">**[Book Title]**</p>
                    <p class="card-author">by [Author Name]</p>
                    <p class="card-pages">[XXX] pages</p>
                </div>
                <div class="book-actions">
                    <button class="status-btn" data-index="0">Read / Not Read</button>
                    <button class="remove-btn" data-index="0">Remove</button>
                </div>
            </div>