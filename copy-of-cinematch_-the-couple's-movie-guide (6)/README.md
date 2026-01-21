# CineMatch: The Ultimate Couple's Guide 🍿

Hi Dara! To fix the blank screen and get the app live, follow these exact settings in Vercel.

## 🚀 Vercel Deployment Settings

When you import your project into Vercel, check these three things:

1.  **Framework Preset**: Select **Vite**. (If it's on "Other", click it and scroll to find Vite).
2.  **Root Directory**: Keep this as `./` (the default).
3.  **Environment Variables**:
    *   **Name**: `VITE_API_KEY`
    *   **Value**: (Your Gemini API Key from Google AI Studio)
    *   *Note: If you already added `API_KEY`, delete it and add `VITE_API_KEY` instead.*

## 🛠 Troubleshooting the Blank Screen
If you still see a blank screen, it is usually one of these two things:

*   **The Script Tag**: Ensure your `index.html` looks exactly like the one in this project. It should NOT have a "script type=importmap" section. I have removed it in the latest version.
*   **Case Sensitivity**: Ensure your files are named exactly as shown (e.g., `App.tsx` with a capital A, `index.tsx` with a lowercase i).

## How to Sync with Ari
1.  Open the site on your phone.
2.  Select your streaming services and a vibe.
3.  Like a few movies.
4.  Click **"Share Progress with Ari"**.
5.  Text him the link. When he opens it, your likes will show up on his phone!

Now, go enjoy a movie night! 🎬