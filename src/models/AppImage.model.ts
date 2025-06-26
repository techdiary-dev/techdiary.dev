export interface IServerFile {
  provider: "cloudinary" | "r2" | "direct";
  key: string;
}
