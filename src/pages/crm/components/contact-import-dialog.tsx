import { useState, useCallback, useRef } from "react";
import {
  useCrmContactImportPreview,
  useCrmContactImportExecute,
  type CsvPreviewResponse,
  type CsvImportResult,
} from "@/api/crm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Upload, FileSpreadsheet, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const FIELD_OPTIONS = [
  { value: "__skip__", label: "-- Skip --" },
  { value: "first_name", label: "first_name" },
  { value: "last_name", label: "last_name" },
  { value: "email", label: "email" },
  { value: "company", label: "company" },
  { value: "phone", label: "phone" },
  { value: "role", label: "role" },
  { value: "status", label: "status" },
  { value: "tags", label: "tags" },
];

type Step = 1 | 2 | 3 | 4;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactImportDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState("create_and_update");
  const [dedupField, setDedupField] = useState("email");
  const [preview, setPreview] = useState<CsvPreviewResponse | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewMut = useCrmContactImportPreview();
  const executeMut = useCrmContactImportExecute();

  const reset = useCallback(() => {
    setStep(1);
    setFile(null);
    setImportMode("create_and_update");
    setDedupField("email");
    setPreview(null);
    setMapping({});
    setResult(null);
    setErrorsExpanded(false);
  }, []);

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.endsWith(".csv")) setFile(f);
    else toast.error("Only .csv files are accepted");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function handleUploadPreview() {
    if (!file) return;
    const fd = new FormData();
    fd.append("csv", file);
    previewMut.mutate(fd, {
      onSuccess: (data) => {
        setPreview(data);
        const initial: Record<string, string> = {};
        for (const h of data.headers) {
          initial[h] = data.suggested_mapping[h] ?? "__skip__";
        }
        setMapping(initial);
        setStep(3);
      },
      onError: () => toast.error("Failed to parse CSV"),
    });
  }

  function updateMapping(header: string, value: string) {
    setMapping((prev) => ({ ...prev, [header]: value }));
  }

  const hasRequiredMapping = Object.values(mapping).some(
    (v) => v === "first_name" || v === "last_name",
  );

  function handleImport() {
    if (!file) return;
    const fd = new FormData();
    fd.append("csv", file);
    fd.append("mapping", JSON.stringify(mapping));
    fd.append("mode", importMode);
    fd.append("dedup_field", dedupField);
    executeMut.mutate(fd, {
      onSuccess: (data) => { setResult(data); toast.success("Import complete"); },
      onError: () => toast.error("Import failed"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>Step {step} of 4</DialogDescription>
        </DialogHeader>
        {step === 1 && <StepSelectObject onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepUpload
            file={file} importMode={importMode} dedupField={dedupField}
            onImportModeChange={setImportMode} onDedupFieldChange={setDedupField}
            onFileDrop={handleFileDrop} onFileSelect={handleFileSelect}
            onUploadPreview={handleUploadPreview} isLoading={previewMut.isPending}
            fileInputRef={fileInputRef}
          />
        )}
        {step === 3 && preview && (
          <StepMapColumns
            preview={preview} mapping={mapping}
            onUpdateMapping={updateMapping} hasRequired={hasRequiredMapping}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && preview && (
          <StepVerify
            totalCount={preview.total_count} importMode={importMode}
            dedupField={dedupField} result={result}
            errorsExpanded={errorsExpanded}
            onToggleErrors={() => setErrorsExpanded((v) => !v)}
            onImport={handleImport} isImporting={executeMut.isPending}
            onDone={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Step 1
function StepSelectObject({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6 py-4">
      <div className="rounded-lg border border-[var(--border)] p-4 flex items-center gap-3 bg-[var(--accent)]/30">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <div>
          <p className="font-medium text-[var(--foreground)]">Contacts</p>
          <p className="text-sm text-[var(--muted-foreground)]">Import contacts from a CSV file</p>
        </div>
      </div>
      <div className="flex justify-end"><Button onClick={onNext}>Next</Button></div>
    </div>
  );
}

// Step 2
function StepUpload(props: {
  file: File | null; importMode: string; dedupField: string;
  onImportModeChange: (v: string) => void; onDedupFieldChange: (v: string) => void;
  onFileDrop: (e: React.DragEvent) => void; onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadPreview: () => void; isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { file, importMode, dedupField, onImportModeChange, onDedupFieldChange,
    onFileDrop, onFileSelect, onUploadPreview, isLoading, fileInputRef } = props;

  function fmt(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-5 py-4">
      <div
        onDragOver={(e) => e.preventDefault()} onDrop={onFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto text-[var(--muted-foreground)] mb-2" />
        <p className="text-sm text-[var(--muted-foreground)]">Drag & drop a .csv file here, or click to browse</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Max 10 MB</p>
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={onFileSelect} />
      </div>
      {file && (
        <div className="flex items-center gap-2 text-sm">
          <FileSpreadsheet className="w-4 h-4 text-[var(--primary)]" />
          <span className="font-medium">{file.name}</span>
          <span className="text-[var(--muted-foreground)]">({fmt(file.size)})</span>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">How to import contacts</label>
        <Select value={importMode} onValueChange={onImportModeChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="create_and_update">Create and update existing contacts</SelectItem>
            <SelectItem value="create_only">Create new contacts only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {importMode === "create_and_update" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Find existing contacts based on</label>
          <Select value={dedupField} onValueChange={onDedupFieldChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email address</SelectItem>
              <SelectItem value="phone">Phone number</SelectItem>
              <SelectItem value="both">Email and phone</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[var(--muted-foreground)]">
            Existing contacts matching this field will be updated instead of duplicated.
          </p>
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={onUploadPreview} disabled={!file || isLoading}>
          {isLoading ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Uploading...</>) : "Upload & Preview"}
        </Button>
      </div>
    </div>
  );
}

// Step 3
function StepMapColumns(props: {
  preview: CsvPreviewResponse; mapping: Record<string, string>;
  onUpdateMapping: (h: string, v: string) => void; hasRequired: boolean;
  onNext: () => void;
}) {
  const { preview, mapping, onUpdateMapping, hasRequired, onNext } = props;
  const mappedFields = Object.entries(mapping).filter(([, v]) => v !== "__skip__");

  return (
    <div className="space-y-5 py-4">
      <p className="text-sm text-[var(--muted-foreground)]">Map your CSV columns to contact fields.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CSV Column</TableHead>
            <TableHead>Maps to</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.headers.map((h) => (
            <TableRow key={h}>
              <TableCell className="font-mono text-sm">{h}</TableCell>
              <TableCell>
                <Select value={mapping[h] ?? "__skip__"} onValueChange={(v) => onUpdateMapping(h, v)}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {mappedFields.length > 0 && preview.preview_rows.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--foreground)]">Preview (first 3 rows)</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {mappedFields.map(([, field]) => (<TableHead key={field}>{field}</TableHead>))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.preview_rows.slice(0, 3).map((row, idx) => (
                  <TableRow key={idx}>
                    {mappedFields.map(([csvCol, field]) => (
                      <TableCell key={field} className="text-sm">{row[csvCol] ?? ""}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {!hasRequired && (
        <p className="text-sm text-amber-600">Map at least one column to first_name or last_name to continue.</p>
      )}
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!hasRequired}>Next</Button>
      </div>
    </div>
  );
}

// Step 4
function StepVerify(props: {
  totalCount: number; importMode: string; dedupField: string;
  result: CsvImportResult | null; errorsExpanded: boolean;
  onToggleErrors: () => void; onImport: () => void;
  isImporting: boolean; onDone: () => void;
}) {
  const { totalCount, importMode, dedupField, result, errorsExpanded,
    onToggleErrors, onImport, isImporting, onDone } = props;
  const modeLabel = importMode === "create_and_update" ? "Create and update" : "Create new only";

  if (result) {
    return (
      <div className="space-y-4 py-4">
        <p className="text-sm font-medium text-[var(--foreground)]">Import complete</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-xl font-bold text-green-700">{result.created}</p>
            <p className="text-xs text-green-600">Created</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="text-xl font-bold text-blue-700">{result.updated}</p>
            <p className="text-xs text-blue-600">Updated</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold text-gray-600">{result.skipped}</p>
            <p className="text-xs text-gray-500">Skipped</p>
          </div>
        </div>
        {result.errors.length > 0 && (
          <div className="space-y-2">
            <button onClick={onToggleErrors} className="flex items-center gap-1 text-sm font-medium text-red-600">
              Errors: {result.errors.length}
              {errorsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {errorsExpanded && (
              <div className="max-h-40 overflow-y-auto rounded border border-red-200 bg-red-50 p-2 text-sm">
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-red-700">Row {err.row}: {err.message}</p>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end"><Button onClick={onDone}>Done</Button></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-4">
      <p className="text-sm text-[var(--foreground)]">
        Ready to import <strong>{totalCount}</strong> contacts.
        <br />
        Mode: <Badge variant="outline">{modeLabel}</Badge>{" "}
        Dedup by: <Badge variant="outline">{dedupField}</Badge>
      </p>
      {isImporting && <Progress value={undefined} className="w-full" />}
      <div className="flex justify-end">
        <Button onClick={onImport} disabled={isImporting}>
          {isImporting ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Importing...</>) : "Import"}
        </Button>
      </div>
    </div>
  );
}
