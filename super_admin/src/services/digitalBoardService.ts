import { api } from "@/lib/api";

export interface WhiteboardSettings {
    aiAssistant: boolean;
    periodicTable: boolean;
    shapeBuilder3D: boolean;
    attendance: boolean;
    homeworkGenerator: boolean;
    splitScreen: boolean;
    mathTools: boolean;
    chemistryTools: boolean;
    physicsSimulations: boolean;
    allowedGrades: number[];
    globalAiTokenLimit: number;
}

export const digitalBoardService = {
    getSettings: async (orgId: string): Promise<WhiteboardSettings> => {
        const res = await api.get(`/organizations/${orgId}/whiteboard-settings`);
        return res.data;
    },

    updateSettings: async (orgId: string, settings: Partial<WhiteboardSettings>): Promise<any> => {
        return api.patch(`/organizations/${orgId}/whiteboard-settings`, settings);
    },

    getSessions: async (orgId?: string): Promise<any[]> => {
        const params = new URLSearchParams();
        if (orgId) params.set('orgId', orgId);
        // Assuming a general sessions endpoint exists or we use org-specific filtering in the future
        // For now, return mock-friendly interface or real if exists
        const res = await api.get(`/digital-board/sessions?${params.toString()}`);
        return res.data || [];
    }
};
