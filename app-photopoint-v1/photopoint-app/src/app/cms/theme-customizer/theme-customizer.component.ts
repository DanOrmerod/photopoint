import { Component, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-customizer.component.html',
  styleUrl: './theme-customizer.component.scss'
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
