import { createContext, useContext, useState, ReactNode } from 'react';

export type DocType = 'pdf' | 'image' | null;

export type FieldPlacement = {
  id: string;
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox';
  x: number;
  y: number;
  width?: number;
  height?: number;
  completed?: boolean;
  page: number;
  recipient?: string;
};

export interface DocumentContextType {
  uploadedDoc: string | null;
  docType: DocType;
  setDocument: (doc: string | null, type: DocType) => void;
  fields: FieldPlacement[];
  setFields: (fields: FieldPlacement[]) => void;
  fieldValues: Record<string, any>;
  setFieldValues: (values: Record<string, any>) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocument = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocument must be used within DocumentProvider');
  return ctx;
};

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [uploadedDoc, setUploadedDoc] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>(null);
  const [fields, setFields] = useState<FieldPlacement[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const setDocument = (doc: string | null, type: DocType) => {
    setUploadedDoc(doc);
    setDocType(type);
  };

  return (
    <DocumentContext.Provider value={{ uploadedDoc, docType, setDocument, fields, setFields, fieldValues, setFieldValues }}>
      {children}
    </DocumentContext.Provider>
  );
};
