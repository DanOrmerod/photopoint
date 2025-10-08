import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, Subject, map, catchError, throwError } from 'rxjs';
import { 
  PageBuilderState, 
  WebsitePage, 
  PageComponent, 
  ComponentType,
  ViewMode,
  WidthMode,
  PageBuilderHistoryEntry,
  ResponsiveStyles
} from '../models/component-system';
import { 
  CreateComponentRequest,
  UpdateComponentRequest,
  CreatePageRequest,
  UpdatePageRequest
} from '../models';
import { WebsiteService } from './website.service';

@Injectable({
  providedIn: 'root'
})
export class PageBuilderService {
  // State management using signals
  private _state = signal<PageBuilderState>({
    currentPage: null,
    selectedComponent: null,
    draggedComponent: null,
    clipboard: null,
    viewMode: 'desktop' as ViewMode,
    widthMode: 'container' as WidthMode,
    zoomLevel: 100,
    
    // UI state
    componentPanelVisible: true,
    propertyPanelVisible: true,
    layersPanelVisible: false,
    isPreviewMode: false,
    isLoading: false,
    isDirty: false,
    
    // History for undo/redo
    history: [],
    historyIndex: -1,
    maxHistorySize: 50
  });

  // Computed properties
  state = computed(() => this._state());
  canUndo = computed(() => this._state().historyIndex > 0);
  canRedo = computed(() => this._state().historyIndex < this._state().history.length - 1);

  // Event streams
  private componentAdded$ = new Subject<PageComponent>();
  private componentUpdated$ = new Subject<PageComponent>();
  private componentDeleted$ = new Subject<string>();
  private pageUpdated$ = new Subject<WebsitePage>();

  constructor(private apiService: WebsiteService) {
    // Initialize with empty page for development
    this.initializeEmptyPage();
  }

  // State getters
  getCurrentPage(): WebsitePage | null {
    return this._state().currentPage;
  }

  getSelectedComponent(): PageComponent | null {
    return this._state().selectedComponent;
  }

  // Page management
  loadPage(websiteId: string, pageId: string): Observable<WebsitePage> {
    this.updateState({ isLoading: true });
    
    return this.apiService.getPage$(websiteId, pageId).pipe(
      map(page => {
        // Convert API response to frontend model
        const mappedPage: WebsitePage = {
          id: page.id,
          websiteId: page.websiteId,
          title: page.title,
          slug: page.slug,
          isHomePage: page.isHomePage,
          isPublished: page.status === 'published',
          sortOrder: page.sortOrder,
          layoutType: 'standard',
          version: 1,
          components: page.components?.map(this.mapApiComponentToFrontend) || [],
          createdAt: page.createdAt,
          updatedAt: page.updatedAt
        };
        
        this.updateState({ 
          currentPage: mappedPage,
          isLoading: false 
        });
        
        return mappedPage;
      }),
      catchError(error => {
        this.updateState({ isLoading: false });
        return throwError(() => error);
      })
    );
  }

  savePage(): Observable<WebsitePage> {
    const currentPage = this._state().currentPage;
    if (!currentPage) {
      throw new Error('No page to save');
    }

    this.updateState({ isLoading: true });

    const updateRequest: UpdatePageRequest = {
      title: currentPage.title,
      slug: currentPage.slug,
      status: currentPage.isPublished ? 'published' : 'draft'
    };

    return this.apiService.updatePage$(currentPage.websiteId, currentPage.id, updateRequest).pipe(
      map(page => {
        const mappedPage: WebsitePage = {
          id: page.id,
          websiteId: page.websiteId,
          title: page.title,
          slug: page.slug,
          isHomePage: page.isHomePage,
          isPublished: page.status === 'published',
          sortOrder: page.sortOrder,
          layoutType: 'standard',
          version: currentPage.version + 1,
          components: currentPage.components,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt
        };
        
        this.updateState({ 
          currentPage: mappedPage,
          isDirty: false,
          isLoading: false 
        });
        
        return mappedPage;
      }),
      catchError(error => {
        this.updateState({ isLoading: false });
        return throwError(() => error);
      })
    );
  }

