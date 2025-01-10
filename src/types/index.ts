export interface FileWithPath {
  name: string;
  path: string;
}
export interface ConversionResult {
  output_path: string;
  input_size: number;
  output_size: number;
  compression_ratio: number;
  quality: string;
}