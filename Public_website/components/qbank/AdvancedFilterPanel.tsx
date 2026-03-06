import React from 'react';
import { Filter, FilterX, Sparkles, Flag, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

interface AdvancedFilterPanelProps {
    showPanel: boolean;
    setShowPanel: (show: boolean) => void;

    // Filters
    topicFilter: string;
    setTopicFilter: (val: string) => void;
    sectionFilter: string;
    setSectionFilter: (val: string) => void;
    collectionFilter: string;
    setCollectionFilter: (val: string) => void;
    aiGeneratedFilter: 'All' | 'AI' | 'Manual';
    setAiGeneratedFilter: (val: 'All' | 'AI' | 'Manual') => void;
    flaggedFilter: 'All' | 'Flagged' | 'Unflagged';
    setFlaggedFilter: (val: 'All' | 'Flagged' | 'Unflagged') => void;
    smartPreset: string;

    // Options
    uniqueTopics: string[];
    uniqueSections: string[];
    uniqueCollections: string[];

    // Results
    filteredCount: number;
    totalCount: number;

    // Actions
    clearAllFilters: () => void;
    applySmartPreset: (preset: string) => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
    showPanel,
    setShowPanel,
    topicFilter,
    setTopicFilter,
    sectionFilter,
    setSectionFilter,
    collectionFilter,
    setCollectionFilter,
    aiGeneratedFilter,
    setAiGeneratedFilter,
    flaggedFilter,
    setFlaggedFilter,
    smartPreset,
    uniqueTopics,
    uniqueSections,
    uniqueCollections,
    filteredCount,
    totalCount,
    clearAllFilters,
    applySmartPreset
}) => {
    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-border transform transition-transform duration-300 ease-in-out ${showPanel ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Advanced Filters
                    </h3>
                    <button 
                        onClick={() => setShowPanel(false)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Smart Presets */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-accent" />
                            Smart Presets
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {['JEE Main', 'NEET', 'SSC CGL', 'Railway'].map(preset => (
                                <button
                                    key={preset}
                                    onClick={() => applySmartPreset(preset)}
                                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                                        smartPreset === preset
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:bg-muted'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Topic</label>
                        <select
                            value={topicFilter}
                            onChange={(e) => setTopicFilter(e.target.value)}
                            className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">All Topics</option>
                            {uniqueTopics.map(topic => (
                                <option key={topic} value={topic}>{topic}</option>
                            ))}
                        </select>
                    </div>

                    {/* Section Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Section</label>
                        <select
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                            className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">All Sections</option>
                            {uniqueSections.map(section => (
                                <option key={section} value={section}>{section}</option>
                            ))}
                        </select>
                    </div>

                    {/* Collection Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Collection</label>
                        <select
                            value={collectionFilter}
                            onChange={(e) => setCollectionFilter(e.target.value)}
                            className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="">All Collections</option>
                            {uniqueCollections.map(collection => (
                                <option key={collection} value={collection}>{collection}</option>
                            ))}
                        </select>
                    </div>

                    {/* AI Generated Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">AI Generated</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['All', 'AI', 'Manual'] as const).map(option => (
                                <button
                                    key={option}
                                    onClick={() => setAiGeneratedFilter(option)}
                                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                                        aiGeneratedFilter === option
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:bg-muted'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Flagged Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Flagged Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['All', 'Flagged', 'Unflagged'] as const).map(option => (
                                <button
                                    key={option}
                                    onClick={() => setFlaggedFilter(option)}
                                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                                        flaggedFilter === option
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background border-border hover:bg-muted'
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">
                            {filteredCount} of {totalCount} items
                        </span>
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80"
                        >
                            <FilterX className="h-3 w-3" />
                            Clear All
                        </button>
                    </div>
                    <button
                        onClick={() => setShowPanel(false)}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};