  // Component management
  addComponent(type: ComponentType, position?: { x: number; y: number }, targetIndex?: number): Observable<PageComponent> {
    const currentPage = this._state().currentPage;
    if (!currentPage) {
      throw new Error('No page loaded');
    }

    const componentData = this.getDefaultContent(type);
    const styles: ResponsiveStyles = {
      desktop: position ? {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '200px',
        height: '100px'
      } : {
        position: 'relative'
      },
      tablet: {},
      mobile: {}
    };

    const createRequest: CreateComponentRequest = {
      componentType: type,
      componentData,
      styles,
      sortOrder: targetIndex ?? currentPage.components?.length ?? 0
    };

    return this.apiService.createComponent$(currentPage.websiteId, currentPage.id, createRequest).pipe(
      map(apiComponent => {
        const newComponent = this.mapApiComponentToFrontend(apiComponent);
        
        // Add to local state
        if (!currentPage.components) {
          currentPage.components = [];
        }

        if (targetIndex !== undefined) {
          currentPage.components.splice(targetIndex, 0, newComponent);
          // Update sort orders
          currentPage.components.forEach((comp, index) => {
            comp.sortOrder = index;
          });
        } else {
          currentPage.components.push(newComponent);
        }

        this.updateState({ 
          currentPage: { ...currentPage },
          selectedComponent: newComponent,
          isDirty: true 
        });

        this.addToHistory('Add Component');
        this.componentAdded$.next(newComponent);

        return newComponent;
      })
    );
  }

  updateComponent(component: PageComponent): Observable<PageComponent> {
    const currentPage = this._state().currentPage;
    if (!currentPage?.components) {
      return throwError(() => new Error('No page or components loaded'));
    }

    const updateRequest: UpdateComponentRequest = {
      componentType: component.type,
      componentData: component.content,
      styles: component.styles,
      sortOrder: component.sortOrder
    };

    return this.apiService.updateComponent$(currentPage.websiteId, currentPage.id, component.id, updateRequest).pipe(
      map(apiComponent => {
        const updatedComponent = this.mapApiComponentToFrontend(apiComponent);
        
        // Update local state
        const index = currentPage.components!.findIndex(c => c.id === component.id);
        if (index !== -1) {
          currentPage.components![index] = updatedComponent;
          
          this.updateState({ 
            currentPage: { ...currentPage },
            selectedComponent: updatedComponent,
            isDirty: true 
          });

          this.componentUpdated$.next(updatedComponent);
        }

        return updatedComponent;
      })
    );
  }

  deleteComponent(componentId: string): Observable<void> {
    const currentPage = this._state().currentPage;
    if (!currentPage?.components) {
      return throwError(() => new Error('No page or components loaded'));
    }

    return this.apiService.deleteComponent$(currentPage.websiteId, currentPage.id, componentId).pipe(
      map(() => {
        const index = currentPage.components!.findIndex(c => c.id === componentId);
        if (index !== -1) {
          currentPage.components!.splice(index, 1);
          
          // Update sort orders
          currentPage.components!.forEach((comp, idx) => {
            comp.sortOrder = idx;
          });

          this.updateState({ 
            currentPage: { ...currentPage },
            selectedComponent: null,
            isDirty: true 
          });

          this.addToHistory('Delete Component');
          this.componentDeleted$.next(componentId);
        }
      })
    );
  }

  selectComponent(component: PageComponent | null): void {
    this.updateState({ selectedComponent: component });
  }

  // View management
  setViewMode(mode: ViewMode): void {
    this.updateState({ viewMode: mode });
  }

  setWidthMode(mode: WidthMode): void {
    this.updateState({ widthMode: mode });
  }

  setZoomLevel(level: number): void {
    this.updateState({ zoomLevel: Math.max(25, Math.min(200, level)) });
  }

  // Panel management
  toggleComponentPanel(): void {
    this.updateState({ 
      componentPanelVisible: !this._state().componentPanelVisible 
    });
  }

  togglePropertyPanel(): void {
    this.updateState({ 
      propertyPanelVisible: !this._state().propertyPanelVisible 
    });
  }

  togglePreviewMode(): void {
    this.updateState({ 
      isPreviewMode: !this._state().isPreviewMode 
    });
  }

