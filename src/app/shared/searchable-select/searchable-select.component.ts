import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

export interface SearchableOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searchable-select.component.html',
  styleUrl: './searchable-select.component.css'
})
export class SearchableSelectComponent implements OnChanges, AfterViewInit, AfterViewChecked, OnDestroy {

  /** Options rendered in the dropdown, in display order. */
  @Input() options: SearchableOption[] = [];
  /** Selected option value (select mode). */
  @Input() value: any = null;
  /** Editable text (free-text mode). */
  @Input() text: string | null | undefined = '';
  /** When true the control itself is an editable field and typing filters the options. */
  @Input() freeText = false;
  @Input() placeholder = 'Select';
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyText = 'No results';
  /** Label of the always-visible last option, e.g. "Create item". Hidden when null. */
  @Input() createLabel: string | null = null;
  @Input() clearable = false;
  @Input() disabled = false;
  @Input() align: 'start' | 'end' = 'start';

  @Output() valueChange = new EventEmitter<any>();
  @Output() textChange = new EventEmitter<string>();
  @Output() create = new EventEmitter<void>();

  @ViewChild('textInput') textInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('list') list?: ElementRef<HTMLElement>;
  @ViewChild('panel') panelEl?: ElementRef<HTMLElement>;

  isOpen = false;
  highlightedIndex = -1;
  filteredOptions: SearchableOption[] = [];
  query = '';
  /** The panel is fixed-positioned so it is never clipped by the scrolling table wrapper. */
  panelStyle: { [key: string]: string } = {};

  private pendingSearchFocus = false;
  private readonly repositionBound = () => this.positionPanel();

  constructor(private host: ElementRef<HTMLElement>) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.applyFilter();
    }
    if (changes['text']) {
      setTimeout(() => this.autoGrow());
    }
  }

  ngAfterViewInit() {
    this.autoGrow();
  }

  ngAfterViewChecked() {
    if (this.pendingSearchFocus && this.searchInput) {
      this.pendingSearchFocus = false;
      this.searchInput.nativeElement.focus();
    }
  }

  ngOnDestroy() {
    this.stopTrackingPosition();
  }

  get selectedLabel(): string {
    const selected = this.options.find(o => o.value === this.value);
    return selected ? selected.label : '';
  }

  get hasValue(): boolean {
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  /** Index used by keyboard navigation for the "create" row. */
  get createIndex(): number {
    return this.createLabel ? this.filteredOptions.length : -1;
  }

  open() {
    if (this.disabled || this.isOpen) return;
    this.isOpen = true;
    this.query = '';
    this.applyFilter();
    this.highlightedIndex = this.freeText
      ? -1
      : this.filteredOptions.findIndex(o => o.value === this.value);
    this.pendingSearchFocus = !this.freeText;
    this.positionPanel();
    // Re-measure once the panel is rendered so it can flip above the field when needed.
    setTimeout(() => this.positionPanel());
    window.addEventListener('scroll', this.repositionBound, true);
    window.addEventListener('resize', this.repositionBound);
  }

  close() {
    this.isOpen = false;
    this.highlightedIndex = -1;
    this.query = '';
    this.pendingSearchFocus = false;
    this.stopTrackingPosition();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  onQueryInput(event: Event) {
    this.query = (event.target as HTMLInputElement).value;
    this.applyFilter();
    this.highlightedIndex = this.filteredOptions.length ? 0 : this.createIndex;
  }

  onTextInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.text = value;
    this.query = value;
    this.textChange.emit(value);
    this.autoGrow();
    if (!this.isOpen) {
      this.isOpen = true;
    }
    this.applyFilter();
    this.highlightedIndex = -1;
    this.positionPanel();
  }

  selectOption(option: SearchableOption, event?: Event) {
    event?.preventDefault();
    if (this.freeText) {
      this.text = option.label;
      this.textChange.emit(option.label);
      setTimeout(() => this.autoGrow());
    }
    this.valueChange.emit(option.value);
    this.close();
  }

  onCreate(event?: Event) {
    event?.preventDefault();
    this.close();
    this.create.emit();
  }

  clear(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.valueChange.emit(null);
    this.close();
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.freeText && this.isTypedCharacter(event)) {
      // The trigger keeps focus in some browsers, so route typing to the search box
      // instead of dropping the keystroke.
      if (!this.isOpen) this.open();
      this.query += event.key;
      this.applyFilter();
      this.highlightedIndex = this.filteredOptions.length ? 0 : this.createIndex;
      this.pendingSearchFocus = true;
      event.preventDefault();
      return;
    }
    if (!this.freeText && this.isOpen && event.key === 'Backspace' && this.query) {
      this.query = this.query.slice(0, -1);
      this.applyFilter();
      this.pendingSearchFocus = true;
      event.preventDefault();
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
          return;
        }
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
          return;
        }
        this.moveHighlight(-1);
        break;
      case 'Enter':
        if (!this.isOpen) return;
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
          event.preventDefault();
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        } else if (this.highlightedIndex === this.createIndex && this.createIndex >= 0) {
          event.preventDefault();
          this.onCreate();
        } else if (!this.freeText) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMousedown(event: MouseEvent) {
    if (!this.isOpen) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private moveHighlight(step: number) {
    const lastIndex = this.createIndex >= 0 ? this.createIndex : this.filteredOptions.length - 1;
    if (lastIndex < 0) return;
    let next = this.highlightedIndex + step;
    if (next < 0) next = lastIndex;
    if (next > lastIndex) next = 0;
    this.highlightedIndex = next;
    setTimeout(() => this.scrollHighlightedIntoView());
  }

  private scrollHighlightedIntoView() {
    const listEl = this.list?.nativeElement;
    if (!listEl) return;
    const option = listEl.children.item(this.highlightedIndex) as HTMLElement | null;
    option?.scrollIntoView({ block: 'nearest' });
  }

  private isTypedCharacter(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
  }

  private positionPanel() {
    if (!this.isOpen) return;
    const field = this.host.nativeElement.querySelector('.ss-field') as HTMLElement | null;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const panelHeight = this.panelEl?.nativeElement.offsetHeight || 260;
    const openUpwards = rect.bottom + panelHeight + 8 > window.innerHeight && rect.top > panelHeight;
    this.panelStyle = {
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      top: openUpwards ? `${rect.top - panelHeight - 4}px` : `${rect.bottom + 4}px`
    };
  }

  private stopTrackingPosition() {
    window.removeEventListener('scroll', this.repositionBound, true);
    window.removeEventListener('resize', this.repositionBound);
  }

  private applyFilter() {
    const term = (this.query || '').trim().toLowerCase();
    this.filteredOptions = term
      ? this.options.filter(o => (o.label || '').toLowerCase().includes(term))
      : [...this.options];
  }

  private autoGrow() {
    const el = this.textInput?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 34)}px`;
  }
}
