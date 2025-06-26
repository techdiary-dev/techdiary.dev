# useServerFile Hook

A custom hook for handling file uploads and deletions to the server using signed URLs and cloud storage.

## Location
`src/hooks/use-file-upload.tsx`

## Signature
```typescript
function useServerFile(): {
  uploadFile: (param: {
    files: FileList | File[];
    directory: DIRECTORY_NAME;
    generateUniqueFileName?: boolean;
  }) => Promise<{
    success: boolean;
    error: string | null;
    data: { keys: string[] } | null;
  }>;
  uploading: boolean;
  deleting: boolean;
  deleteFile: (keys: string[]) => Promise<void>;
}
```

## Parameters
None

## Returns
An object containing:
- `uploadFile`: Function to upload files to the server
- `uploading`: Boolean indicating if an upload is in progress
- `deleting`: Boolean indicating if a deletion is in progress
- `deleteFile`: Function to delete files from the server

## Usage Example

```typescript
import { useServerFile } from '@/hooks/use-file-upload';
import { DIRECTORY_NAME } from '@/backend/models/domain-models';

function FileUploadComponent() {
  const { uploadFile, uploading, deleting, deleteFile } = useServerFile();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const result = await uploadFile({
      files: e.target.files,
      directory: DIRECTORY_NAME.ARTICLE_IMAGES,
      generateUniqueFileName: true
    });

    if (result.success) {
      console.log('Files uploaded:', result.data?.keys);
    } else {
      console.error('Upload failed:', result.error);
    }
  };

  const handleFileDelete = async (fileKeys: string[]) => {
    await deleteFile(fileKeys);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {deleting && <p>Deleting...</p>}
    </div>
  );
}
```

## Upload Function Parameters
- `files`: FileList or File array to upload
- `directory`: Target directory from DIRECTORY_NAME enum
- `generateUniqueFileName` (optional): Whether to generate unique filenames to prevent conflicts

## Features
- **Signed URL uploads**: Uses pre-signed URLs for secure direct uploads
- **Multiple file support**: Can handle single or multiple file uploads
- **Loading states**: Provides loading indicators for both upload and delete operations
- **Unique filename generation**: Optional random string prefix to prevent naming conflicts
- **Error handling**: Returns success/error status with descriptive messages
- **Directory organization**: Files are organized into specific directories

## Implementation Details
- **Step 1**: Generates signed URLs via `/api/storage/sign` endpoint
- **Step 2**: Uploads files directly to cloud storage using signed URLs
- **Step 3**: Returns success status and file keys for reference
- **Content-Type**: Uses `multipart/form-data` for file uploads
- **Random filename**: Uses 30-character random string prefix when enabled

## Directory Structure
Files are organized using the `DIRECTORY_NAME` enum:
- `ARTICLE_IMAGES`: For article-related images
- Other directories as defined in the domain models

## Return Values

### Upload Response
```typescript
{
  success: boolean;
  error: string | null;
  data: { keys: string[] } | null;
}
```

## Common Use Cases
- **Article images**: Upload images for blog posts
- **User avatars**: Profile picture uploads
- **Document attachments**: File attachments for articles
- **Media galleries**: Multiple image uploads
- **File management**: Upload and organize user files

## Error Handling
- Returns structured error responses
- Handles network failures gracefully
- Provides loading states for UI feedback
- Proper cleanup of loading states

## Security Features
- Uses signed URLs for secure uploads
- Server-side validation of upload permissions
- Organized directory structure for access control
- Prevents direct file system access

## Performance Considerations
- Parallel uploads for multiple files using `Promise.all`
- Loading states prevent duplicate operations
- Efficient file key generation
- Minimal client-side processing