  // History management
  undo(): void {
    const state = this._state();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      this.updateState({
        currentPage: previousState.page,
        historyIndex: state.historyIndex - 1,
        isDirty: true
      });
    }
  }

  redo(): void {
    const state = this._state();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      this.updateState({
        currentPage: nextState.page,
        historyIndex: state.historyIndex + 1,
        isDirty: true
      });
    }
  }

  private addToHistory(action: string): void {
    const state = this._state();
    const currentPage = state.currentPage;
    if (!currentPage) return;

    const historyEntry: PageBuilderHistoryEntry = {
      id: crypto.randomUUID(),
      description: action,
      timestamp: new Date(),
      page: JSON.parse(JSON.stringify(currentPage)), // Deep clone
      pageState: {
        components: currentPage.components || [],
        pageSettings: {
          title: currentPage.title,
          slug: currentPage.slug,
          layoutType: currentPage.layoutType
        }
      }
    };

    // Remove any history after current index (for branching)
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(historyEntry);

    // Limit history size
    const maxSize = state.maxHistorySize || 50;
    if (newHistory.length > maxSize) {
      newHistory.shift();
    }

    this.updateState({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  }

  // Event subscriptions
  onComponentAdded(): Observable<PageComponent> {
    return this.componentAdded$.asObservable();
  }

  onComponentUpdated(): Observable<PageComponent> {
    return this.componentUpdated$.asObservable();
  }

  onComponentDeleted(): Observable<string> {
    return this.componentDeleted$.asObservable();
  }

  onPageUpdated(): Observable<WebsitePage> {
    return this.pageUpdated$.asObservable();
  }

  // Private helpers
  private updateState(updates: Partial<PageBuilderState>): void {
    this._state.update(state => ({ ...state, ...updates }));
  }

  private initializeEmptyPage(): void {
    const emptyPage: WebsitePage = {
      id: 'new-page',
      websiteId: 'website-1',
      title: 'New Page',
      slug: 'new-page',
      isHomePage: false,
      isPublished: false,
      sortOrder: 0,
      layoutType: 'standard',
      version: 1,
      components: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.updateState({ currentPage: emptyPage });
  }

  private getDefaultContent(type: ComponentType): any {
    const defaultContent: Partial<Record<ComponentType, any>> = {
      [ComponentType.HERO]: {
        heading: 'Welcome to Our Website',
        subheading: 'Create something amazing with our powerful tools',
        buttonText: 'Get Started',
        backgroundImage: ''
      },
      [ComponentType.TEXT]: {
        content: '<p>Add your text content here...</p>'
      },
      [ComponentType.IMAGE]: {
        src: '',
        alt: 'Image',
        caption: ''
      },
      [ComponentType.GALLERY]: {
        title: 'Photo Gallery',
        images: [],
        columns: 3
      },
      [ComponentType.CONTACT_FORM]: {
        title: 'Contact Us',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'message', label: 'Message', type: 'textarea', required: true }
        ],
        submitText: 'Send Message'
      },
      [ComponentType.SOCIAL_LINKS]: {
        title: 'Follow Us',
        links: [],
        layout: 'horizontal',
        showLabels: true
      },
      [ComponentType.NAVIGATION]: {
        brand: 'Your Brand',
        logo: '',
        items: [],
        style: 'horizontal'
      },
      [ComponentType.FOOTER]: {
        sections: [],
        copyright: '© 2024 Your Website. All rights reserved.'
      },
      [ComponentType.HTML]: {
        html: '<p>Add your custom HTML here...</p>'
      },
      [ComponentType.SPACER]: {
        height: '40px'
      }
    };

    // Return default for known types, empty object for others
    return defaultContent[type] || {};
  }

  private mapApiComponentToFrontend(apiComponent: any): PageComponent {
    return {
      id: apiComponent.id,
      type: apiComponent.componentType as ComponentType,
      pageId: apiComponent.pageId,
      content: apiComponent.componentData,
      styles: apiComponent.styles || {
        desktop: {},
        tablet: {},
        mobile: {}
      },
      sortOrder: apiComponent.sortOrder,
      isVisible: true,
      isLocked: false,
      version: 1,
      createdAt: apiComponent.createdAt,
      updatedAt: apiComponent.updatedAt
    };
  }
}