# AFTBot Integration Guide for Existing Angular Website (https://apexfalcontechnologies.com)

This guide provides instructions for embedding the **AFTBot** widget into your existing Angular website.

---

## 1. Hosting Architecture Overview

Because your existing website and the bot services are hosted separately:
1. **Existing Website**: `https://apexfalcontechnologies.com`
2. **Bot UI (`AFTBot.Web`)**: Hosted at (e.g.) `https://bot.apexfalcontechnologies.com`
3. **Bot API (`AFTBot.Api`)**: Hosted at (e.g.) `https://api-bot.apexfalcontechnologies.com`

---

## 2. Method 1: Drop-in Embed Script (Recommended)

This method requires **no changes** to your existing Angular TypeScript source code.

### Step 1: Add Script to `index.html`
In your existing Angular project (`https://apexfalcontechnologies.com`), open `src/index.html` and add this script right before `</body>`:

```html
<!-- Apex Falcon Technologies AFTBot Embed -->
<script 
  src="https://<YOUR_BOT_UI_HOST>/aftbot-embed.js" 
  data-widget-url="https://<YOUR_BOT_UI_HOST>/widget"
  data-api-url="https://<YOUR_BOT_API_HOST>/api"
  defer>
</script>
```

### Local Development / Testing Example:
```html
<script 
  src="http://localhost:4200/aftbot-embed.js" 
  data-widget-url="http://localhost:4200/widget"
  data-api-url="http://localhost:5000/api"
  defer>
</script>
```

### How the Script Works:
1. Creates an unobtrusive fixed container at the bottom-right corner of the page.
2. **Dynamic Resizing via `postMessage`**:
   - When collapsed: The container shrinks to `100px x 100px`, ensuring **100% of your website remains clickable** with no invisible overlay blocking menus or buttons.
   - When expanded: The container expands to `440px x 660px` to display the conversation window.
3. **Session Persistence**: Maintains visitor conversations across page navigations and reloads.

---

## 3. Method 2: Direct Template Embed in Angular `app.component.html`

If your web team prefers to manage the iframe directly in Angular:

In your existing Angular website's `app.component.html`:

```html
<!-- Floating AFTBot Window -->
<iframe 
  src="https://<YOUR_BOT_UI_HOST>/widget?apiUrl=https%3A%2F%2F<YOUR_BOT_API_HOST>%2Fapi" 
  title="Apex Falcon AFTBot"
  style="position: fixed; bottom: 0; right: 0; width: 440px; height: 660px; max-width: 100vw; max-height: 100vh; border: none; z-index: 9999999; background: transparent; pointer-events: auto;"
  allow="clipboard-write">
</iframe>
```

---

## 4. Backend API Security & CORS Configuration

In `AFTBot.Api/appsettings.json` (or via environment variables in production):

```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://apexfalcontechnologies.com",
      "https://www.apexfalcontechnologies.com",
      "https://<YOUR_BOT_UI_HOST>",
      "http://localhost:4200"
    ]
  }
}
```

### Content-Security-Policy (CSP):
`AFTBot.Api` automatically attaches the following header on every response:
```text
Content-Security-Policy: frame-ancestors 'self' https://apexfalcontechnologies.com https://www.apexfalcontechnologies.com;
```
This protects your bot from clickjacking by ensuring no unauthorized third-party domain can embed your bot.

---

## 5. Pre-Deployment Checklist

1. [ ] Deploy `AFTBot.Api` to your backend server or cloud container (e.g. Azure App Service / AWS ECS).
2. [ ] Verify SQL Server connectivity via `GET https://<YOUR_BOT_API_HOST>/health` (returns `Healthy`).
3. [ ] Set `AzureOpenAI:Endpoint`, `AzureOpenAI:ApiKey`, and `AzureOpenAI:DeploymentName` in production environment settings.
4. [ ] Build `AFTBot.Web` using `ng build --configuration production` and deploy to your CDN/static web host (e.g. Cloudflare Pages, S3/CloudFront, Azure Static Web Apps).
5. [ ] Add the `<script src=".../aftbot-embed.js">` tag to `index.html` on `https://apexfalcontechnologies.com`.
6. [ ] Open `https://apexfalcontechnologies.com`, verify the floating widget displays, test a conversation, and verify lead capture in the Admin Dashboard (`https://<YOUR_BOT_UI_HOST>/dashboard`).
