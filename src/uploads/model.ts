export interface Uploads {
  userId: string;
  data: FileUploads[];
}
export interface FileUploads {
  source: string;
  type: string;
  url: string;
}
