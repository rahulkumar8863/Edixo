"use client";

import React from 'react';
import { useOrg } from '@/providers/OrgProvider';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Building2, Search } from 'lucide-react';

export function OrgSwitcher() {
    const { organizations, selectedOrgId, setSelectedOrgId, isLoading } = useOrg();

    if (isLoading && organizations.length === 0) {
        return (
            <div className="px-4 py-3">
                <div className="h-10 w-full bg-white/5 animate-pulse rounded-md" />
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-b border-white/5 bg-brand-dark-deep/30">
            <label className="text-[10px] font-semibold text-slate-500 tracking-wider mb-2 block uppercase">
                Active Organization
            </label>
            <Select 
                value={selectedOrgId || ""} 
                onValueChange={(val) => setSelectedOrgId(val)}
            >
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors h-10">
                    <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
                        <SelectValue placeholder="Select Organization" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-brand-dark border-white/10 text-white">
                    {organizations.map((org) => (
                        <SelectItem 
                            key={org.orgId} 
                            value={org.orgId}
                            className="focus:bg-brand-primary focus:text-white cursor-pointer"
                        >
                            {org.name}
                        </SelectItem>
                    ))}
                    {organizations.length === 0 && (
                        <div className="p-2 text-xs text-slate-500 text-center">
                            No organizations found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
