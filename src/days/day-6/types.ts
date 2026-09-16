export type UploadedAsset = {
  id: string;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
};

export type UploadStatus =
  | "idle"
  | "loading"
  | "success"
  | "failed";

export type UploadOptions = {
  onProgress?: (progress: number) => void;
  shouldFail?: boolean;
};