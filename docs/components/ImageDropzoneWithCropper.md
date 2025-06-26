# ImageDropzoneWithCropper Component

A comprehensive image upload component with drag-and-drop support, cropping functionality, and cloud storage integration.

## Location
`src/components/ImageDropzoneWithCropper.tsx`

## Overview
ImageDropzoneWithCropper provides a complete image upload solution with drag-and-drop interface, image cropping capabilities, file management, and integration with cloud storage services.

## Props

```typescript
interface DropzoneWithCropperProps {
  prefillFile?: IServerFile | null;
  disabled?: boolean;
  label?: string;
  Icon?: React.ReactNode;
  enableCropper?: boolean;
  uploadDirectory?: DIRECTORY_NAME;
  uploadUniqueFileName?: boolean;
  onUploadComplete?: (serverFile: IServerFile) => void;
  onFileDeleteComplete?: () => void;
  aspectRatio?: number;
}
```

### Props Details
- `prefillFile`: Pre-existing file to display
- `disabled`: Disable upload functionality
- `label`: Custom dropzone label text
- `Icon`: Custom upload icon
- `enableCropper`: Enable image cropping modal
- `uploadDirectory`: Target upload directory
- `uploadUniqueFileName`: Generate unique filenames
- `onUploadComplete`: Callback when upload succeeds
- `onFileDeleteComplete`: Callback when file is deleted
- `aspectRatio`: Crop aspect ratio (default: 1)

## Usage Examples

### Basic Image Upload
```typescript
import ImageDropzoneWithCropper from '@/components/ImageDropzoneWithCropper';
import { DIRECTORY_NAME } from '@/backend/models/domain-models';

function ProfilePhotoUpload() {
  const handleUploadComplete = (file: IServerFile) => {
    console.log('Upload completed:', file);
    // Update user profile photo
  };

  return (
    <ImageDropzoneWithCropper
      uploadDirectory={DIRECTORY_NAME.PROFILE_PHOTOS}
      onUploadComplete={handleUploadComplete}
      aspectRatio={1}
      label="Upload profile photo"
    />
  );
}
```

### Image Upload with Cropping
```typescript
function ArticleCoverUpload() {
  const [coverImage, setCoverImage] = useState<IServerFile | null>(null);

  return (
    <ImageDropzoneWithCropper
      enableCropper={true}
      aspectRatio={16/9}
      uploadDirectory={DIRECTORY_NAME.ARTICLE_IMAGES}
      onUploadComplete={setCoverImage}
      prefillFile={coverImage}
      onFileDeleteComplete={() => setCoverImage(null)}
      label="Upload article cover"
    />
  );
}
```

### Gallery Upload
```typescript
function GalleryImageUpload() {
  const [images, setImages] = useState<IServerFile[]>([]);

  const handleUpload = (file: IServerFile) => {
    setImages(prev => [...prev, file]);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <ImageDropzoneWithCropper
        uploadDirectory={DIRECTORY_NAME.GALLERY}
        onUploadComplete={handleUpload}
        uploadUniqueFileName={true}
        aspectRatio={4/3}
      />
      {images.map((image, index) => (
        <ImageDropzoneWithCropper
          key={index}
          prefillFile={image}
          onFileDeleteComplete={() => {
            setImages(prev => prev.filter((_, i) => i !== index));
          }}
        />
      ))}
    </div>
  );
}
```

## Features

### Drag and Drop Interface
- **Visual feedback**: Highlighting on drag over
- **File validation**: Accepts only image files
- **Error states**: Visual indication of rejected files
- **Accessibility**: Keyboard navigation support

### Image Cropping
- **Advanced cropper**: Uses react-advanced-cropper library
- **Aspect ratio control**: Configurable aspect ratios
- **Image manipulation**: Flip, rotate, and crop operations
- **Grid overlay**: Visual crop guidelines
- **Real-time preview**: Live crop preview

### File Management
- **Upload progress**: Loading states during upload
- **Delete functionality**: Remove uploaded files
- **File preview**: Display uploaded images
- **Error handling**: Upload failure management

## Cropper Features

### Image Transformations
```typescript
// Horizontal flip
const flip = (horizontal: boolean, vertical: boolean) => {
  cropperRef.current?.flipImage(horizontal, vertical);
};

// Rotation (90-degree increments)
const rotate = (angle: number) => {
  cropperRef.current?.rotateImage(angle);
};
```

### Crop Controls
- **Flip horizontal**: Mirror image horizontally
- **Flip vertical**: Mirror image vertically  
- **Rotate 90°**: Rotate image clockwise
- **Aspect ratio**: Maintain consistent proportions
- **Grid overlay**: Visual cropping guides

## Upload Process

### Without Cropping
1. User drops/selects image
2. File validation
3. Direct upload to storage
4. Callback with file information

### With Cropping
1. User drops/selects image
2. Convert to base64 for preview
3. Open cropping modal
4. User adjusts crop/rotation
5. Generate cropped blob
6. Upload processed image
7. Callback with file information

## File Storage Integration

