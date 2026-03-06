"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileUp, AlertTriangle, CheckCircle, Save, X, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface PreviewRow {
    question: string;
    options: string[];
    correctAnswer: string;
    subject: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    isValid: boolean;
    error?: string;
}

interface BulkUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'summary'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
    const [importStats, setImportStats] = useState({ saved: 0, failed: 0 });
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        try {
            setError(null);
            setUploadProgress(0);
            
            // Simulate file processing
            const processFile = () => {
                return new Promise<PreviewRow[]>((resolve) => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        setUploadProgress(progress);
                        if (progress >= 100) {
                            clearInterval(interval);
                            // Mock data for demonstration
                            const mockData: PreviewRow[] = [
                                {
                                    question: "What is the capital of India?",
                                    options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
                                    correctAnswer: "Delhi",
                                    subject: "General Knowledge",
                                    topic: "Geography",
                                    difficulty: "Easy",
                                    isValid: true
                                },
                                {
                                    question: "What is 2+2?",
                                    options: ["3", "4", "5", "6"],
                                    correctAnswer: "4",
                                    subject: "Mathematics",
                                    topic: "Arithmetic",
                                    difficulty: "Easy",
                                    isValid: true
                                },
                                {
                                    question: "Invalid question without options",
                                    options: [],
                                    correctAnswer: "",
                                    subject: "Test",
                                    topic: "Test",
                                    difficulty: "Medium",
                                    isValid: false,
                                    error: "Missing options"
                                }
                            ];
                            resolve(mockData);
                        }
                    }, 100);
                });
            };

            const rawData = await processFile();
            setPreviewData(rawData);
            setFiles([file]);
            setStep('preview');
        } catch (e: any) {
            setError(e.message || "Failed to parse file");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    const handleConfirmImport = async () => {
        setStep('importing');
        try {
            // Simulate import process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const validRows = previewData.filter(row => row.isValid);
            const invalidRows = previewData.filter(row => !row.isValid);
            
            setImportStats({ 
                saved: validRows.length, 
                failed: invalidRows.length 
            });
            setStep('summary');
        } catch (e: any) {
            setError(e.message);
            setStep('preview');
        }
    };

    const resetUpload = () => {
        setStep('upload');
        setFiles([]);
        setPreviewData([]);
        setError(null);
        setUploadProgress(0);
    };

    const validRows = previewData.filter(row => row.isValid);
    const invalidRows = previewData.filter(row => !row.isValid);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-border bg-gradient-to-r from-background to-muted/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                            <FileUp className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Bulk Upload Questions</h2>
                            <p className="text-base text-muted-foreground mt-1">
                                {step === 'upload' && 'Upload CSV or Excel file'}
                                {step === 'preview' && 'Review and validate data'}
                                {step === 'importing' && 'Importing questions...'}
                                {step === 'summary' && 'Import complete'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div 
                                className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="space-y-4">
                                    <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">Drop your file here</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Supported formats: CSV, XLS, XLSX
                                        </p>
                                        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                            Browse Files
                                        </button>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                />
                            </div>

                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold text-foreground mb-2">Required Format</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>• Question (required)</p>
                                    <p>• Options A, B, C, D (at least 2 required)</p>
                                    <p>• Correct Answer (A, B, C, or D)</p>
                                    <p>• Subject (optional)</p>
                                    <p>• Topic (optional)</p>
                                    <p>• Difficulty (Easy/Medium/Hard, optional)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                    <div className="text-primary font-bold text-2xl mb-1">{previewData.length}</div>
                                    <div className="text-sm text-foreground">Total Rows</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="text-green-600 font-bold text-2xl mb-1">{validRows.length}</div>
                                    <div className="text-sm text-foreground">Valid Rows</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="text-red-600 font-bold text-2xl mb-1">{invalidRows.length}</div>
                                    <div className="text-sm text-foreground">Invalid Rows</div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="font-medium">Error</span>
                                    </div>
                                    <p className="text-red-600 mt-1">{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">Preview Data</h3>
                                <div className="border border-border rounded-lg overflow-hidden">
                                    <div className="max-h-96 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-muted sticky top-0">
                                                <tr>
                                                    <th className="p-3 text-left text-sm font-medium text-foreground border-b border-border">Question</th>
                                                    <th className="p-3 text-left text-sm font-medium text-foreground border-b border-border">Subject</th>
                                                    <th className="p-3 text-left text-sm font-medium text-foreground border-b border-border">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map((row, index) => (
                                                    <tr key={index} className="hover:bg-muted/50">
                                                        <td className="p-3 text-sm border-b border-border max-w-xs truncate">
                                                            {row.question}
                                                        </td>
                                                        <td className="p-3 text-sm border-b border-border">
                                                            {row.subject}
                                                        </td>
                                                        <td className="p-3 text-sm border-b border-border">
                                                            {row.isValid ? (
                                                                <span className="flex items-center gap-1 text-green-600">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Valid
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-red-600">
                                                                    <AlertTriangle className="h-4 w-4" />
                                                                    Invalid
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleConfirmImport}
                                    disabled={validRows.length === 0}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Import {validRows.length} Valid Questions
                                </button>
                                <button
                                    onClick={resetUpload}
                                    className="bg-muted text-foreground px-6 py-2 rounded-lg font-semibold hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="text-center space-y-6 py-12">
                            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
                                <Upload className="h-8 w-8 text-primary animate-bounce" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Importing Questions</h3>
                                <p className="text-muted-foreground">Please wait while we process your data...</p>
                            </div>
                            <div className="w-full max-w-md mx-auto">
                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'summary' && (
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">Import Complete!</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Your questions have been successfully imported to the database.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="text-green-600 font-bold text-2xl mb-1">{importStats.saved}</div>
                                    <div className="text-sm text-foreground">Questions Saved</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="text-red-600 font-bold text-2xl mb-1">{importStats.failed}</div>
                                    <div className="text-sm text-foreground">Failed to Import</div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={onSuccess}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    Continue
                                </button>
                                <button
                                    onClick={resetUpload}
                                    className="bg-muted text-foreground px-6 py-2 rounded-lg font-semibold hover:bg-muted/80 transition-colors"
                                >
                                    Upload More
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};