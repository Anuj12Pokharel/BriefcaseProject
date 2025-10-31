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

export type Recipient = {
  id: string;
  name: string;
  email: string;
  designation?: string;
};

export interface DocumentContextType {
  // uploadedDoc can be a URL (string) or a File object (for local PDFs)
  uploadedDoc: File | string | null;
  docType: DocType;
  setDocument: (doc: File | string | null, type: DocType) => void;
  fields: FieldPlacement[];
  setFields: (fields: FieldPlacement[]) => void;
  fieldValues: Record<string, any>;
  setFieldValues: (values: Record<string, any>) => void;
  recipients: Recipient[];
  setRecipients: (r: Recipient[]) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocument = () => {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocument must be used within DocumentProvider');
  return ctx;
};

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [uploadedDoc, setUploadedDoc] = useState<File | string | null>(null);
  const [docType, setDocType] = useState<DocType>(null);
  const [fields, setFields] = useState<FieldPlacement[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const setDocument = (doc: File | string | null, type: DocType) => {
    setUploadedDoc(doc);
    setDocType(type);
  };

  return (
    <DocumentContext.Provider value={{ uploadedDoc, docType, setDocument, fields, setFields, fieldValues, setFieldValues, recipients, setRecipients }}>
      {children}
    </DocumentContext.Provider>
  );
};
