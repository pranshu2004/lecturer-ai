import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Note {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: string;
}

interface NotesContextType {
  notes: Note[];
  setNotes: (note: Note) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotesState] = useState<Note[]>([]);

  const setNotes = (note: Note) => {
    setNotesState((prevNotes) => [...prevNotes, note]);
  };

  return (
    <NotesContext.Provider value={{ notes, setNotes }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