### Supported Providers
```typescript
// R2 (Cloudflare)
{
  provider: "r2",
  key: "unique-filename.jpg"
}

// Directory-based organization
uploadDirectory: DIRECTORY_NAME.PROFILE_PHOTOS
// Results in: "profile-photos/unique-filename.jpg"
```

### Upload Configuration
```typescript
uploadFile({
  files: [file],
  directory: DIRECTORY_NAME.ARTICLE_IMAGES,
  generateUniqueFileName: true
})
```

## Hooks Used

### Custom Hooks
- `useServerFile`: File upload/delete operations
- `useToggle`: Modal state management

### React Hooks
- `useRef`: Cropper instance reference
- `useState`: Base64 image state

## Component States

### Empty State (No File)
```typescript
// Dropzone with upload prompt
<div className="dropzone">
  <UploadIcon />
  <p>Drop file here</p>
</div>
```

### Uploading State
```typescript
// Loading indicator during upload
{uploading && (
  <div>
    <Loader className="animate-spin" />
    <p>Uploading...</p>
  </div>
)}
```

### Uploaded State (With File)
```typescript
// Display uploaded image with delete option
<div className="relative">
  <img src={getFileUrl(prefillFile)} />
  <button onClick={handleDelete}>
    <TrashIcon />
  </button>
</div>
```

## Cropping Modal

### Modal Structure
```typescript
<Dialog open={modalOpen} onOpenChange={modelHandler.close}>
  <DialogContent>
    <Cropper
      ref={cropperRef}
      src={base64}
      stencilProps={{ grid: true, aspectRatio }}
    />
    <div className="controls">
      {/* Flip and rotate buttons */}
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Processing Pipeline
1. Get canvas from cropper
2. Convert canvas to blob
3. Upload blob to storage
4. Return file information
5. Close modal

## Styling and Layout

### Dropzone Styling
```typescript
// Dynamic classes based on state
className={clsx(
  "grid w-full h-full p-4 border border-dotted rounded-md",
  {
    "bg-green-100": isFileDialogActive,
    "bg-primary": isDragReject,
    "cursor-not-allowed": disabled,
  }
)}
```

### Responsive Design
- Adaptive aspect ratios
- Mobile-friendly touch controls
- Responsive modal sizing
- Optimized for various screen sizes

## Error Handling

### Upload Errors
```typescript
.catch((err) => {
  console.log(err);
  alert("Error uploading file");
});
```

### File Validation
- Image-only file acceptance
- File size limitations (via dropzone config)
- MIME type validation
- Error state visual feedback

## Accessibility Features

- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: Proper ARIA labels
- **Focus management**: Logical tab order
- **Error announcements**: Screen reader error feedback

## Performance Optimizations

### Image Processing
- **Client-side cropping**: Reduces server load
- **Blob conversion**: Efficient binary handling
- **Canvas optimization**: Memory-efficient processing

### Upload Optimization
- **Unique filenames**: Prevents conflicts
- **Directory organization**: Structured storage
- **Progress indication**: User feedback during upload

## Common Use Cases

### Profile Photo Upload
```typescript
<ImageDropzoneWithCropper
  enableCropper={true}
  aspectRatio={1}
  uploadDirectory={DIRECTORY_NAME.PROFILE_PHOTOS}
  onUploadComplete={(file) => updateUserProfile({ photo: file })}
/>
```

### Article Cover Images
```typescript
<ImageDropzoneWithCropper
  enableCropper={true}
  aspectRatio={16/9}
  uploadDirectory={DIRECTORY_NAME.ARTICLE_IMAGES}
  onUploadComplete={(file) => setArticleCover(file)}
  label="Upload article cover (16:9 ratio)"
/>
```

### Product Images
```typescript
<ImageDropzoneWithCropper
  enableCropper={true}
  aspectRatio={4/3}
  uploadDirectory={DIRECTORY_NAME.PRODUCTS}
  uploadUniqueFileName={true}
  onUploadComplete={addProductImage}
/>
```

## Dependencies

### External Libraries
- `react-dropzone`: Drag and drop functionality
- `react-advanced-cropper`: Image cropping capabilities
- `lucide-react`: Icons for UI elements

### Internal Dependencies
- `useServerFile`: Upload/delete functionality
- `useToggle`: Modal state management
- `getFileUrl`: File URL generation utility

## Best Practices

### File Management
```typescript
// Always handle upload completion
onUploadComplete={(file) => {
  // Update application state
  setImageFile(file);
  // Show success message
  showSuccess("Image uploaded successfully");
}}

// Handle deletion properly
onFileDeleteComplete={() => {
  // Clear application state
  setImageFile(null);
  // Show confirmation
  showInfo("Image deleted");
}}
```

### User Experience
```typescript
// Provide clear labels
label="Drop your profile photo here or click to browse"

// Use appropriate aspect ratios
aspectRatio={16/9} // For covers
aspectRatio={1}    // For avatars
aspectRatio={4/3}  // For general images

// Enable cropping for precise control
enableCropper={true}
```

### Error Handling
```typescript
// Validate files before upload
accept={{ "image/*": [".jpeg", ".jpg", ".png", ".webp"] }}

// Handle network errors gracefully
.catch((error) => {
  showError("Upload failed. Please try again.");
  console.error("Upload error:", error);
});
```