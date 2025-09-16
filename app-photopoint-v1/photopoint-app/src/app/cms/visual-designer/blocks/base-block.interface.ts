export interface BaseBlockData {
  id: string;
  type: string;
  content?: any;
  styles?: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textColor?: string;
    [key: string]: any;
  };
}

export interface BaseBlockComponent {
  data: BaseBlockData;
  isEditing: boolean;
  isSelected: boolean;
  isPreview: boolean;
  
  onEdit?(): void;
  onContentChange?(content: any): void;
  onStyleChange?(styles: any): void;
}
