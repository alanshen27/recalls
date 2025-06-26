'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, File, X, CheckCircle, AlertCircle, Bot } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from './ui/textarea';
import { Tabs, TabsTrigger, TabsList } from './ui/tabs';
import { Badge } from './ui/badge';
import EditFlashcards from '@/app/sets/[id]/edit/EditFlashcards';

interface Flashcard {
    id: string;
    term: string | null;
    definition: string | null;
}

interface FileUploadProps {
    onUpload?: (data: { term: string; definition: string }[]) => void;
    setId?: string; // Optional set ID for EditFlashcards
}

export function FileUpload({ onUpload, setId }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState<'file' | 'text' | 'ai'>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState('');
    const [previewData, setPreviewData] = useState<Flashcard[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseFlashcards = (text: string): Flashcard[] => {
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map((line, index) => {
            const [term, definition] = line.split(',').map(s => s.trim());
            return {
                id: `temp_${Date.now()}_${index}`,
                term: term || null,
                definition: definition || null
            };
        }).filter(card => card.term && card.definition);
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        const allowedTypes = ['text/csv', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a CSV or text file');
            return;
        }

        setSelectedFile(file);
        setIsProcessing(true);
        try {
            const text = await file.text();
            const flashcards = parseFlashcards(text);

            if (flashcards.length === 0) {
                toast.error('No valid flashcards found in the file');
                return;
            }

            setPreviewData(flashcards);
            setShowPreview(true);
            toast.success(`Found ${flashcards.length} flashcards. Review and edit below.`);
        } catch (error) {
            console.error('Error processing file:', error);
            toast.error('Error processing file');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTextSubmit = () => {
        if (!textInput.trim()) {
            toast.error('Please enter some flashcard data');
            return;
        }

        setIsProcessing(true);
        try {
            const flashcards = parseFlashcards(textInput);

            if (flashcards.length === 0) {
                toast.error('No valid flashcards found. Please use format: term,definition');
                return;
            }

            setPreviewData(flashcards);
            setShowPreview(true);
            toast.success(`Found ${flashcards.length} flashcards. Review and edit below.`);
        } catch (error) {
            console.error('Error processing text:', error);
            toast.error('Error processing text input');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAiSubmit = async () => {
        if (!textInput.trim()) {
            toast.error('Please enter some flashcard data');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch('/api/sets/inference/flashcards', {
                method: 'POST',
                body: JSON.stringify({
                    text: textInput
                })
            });

            if (!response.ok) {
                toast.error('Error generating flashcards');
                return;
            }

            const data = await response.json();
            const flashcards = data.flashcards;

            const parsedFlashcards = parseFlashcards(flashcards);

            setPreviewData(parsedFlashcards);
            setShowPreview(true);            
        } catch (error) {
            console.error('Error processing text:', error);
            toast.error('Error processing text input');
        } finally {
            setIsProcessing(false);
        }
    }


    const handleProcessFlashcards = (flashcards: Flashcard[]) => {
        if (flashcards.length === 0) {
            toast.error('No flashcards to process');
            return;
        }

        const processedData = flashcards
            .filter(card => card.term && card.definition)
            .map(({ term, definition }) => ({
                term: term!,
                definition: definition!
            }));

        if (processedData.length === 0) {
            toast.error('No valid flashcards to process');
            return;
        }

        onUpload?.(processedData);
        toast.success(`Successfully processed ${processedData.length} flashcards`);

        // Reset the form
        setShowPreview(false);
        setPreviewData([]);
        setSelectedFile(null);
        setTextInput('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFlashcardsChange = (flashcards: Flashcard[]) => {
        setPreviewData(flashcards);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewData([]);
        setShowPreview(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 overflow-y-auto">
            {!showPreview ? (
                <Card className={cn(
                    "border-2 border-dashed transition-all duration-200",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                        : "border-muted-foreground/25 hover:border-muted-foreground/40"
                )}>
                    <CardContent className="p-8">
                        <div className="text-center space-y-6">
                            {/* Header */}
                            <div className="space-y-3">
                                <div className={cn(
                                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
                                    isDragging
                                        ? "bg-primary/10 text-primary scale-110"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Upload className={cn(
                                        "h-8 w-8 transition-all duration-200",
                                        isDragging ? "animate-bounce" : ""
                                    )} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Upload Flashcard Set</h3>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                        Upload a CSV file or paste your flashcards directly. Each line should follow the format: <code className="bg-muted px-1 rounded">term,definition</code>
                                    </p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <Tabs
                                defaultValue="file"
                                className="w-full max-w-md mx-auto"
                                onValueChange={(value) => setMode(value as 'file' | 'text')}
                            >
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="file" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        File Upload
                                    </TabsTrigger>
                                    <TabsTrigger value="text" className="flex items-center gap-2">
                                        <File className="h-4 w-4" />
                                        Text Input
                                    </TabsTrigger>
                                    <TabsTrigger value="ai" className="flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        AI
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {/* Content */}
                            <div className="space-y-4">
                                {mode === 'file' && (
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
                                            isDragging
                                                ? "border-primary bg-primary/5"
                                                : "border-muted-foreground/25 hover:border-muted-foreground/40"
                                        )}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {selectedFile ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-medium text-sm">{selectedFile.name}</p>
                                                            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            clearFile();
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {isProcessing ? (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                        Processing file...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                                        <CheckCircle className="h-4 w-4" />
                                                        File ready to process
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-3">
                                                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Drop your file here or click to browse</p>
                                                    <p className="text-sm text-muted-foreground">CSV or TXT files only</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {mode === 'text' && (
                                    <div className="space-y-4">
                                        <Textarea
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder="Enter your flashcards here...&#10;Example:&#10;JavaScript,Programming language&#10;React,Frontend framework&#10;TypeScript,Typed JavaScript"
                                            className="h-32 resize-none"
                                            disabled={isProcessing}
                                        />
                                        <Button
                                            onClick={handleTextSubmit}
                                            disabled={isProcessing || !textInput.trim()}
                                            className="w-full"
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Parse Flashcards
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                                {mode === 'ai' && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Textarea
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="Enter your context that you want to study here, the LLM will generate flashcards for you."
                                                className="h-32 resize-none"
                                                disabled={isProcessing}
                                            />
                                            <Button variant="ghost" className="absolute right-2 top-2">
                                                <Bot className="h-4 w-4" />
                                            </Button>

                                        </div>
                                        <Button
                                            onClick={handleAiSubmit}
                                            disabled={isProcessing || !textInput.trim()}
                                            className="w-full"
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                <>
                                                    <Bot className="h-4 w-4 mr-2" />
                                                    Generate Flashcards
                                                </>
                                            )}
                                        </Button>                                    
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />

                                {/* Help text */}
                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Format Guide</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>• Each line should contain: <code className="bg-background px-1 rounded">term,definition</code></p>
                                        <p>• Supported formats: CSV, TXT</p>
                                        <p>• Maximum file size: 10MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Preview Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">Flashcard Preview & Edit</h3>
                            <Badge variant="secondary">{previewData.length} cards</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPreview(false);
                                    setPreviewData([]);
                                }}
                            >
                                Back to Upload
                            </Button>
                            <Button
                                onClick={() => handleProcessFlashcards(previewData)}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Process All Cards
                            </Button>
                        </div>
                    </div>

                    {/* EditFlashcards Component */}
                    <div className="border rounded-lg p-4 h-[500px] overflow-y-auto">
                        <EditFlashcards
                            setId={setId || 'temp'}
                            initialFlashcards={previewData}
                            previewMode={true}
                            onFlashcardsChange={handleFlashcardsChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ');
} 