# Cellgroup Games Zone

A neo-brutalist web application showcasing highly energetic and chaotic games for a large cellgroup gathering (50+ players).

## Live Demo
You can view the live site and watch the game mechanics tutorial video directly here:
[GitHub Pages Link (Add later if enabled)]

## Project Structure
- `index.html` - The main webpage built with Tailwind CSS and a neo-brutalist design aesthetic.
- `assets/` - Contains the static assets for the website.
  - `assets/images/` - AI-generated illustrations for the games.
  - `assets/videos/` - The compiled motion-graphics tutorial demo for the games.
- `video-generator/` - The source code for generating the tutorial video using [Hyperframes](https://github.com/aidenybai/hyperframes) and GSAP. 

## Editing the Video Tutorial
The video was generated using Hyperframes. To modify the video tutorial:

1. Navigate to the video generator directory:
   ```bash
   cd video-generator
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Edit the `index.html` file inside `video-generator/` to change the GSAP animation timeline or the HTML structure.
4. Render the new video output to the assets folder:
   ```bash
   npx hyperframes render -o ../assets/videos/games-demo.mp4
   ```

## Development
To run this project locally, you don't need any special build tools since the site is a static HTML file using Tailwind and GSAP via CDNs. 
Just open `index.html` in your web browser!

## Design Details
- **Theme:** Neo-Brutalism
- **Typography:** Alfa Slab One (Headers) and Inter (Body)
- **Colors:** Deep Black (`#18181B`), Cream (`#FFFDF5`), Yellow (`#FACC15`), Orange (`#F59E0B`), Blue (`#38BDF8`)
