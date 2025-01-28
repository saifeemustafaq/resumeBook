import { BlobServiceClient, BlockBlobClient, ContainerClient, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol } from '@azure/storage-blob';

// Constants
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER || 'resumebook';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_RESUME_TYPES = ['application/pdf'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const SAS_EXPIRY_HOURS = 24; // SAS tokens valid for 24 hours

// Validation Error class
class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

// Azure Storage Error class
class AzureStorageError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AzureStorageError';
  }
}

let blobServiceClient: BlobServiceClient;
let containerClient: ContainerClient;

// Initialize the clients only when needed
function initClients() {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new AzureStorageError('Azure Storage Connection String is required');
  }

  try {
    if (!blobServiceClient) {
      blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
      containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    }
  } catch (error) {
    console.error('Failed to initialize Azure Storage clients:', error);
    throw new AzureStorageError('Failed to initialize storage clients', error);
  }
}

// Initialize container
export async function initializeStorage(): Promise<void> {
  try {
    initClients();
    
    // Create container if it doesn't exist (without public access)
    const createContainerResponse = await containerClient.createIfNotExists();
    
    if (createContainerResponse.succeeded) {
      console.log('Storage container created successfully');
    }

  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw new AzureStorageError('Storage initialization failed', error);
  }
}

// Generate SAS URL for a blob
async function generateSasUrl(blobClient: BlockBlobClient): Promise<string> {
  const startsOn = new Date();
  const expiresOn = new Date(startsOn);
  expiresOn.setHours(startsOn.getHours() + SAS_EXPIRY_HOURS);

  const permissions = BlobSASPermissions.parse("r"); // Read-only permission

  const sasToken = await blobClient.generateSasUrl({
    permissions: permissions,
    startsOn: startsOn,
    expiresOn: expiresOn,
    protocol: SASProtocol.Https
  });

  return sasToken;
}

// Validate file before upload
function validateFile(file: File, type: 'resume' | 'profile'): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new StorageValidationError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  if (type === 'resume' && !ALLOWED_RESUME_TYPES.includes(file.type)) {
    throw new StorageValidationError('Only PDF files are allowed for resumes');
  }

  if (type === 'profile' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new StorageValidationError('Only JPEG and PNG files are allowed for profile pictures');
  }
}

// Upload file with validation
export async function uploadFile(
  file: File,
  directory: 'resumes' | 'profiles',
  userEmail: string
): Promise<string> {
  try {
    initClients();
    validateFile(file, directory === 'resumes' ? 'resume' : 'profile');

    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split('.').pop();
    const blobName = `${directory}/${userEmail}-${Date.now()}.${fileExtension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log(`Starting upload to ${blobName}`);
    
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: file.type,
        blobCacheControl: 'private, max-age=31536000', // Cache for 1 year
        blobContentDisposition: `inline; filename="${file.name}"`
      }
    };

    const uploadResponse = await blockBlobClient.upload(buffer, buffer.byteLength, uploadOptions);
    
    if (!uploadResponse.errorCode) {
      console.log(`Upload successful: ${blobName}`);
      // Verify the upload by trying to access the blob
      const properties = await blockBlobClient.getProperties();
      if (properties.contentLength === buffer.byteLength) {
        // Generate SAS URL for the uploaded blob
        const sasUrl = await generateSasUrl(blockBlobClient);
        return sasUrl;
      }
      throw new Error('Upload verification failed: size mismatch');
    }
    
    throw new Error(`Upload failed with error code: ${uploadResponse.errorCode}`);

  } catch (error) {
    if (error instanceof StorageValidationError) {
      throw error;
    }
    console.error('Error uploading file to Azure:', error);
    throw new AzureStorageError('Failed to upload file', error);
  }
}

// Delete file with error handling
export async function deleteFile(url: string): Promise<void> {
  try {
    initClients();
    
    // Extract blob name from URL (remove SAS token if present)
    const blobUrl = new URL(url);
    const blobPath = blobUrl.pathname;
    const blobName = blobPath.split('/').pop();
    
    if (!blobName) {
      throw new Error('Invalid blob URL');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blockBlobClient.delete();
    
    if (!response.errorCode) {
      console.log(`Successfully deleted: ${blobName}`);
    } else {
      throw new Error(`Delete failed with error code: ${response.errorCode}`);
    }
  } catch (error) {
    console.error('Error deleting file from Azure:', error);
    throw new AzureStorageError('Failed to delete file', error);
  }
}

// Get signed URL for temporary access
export async function getSignedUrl(url: string, expiryMinutes: number = 60): Promise<string> {
  try {
    initClients();
    const blobName = new URL(url).pathname.split('/').pop();
    if (!blobName) throw new Error('Invalid blob URL');

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const startsOn = new Date();
    const expiresOn = new Date(startsOn);
    expiresOn.setMinutes(startsOn.getMinutes() + expiryMinutes);

    const permissions = new BlobSASPermissions();
    permissions.read = true;

    const sasToken = await blockBlobClient.generateSasUrl({
      permissions,
      startsOn,
      expiresOn,
    });

    return sasToken;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
} 