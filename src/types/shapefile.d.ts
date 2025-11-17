declare module 'shapefile' {
  export interface Source {
    read(): Promise<{ done: boolean; value?: any }>;
  }

  export function open(
    shpPath: string | ArrayBuffer,
    shxPath?: string | ArrayBuffer,
    options?: { encoding?: string }
  ): Promise<Source>;
}

