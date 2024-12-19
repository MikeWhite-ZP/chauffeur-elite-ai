import { useCallback, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import debounce from "lodash.debounce";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  value: initialValue,
  language = "typescript",
  onChange,
  onSave,
  readOnly = false,
}: CodeEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce(async (newValue: string) => {
      if (!onSave) return;
      
      try {
        setIsSaving(true);
        await onSave(newValue);
        setIsModified(false);
        toast({
          title: "Changes saved",
          description: "Your changes have been automatically saved.",
        });
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Failed to save your changes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [onSave, toast]
  );

  // Handle editor value changes
  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;
    
    setValue(newValue);
    setIsModified(true);
    onChange?.(newValue);
    debouncedSave(newValue);
  };

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor) => {
    // Enable word wrap
    editor.getModel()?.updateOptions({ tabSize: 2, insertSpaces: true });
    
    // Add keyboard shortcut for manual save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      debouncedSave.flush();
    });
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return (
    <div className="relative h-full w-full min-h-[300px] border rounded-md overflow-hidden">
      {/* Status bar */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm rounded-bl-md">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : isModified ? (
          <>
            <Save className="h-4 w-4" />
            <span>Modified</span>
          </>
        ) : null}
      </div>

      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          readOnly,
          renderWhitespace: "selection",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          theme: "vs-dark",
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }
      />
    </div>
  );
}
