export interface CanvasSticky {
  id: string;
  userId: string;
  noteId: string | null; // Linked note, if any
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasBoard {
  id: string;
  userId: string;
  name: string;
  stickies: CanvasSticky[];
  viewportX: number;
  viewportY: number;
  zoom: number;
  updatedAt: string;
}
