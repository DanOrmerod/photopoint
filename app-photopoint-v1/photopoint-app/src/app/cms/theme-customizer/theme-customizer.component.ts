import { Component, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="theme-customizer">
      <div class="customizer-header">
        <h3>
          <i class="fas fa-palette"></i>
          Theme Customization
        </h3>
        <button class="close-btn" (click)="closeCustomizer()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="customizer-content">
        <!-- Theme Selection -->
        <div class="section">
          <h4>Choose a Theme</h4>
          <div class="themes-grid">
            @for (theme of themes(); track theme.id) {
              <div 
                class="theme-card"
                [class.active]="selectedTheme()?.id === theme.id"
                (click)="selectTheme(theme)"
              >
                <div class="theme-preview" [innerHTML]="getThemePreview(theme)"></div>
                <div class="theme-info">
                  <h5>{{ theme.name }}</h5>
                  <p>{{ theme.description }}</p>
                  <span class="category-badge" [class]="'category-' + theme.category">
                    {{ theme.category }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Custom Color Overrides -->
        @if (selectedTheme()) {
          <div class="section">
            <h4>Customize Colors</h4>
            <div class="color-controls">
              <div class="color-group">
                <label>Primary Color</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    class="color-picker"
                    [value]="customColors().primary"
                    (input)="updateCustomColor('primary', $event)"
                  >
                  <input 
                    type="text" 
                    class="color-text"
                    [value]="customColors().primary"
                    (input)="updateCustomColor('primary', $event)"
                    placeholder="#000000"
                  >
                </div>
              </div>

              <div class="color-group">
                <label>Secondary Color</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    class="color-picker"
                    [value]="customColors().secondary"
                    (input)="updateCustomColor('secondary', $event)"
                  >
                  <input 
                    type="text" 
                    class="color-text"
                    [value]="customColors().secondary"
                    (input)="updateCustomColor('secondary', $event)"
                    placeholder="#000000"
                  >
                </div>
              </div>

              <div class="color-group">
                <label>Accent Color</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    class="color-picker"
                    [value]="customColors().accent"
                    (input)="updateCustomColor('accent', $event)"
                  >
                  <input 
                    type="text" 
                    class="color-text"
                    [value]="customColors().accent"
                    (input)="updateCustomColor('accent', $event)"
                    placeholder="#000000"
                  >
                </div>
              </div>

              <div class="color-group">
                <label>Background Color</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    class="color-picker"
                    [value]="customColors().background"
                    (input)="updateCustomColor('background', $event)"
                  >
                  <input 
                    type="text" 
                    class="color-text"
                    [value]="customColors().background"
                    (input)="updateCustomColor('background', $event)"
                    placeholder="#ffffff"
                  >
                </div>
              </div>

              <div class="color-group">
                <label>Text Color</label>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    class="color-picker"
                    [value]="customColors().text"
                    (input)="updateCustomColor('text', $event)"
                  >
                  <input 
                    type="text" 
                    class="color-text"
                    [value]="customColors().text"
                    (input)="updateCustomColor('text', $event)"
                    placeholder="#000000"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Typography Customization -->
          <div class="section">
            <h4>Typography</h4>
            <div class="typography-controls">
              <div class="control-group">
                <label>Font Family</label>
                <select [(ngModel)]="customTypography().fontFamily" (change)="updateTypography()">
                  <option value="Inter, sans-serif">Inter (Modern)</option>
                  <option value="Poppins, sans-serif">Poppins (Friendly)</option>
                  <option value="Source Sans Pro, sans-serif">Source Sans Pro (Professional)</option>
                  <option value="Playfair Display, serif">Playfair Display (Elegant)</option>
                  <option value="Crimson Text, serif">Crimson Text (Classic)</option>
                  <option value="JetBrains Mono, monospace">JetBrains Mono (Tech)</option>
                  <option value="Nunito, sans-serif">Nunito (Rounded)</option>
                  <option value="Lora, serif">Lora (Reading)</option>
                </select>
              </div>

              <div class="control-group">
                <label>Font Size</label>
                <div class="range-control">
                  <input 
                    type="range" 
                    min="14" 
                    max="20" 
                    step="1"
                    [value]="parseInt(customTypography().fontSize)"
                    (input)="updateFontSize($event)"
                  >
                  <span>{{ customTypography().fontSize }}</span>
                </div>
              </div>

              <div class="control-group">
                <label>Line Height</label>
                <div class="range-control">
                  <input 
                    type="range" 
                    min="1.2" 
                    max="2.0" 
                    step="0.1"
                    [value]="customTypography().lineHeight"
                    (input)="updateLineHeight($event)"
                  >
                  <span>{{ customTypography().lineHeight }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Layout Customization -->
          <div class="section">
            <h4>Layout</h4>
            <div class="layout-controls">
              <div class="control-group">
                <label>Border Radius</label>
                <div class="range-control">
                  <input 
                    type="range" 
                    min="0" 
                    max="24" 
                    step="2"
                    [value]="parseInt(customLayout().borderRadius)"
                    (input)="updateBorderRadius($event)"
                  >
                  <span>{{ customLayout().borderRadius }}</span>
                </div>
              </div>

              <div class="control-group">
                <label>Container Width</label>
                <select [(ngModel)]="customLayout().containerWidth" (change)="updateLayout()">
                  <option value="1140px">Small (1140px)</option>
                  <option value="1200px">Medium (1200px)</option>
                  <option value="1280px">Large (1280px)</option>
                  <option value="1440px">Extra Large (1440px)</option>
                </select>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="customizer-actions">
        <button class="btn btn-outline" (click)="resetToDefault()">
          <i class="fas fa-undo"></i>
          Reset
        </button>
        <button class="btn btn-primary" (click)="applyTheme()">
          <i class="fas fa-check"></i>
          Apply Theme
        </button>
      </div>
    </div>
  `,
  styles: [`
    .theme-customizer {
      width: 400px;
      height: 100vh;
      background: white;
      border-left: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .customizer-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .customizer-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .customizer-header h3 i {
      color: #3b82f6;
    }

    .close-btn {
      padding: 6px;
      border: none;
      background: none;
      border-radius: 4px;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f1f5f9;
      color: #3b82f6;
    }

    .customizer-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h4 {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .themes-grid {
      display: grid;
      gap: 16px;
    }

    .theme-card {
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .theme-card.active {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .theme-preview {
      height: 120px;
      overflow: hidden;
    }

    .theme-info {
      padding: 12px;
    }

    .theme-info h5 {
      margin: 0 0 4px 0;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }

    .theme-info p {
      margin: 0 0 8px 0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }

    .category-badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      border-radius: 4px;
      letter-spacing: 0.025em;
    }

    .category-business {
      background: #dbeafe;
      color: #1e40af;
    }

    .category-creative {
      background: #fef3e2;
      color: #ea580c;
    }

    .category-portfolio {
      background: #f3e8ff;
      color: #7c3aed;
    }

    .category-e-commerce {
      background: #dcfce7;
      color: #16a34a;
    }

    .category-blog {
      background: #fce7f3;
      color: #be185d;
    }

    .color-controls, .typography-controls, .layout-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .color-group, .control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .color-group label, .control-group label {
      font-size: 12px;
      font-weight: 500;
      color: #374151;
    }

    .color-input-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .color-picker {
      width: 40px;
      height: 32px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      background: none;
    }

    .color-text {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
    }

    .color-text:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    select {
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 12px;
      background: white;
    }

    select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .range-control {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .range-control input[type="range"] {
      flex: 1;
    }

    .range-control span {
      min-width: 40px;
      font-size: 12px;
      color: #64748b;
      text-align: right;
    }

    .customizer-actions {
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
    }

    .btn {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid transparent;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-outline {
      background: white;
      color: #64748b;
      border-color: #d1d5db;
    }

    .btn-outline:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .btn-primary:hover {
      background: #2563eb;
      border-color: #2563eb;
    }

    /* Custom scrollbar */
    .customizer-content::-webkit-scrollbar {
      width: 6px;
    }

    .customizer-content::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .customizer-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .customizer-content::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class ThemeCustomizerComponent implements OnInit {
  @Input() currentTheme?: Theme;
  @Output() themeSelected = new EventEmitter<Theme>();
  @Output() themeCustomized = new EventEmitter<any>();
  @Output() closeRequested = new EventEmitter<void>();

  themes = signal<Theme[]>([]);
  selectedTheme = signal<Theme | null>(null);
  
  customColors = signal({
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#10b981',
    background: '#ffffff',
    text: '#1e293b'
  });

  customTypography = signal({
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
    lineHeight: '1.6'
  });

  customLayout = signal({
    borderRadius: '8px',
    containerWidth: '1200px'
  });

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themes.set(this.themeService.getThemes());
    
    if (this.currentTheme) {
      this.selectedTheme.set(this.currentTheme);
      this.initializeCustomizations();
    }
  }

  selectTheme(theme: Theme) {
    this.selectedTheme.set(theme);
    this.initializeCustomizations();
  }

  private initializeCustomizations() {
    const theme = this.selectedTheme();
    if (!theme) return;

    this.customColors.set({
      primary: theme.styles.colors.primary,
      secondary: theme.styles.colors.secondary,
      accent: theme.styles.colors.accent,
      background: theme.styles.colors.background,
      text: theme.styles.colors.text
    });

    this.customTypography.set({
      fontFamily: theme.styles.typography.fontFamily,
      fontSize: theme.styles.typography.fontSize,
      lineHeight: theme.styles.typography.lineHeight
    });

    this.customLayout.set({
      borderRadius: theme.styles.layout.borderRadius,
      containerWidth: theme.styles.layout.containerWidth
    });
  }

  updateCustomColor(colorKey: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const currentColors = this.customColors();
    this.customColors.set({
      ...currentColors,
      [colorKey]: input.value
    });
    this.emitCustomizations();
  }

  updateTypography() {
    this.emitCustomizations();
  }

  updateFontSize(event: Event) {
    const input = event.target as HTMLInputElement;
    const currentTypography = this.customTypography();
    this.customTypography.set({
      ...currentTypography,
      fontSize: `${input.value}px`
    });
    this.emitCustomizations();
  }

  updateLineHeight(event: Event) {
    const input = event.target as HTMLInputElement;
    const currentTypography = this.customTypography();
    this.customTypography.set({
      ...currentTypography,
      lineHeight: input.value
    });
    this.emitCustomizations();
  }

  updateBorderRadius(event: Event) {
    const input = event.target as HTMLInputElement;
    const currentLayout = this.customLayout();
    this.customLayout.set({
      ...currentLayout,
      borderRadius: `${input.value}px`
    });
    this.emitCustomizations();
  }

  updateLayout() {
    this.emitCustomizations();
  }

  private emitCustomizations() {
    this.themeCustomized.emit({
      theme: this.selectedTheme(),
      colors: this.customColors(),
      typography: this.customTypography(),
      layout: this.customLayout()
    });
  }

  applyTheme() {
    const theme = this.selectedTheme();
    if (!theme) return;

    // Create a customized theme object
    const customizedTheme = {
      ...theme,
      styles: {
        ...theme.styles,
        colors: {
          ...theme.styles.colors,
          ...this.customColors()
        },
        typography: {
          ...theme.styles.typography,
          ...this.customTypography()
        },
        layout: {
          ...theme.styles.layout,
          ...this.customLayout()
        }
      }
    };

    this.themeSelected.emit(customizedTheme);
  }

  resetToDefault() {
    this.initializeCustomizations();
  }

  closeCustomizer() {
    this.closeRequested.emit();
  }

  getThemePreview(theme: Theme): string {
    return this.themeService.generateThemePreview(theme);
  }

  parseInt(value: string): number {
    return parseInt(value.replace('px', ''), 10);
  }
}
