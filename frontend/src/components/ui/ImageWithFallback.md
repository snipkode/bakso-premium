# ImageWithFallback Component

Robust image loading component with automatic retry, timeout, and SVG fallback.

## Features

- ✅ **Automatic retry** with exponential backoff (1s, 2s, 4s)
- ⏱️ **Configurable timeout** per image fetch (default: 3s)
- 🔄 **Unique URL generation** to prevent browser caching
- 🎨 **Multiple SVG fallbacks** (bowl, food, drink, emoji)
- ⚡ **Priority loading** for above-the-fold images
- 📱 **Lazy loading** for below-the-fold images
- ✨ **Loading animation** with shimmer + spinner
- 🎯 **Smart drink detection** from product name/category

## Usage

### Basic
```jsx
import { ImageWithFallback } from '@/components/ui/BaseComponents';

<ImageWithFallback
  src={product.image}
  alt={product.name}
  className="w-full h-full object-cover"
/>
```

### With Custom Props
```jsx
<ImageWithFallback
  src={product.image}
  alt={product.name}
  className="w-full h-full object-cover"
  fallbackType="food"  // 'bowl' | 'food' | 'drink' | 'emoji'
  retryLimit={2}       // Number of retries (shows 1/3, 2/3, 3/3)
  imageTimeout={3000}  // Timeout in ms (default: 3000)
  priority={true}      // Load immediately (for above-the-fold)
/>
```

### Auto-detect Drink Category
```jsx
<ImageWithFallback
  src={product.image}
  alt={product.name}
  fallbackType={
    product.category?.name?.toLowerCase().includes('minum') ||
    product.name?.toLowerCase().includes('es ') ||
    product.name?.toLowerCase().includes('jus')
      ? 'drink'
      : 'food'
  }
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | - | Image URL to load |
| `alt` | string | - | Alt text for image |
| `className` | string | - | Additional CSS classes |
| `fallbackType` | string | `'bowl'` | Type of SVG fallback: `'bowl'`, `'food'`, `'drink'`, `'emoji'` |
| `retryLimit` | number | `2` | Number of retry attempts (total attempts = retryLimit + 1) |
| `imageTimeout` | number | `3000` | Timeout in milliseconds for each image fetch |
| `priority` | boolean | `false` | If true, use eager loading with high fetch priority |

## Loading States

### 1. Loading
```
┌─────────────────┐
│   ~~~shimmer~~~ │
│      🍜         │
│   Loading...    │
│    (1/3)        │
└─────────────────┘
```

### 2. Success
```
┌─────────────────┐
│                 │
│   [Image]       │
│                 │
└─────────────────┘
```

### 3. Fallback (after all retries)
```
┌─────────────────┐
│                 │
│   🍜 (SVG)      │
│                 │
└─────────────────┘
```

## Examples

### Menu Page (Grid)
```jsx
{products.map((product, index) => (
  <Card key={product.id}>
    <ImageWithFallback
      src={product.image}
      alt={product.name}
      className="w-full h-full object-cover"
      fallbackType={
        product.category?.name?.toLowerCase().includes('minum') ||
        product.name?.toLowerCase().includes('es ')
          ? 'drink'
          : 'food'
      }
      retryLimit={2}
      imageTimeout={3000}
      priority={index < 8} // First 8 items are priority
    />
  </Card>
))}
```

### Product Detail (Hero)
```jsx
<ImageWithFallback
  src={product.image}
  alt={product.name}
  className="w-full h-full object-cover"
  fallbackType="bowl"
  retryLimit={2}
  imageTimeout={3000}
  priority={true} // Hero image, load immediately
/>
```

### Featured Products (Above Fold)
```jsx
{featuredProducts.slice(0, 6).map((product) => (
  <Card key={product.id}>
    <ImageWithFallback
      src={product.image}
      alt={product.name}
      priority={true} // Above fold, load immediately
    />
  </Card>
))}
```

## Implementation Details

### Retry Logic
```
Attempt 1: Load image (timeout: 3s)
   ↓ error
Wait 1s
   ↓
Attempt 2: Load image with unique URL (timeout: 3s)
   ↓ error
Wait 2s
   ↓
Attempt 3: Load image with unique URL (timeout: 3s)
   ↓ error
Show SVG fallback
```

### URL Cache Busting
```javascript
`${src}?retry=1&t=${Date.now()}&r=${Math.random()}`
// Example: /uploads/products/es-teh.jpg?retry=1&t=1773475643013&r=0.123456
```

### Force Re-mount
```javascript
// Clear image first
setImageSrc('');
setLoading(false);

// Then set new URL after 50ms
setTimeout(() => {
  setImageSrc(newSrc);
  setLoading(true);
}, 50);
```

## Performance Tips

1. **Use priority for above-the-fold images**
   - First 6-8 items in a list
   - Hero images
   - Featured products

2. **Use lazy loading for below-the-fold**
   - Items further down the page
   - Tab content that's not initially visible

3. **Adjust timeout based on use case**
   - Fast networks: 2000ms
   - Default: 3000ms
   - Slow networks: 5000ms

4. **Limit retries for better UX**
   - retryLimit={2} is usually enough (3 total attempts)
   - More retries = longer wait time

## Console Logs

Enable debug mode by checking console:
- `✅ Image loaded successfully`
- `❌ Image error, retry: 0 of 2`
- `🔄 Retrying with: /path.jpg?retry=1&t=123&r=0.456 (attempt 1)`
- `📷 New image src set, retry: 1`
- `⏰ Image load timeout after 3000 ms`
- `❌ All retries exhausted ( 2 ), showing fallback`
- `👀 retryCount changed to: 1`

## Related Files

- Component: `frontend/src/components/ui/BaseComponents.jsx`
- Styles: `frontend/src/index.css` (shimmer + fade-in animations)
- Usage: `MenuPage.jsx`, `HomePage.jsx`, `ProductDetailPage.jsx`, `CartPage.jsx`
