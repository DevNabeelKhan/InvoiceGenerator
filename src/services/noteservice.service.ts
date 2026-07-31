import { Injectable } from '@angular/core';

export interface Note {
  id: number;
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteserviceService {
  private notes: Note[] = [];
  private idCounter = 1;

  getAll(): Note[] {
    return [...this.notes];
  }

  add(note: Omit<Note, 'id'>) {
    this.notes.push({ id: this.idCounter++, ...note });
  }

  update(note: Note) {
    const index = this.notes.findIndex(n => n.id === note.id);
    if (index > -1) this.notes[index] = note;
  }

  delete(id: number) {
    this.notes = this.notes.filter(n => n.id !== id);
  }
}
