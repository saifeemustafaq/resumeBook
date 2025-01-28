import { BlobServiceClient, BlockBlobClient, ContainerClient, BlobSASPermissions } from '@azure/storage-blob';

// Constants
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER || 'resumebook';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_RESUME_TYPES = ['application/pdf'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

// Validation Error class
class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

let blobServiceClient: BlobServiceClient;
let containerClient: ContainerClient;

// Initialize the clients only when needed
function initClients() {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage Connection String is required');
  }

  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  }
}

// Initialize container with proper access level
export async function initializeStorage(): Promise<void> {
  try {
    initClients();
    await containerClient.createIfNotExists();
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw new Error('Storage initialization failed');
  }
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

    await blockBlobClient.upload(buffer, buffer.byteLength, {
      blobHTTPHeaders: {
        blobContentType: file.type,
        blobCacheControl: 'public, max-age=31536000' // Cache for 1 year
      }
    });

    return blockBlobClient.url;
  } catch (error) {
    if (error instanceof StorageValidationError) {
      throw error;
    }
    console.error('Error uploading file to Azure:', error);
    throw new Error('Failed to upload file');
  }
}

// Delete file with proper error handling
export async function deleteFile(url: string): Promise<void> {
  try {
    initClients();
    const blobName = new URL(url).pathname.split('/').pop();
    if (!blobName) throw new Error('Invalid blob URL');
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  } catch (error) {
    console.error('Error deleting file from Azure:', error);
    throw new Error('Failed to delete file');
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