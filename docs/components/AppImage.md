# AppImage Component

A wrapper component around Next.js Image that provides Cloudinary integration with automatic optimization and blur placeholders.

## Location
`src/components/AppImage.tsx`

## Overview
AppImage is an optimized image component that handles Cloudinary transformations, automatic format selection, quality optimization, and blur placeholders for better user experience.

## Props

```typescript
interface AppImageProps {
  alt?: string;
  sizes?: string;
  width?: number | `${number}` | undefined;
  height?: number | `${number}` | undefined;
  imageSource?: IServerFile;
}
```

### Props Details
- `alt`: Alternative text for accessibility
- `sizes`: Responsive image sizes (Next.js Image prop)
- `width`: Image width (Next.js Image prop)
- `height`: Image height (Next.js Image prop)
- `imageSource`: Server file object containing provider and key information

## IServerFile Interface
```typescript
interface IServerFile {
  provider: "cloudinary" | "r2" | string;
  key: string;
}
```

## Usage Examples

### Basic Usage
```typescript
import AppImage from '@/components/AppImage';

function ArticleCover() {
  const imageSource = {
    provider: "cloudinary",
    key: "articles/my-article-cover"
  };

  return (
    <AppImage
      imageSource={imageSource}
      alt="Article cover image"
      width={800}
      height={400}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### With Different Providers
```typescript
// Cloudinary image
const cloudinaryImage = {
  provider: "cloudinary",
  key: "profile-photos/user-avatar"
};

// R2/Other provider image
const r2Image = {
  provider: "r2",
  key: "https://example.com/image.jpg"
};

return (
  <div>
    <AppImage imageSource={cloudinaryImage} alt="User avatar" />
    <AppImage imageSource={r2Image} alt="External image" />
  </div>
);
```

### Responsive Image Grid
```typescript
function ImageGallery({ images }: { images: IServerFile[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <AppImage
          key={index}
          imageSource={image}
          alt={`Gallery image ${index + 1}`}
          width={300}
          height={300}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      ))}
    </div>
  );
}
```

## Features

### Cloudinary Integration
- **Automatic format**: Selects optimal format (WebP, AVIF, etc.)
- **Quality optimization**: Auto quality based on content
- **URL generation**: Constructs optimized Cloudinary URLs
- **Blur placeholder**: Generates blurred version for loading states

### Performance Optimizations
- **Lazy loading**: Images load only when needed
- **Responsive sizing**: Proper sizes attribute for responsive images
- **Format selection**: Automatic modern format selection
- **Quality adjustment**: Optimal quality for file size balance

### Fallback Handling
- **Provider fallback**: Handles non-Cloudinary providers
- **Default placeholder**: Falls back to local placeholder image
- **Error handling**: Graceful degradation for missing images

## Cloudinary Transformations

### Applied Automatically
```typescript
// Quality optimization
.quality("auto")

// Format optimization
.format("auto")

// Blur placeholder
.effect(blur(100000))
```

### Generated URLs
```typescript
// Original image
"https://res.cloudinary.com/techdiary-dev/image/upload/q_auto,f_auto/v1/path/to/image"

// Blur placeholder
"https://res.cloudinary.com/techdiary-dev/image/upload/q_auto,f_auto,e_blur:100000/v1/path/to/image"
```

## Provider Support

### Cloudinary Provider
- Full transformation support
- Automatic optimization
- Blur placeholder generation
- Format and quality selection

### Other Providers (R2, Direct URLs)
- Direct URL passthrough
- Default placeholder image
- No transformations applied
- Basic Next.js Image functionality

## Implementation Details

### Cloudinary Setup
```typescript
const cld = new Cloudinary({
  cloud: { cloudName: "techdiary-dev" },
});
```

### URL Construction
```typescript
// Main image URL
const imageUrl = cld
  .image(imageSource.key)
  .quality("auto")
  .format("auto")
  .toURL();

// Blur placeholder URL
const blurUrl = cld
  .image(imageSource.key)
  .quality("auto")
  .format("auto")
  .effect(blur(100000))
  .toURL();
```

## Best Practices

### Sizing and Responsive
```typescript
// Provide proper dimensions
<AppImage
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Use aspect ratio classes for responsive design
<div className="aspect-video">
  <AppImage imageSource={image} alt="Video thumbnail" />
</div>
```

### Accessibility
```typescript
// Always provide meaningful alt text
<AppImage
  imageSource={profilePhoto}
  alt={`Profile photo of ${user.name}`}
/>

// Use empty alt for decorative images
<AppImage
  imageSource={decorativeImage}
  alt=""
  role="presentation"
/>
```

### Performance
```typescript
// Use appropriate sizes for responsive images
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

// Preload important images
<link
  rel="preload"
  as="image"
  href={generateImageUrl(imageSource)}
/>
```

## Common Use Cases

### Article Cover Images
```typescript
function ArticleCover({ coverImage }: { coverImage: IServerFile }) {
  return (
    <div className="aspect-video overflow-hidden rounded-lg">
      <AppImage
        imageSource={coverImage}
        alt="Article cover"
        width={1200}
        height={630}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      />
    </div>
  );
}
```

### User Avatars
```typescript
function Avatar({ profilePhoto, userName }: { 
  profilePhoto: IServerFile; 
  userName: string; 
}) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden">
      <AppImage
        imageSource={profilePhoto}
        alt={`${userName}'s avatar`}
        width={40}
        height={40}
      />
    </div>
  );
}
```

### Image Galleries
```typescript
function Gallery({ images }: { images: IServerFile[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <AppImage
          key={index}
          imageSource={image}
          alt={`Gallery image ${index + 1}`}
          width={400}
          height={300}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
    </div>
  );
}
```

## Error Handling

The component gracefully handles:
- Missing imageSource prop
- Invalid Cloudinary keys
- Network errors
- Unsupported image formats

## Environment Configuration

Ensure Cloudinary is properly configured:
```typescript
// Environment variables
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=techdiary-dev
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Related Components

- **ImageDropzoneWithCropper**: For image uploads with editing
- **Next.js Image**: Base component being wrapped
- **Cloudinary SDK**: For URL generation and transformations