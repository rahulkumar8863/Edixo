import { jsPDF } from 'jspdf';
import { Question } from '../components/types';

export type PDFTemplate = 'exam_paper' | 'default' | 'minimal' | 'detailed';

export interface PDFExportConfig {
    title: string;
    organizationName: string;
    language: 'English' | 'Hindi' | 'Bilingual';
    columnLayout: 'single' | 'two';
    fontSize: number;
    lineSpacing: number;
    spacingBetweenQuestions: number;
    headerAlign: 'left' | 'center';
    headerStyle: 'simple' | 'boxed' | 'underline' | 'double-line';
    accentColor: string;
    showLogo: boolean;
    showQuestionNumbers: boolean;
    showMarks: boolean;
    defaultMarks: number;
    showBorder: boolean;
    questionBorder: boolean;
    optionStyle: 'list' | 'grid' | 'inline';
    optionLabel: 'alpha' | 'roman' | 'number';
    questionSeparator: 'none' | 'line' | 'dot';
    showStudentInfo: boolean;
    studentFields: string[];
    showDate: boolean;
    dateText: string;
    showDuration: boolean;
    durationText: string;
    showSubjectLine: boolean;
    subjectText: string;
    showDifficulty: boolean;
    showSectionDivider: boolean;
    showInstructions: boolean;
    instructions: string[];
    headerBannerEnabled: boolean;
    headerBannerText: string;
    watermarkEnabled: boolean;
    watermarkText: string;
    footerEnabled: boolean;
    footerText: string;
    showPageNumbers: boolean;
    includeAnswerKey: boolean;
    includeSolutions: boolean;
    paperPadding: number;
    startingNumber: number;
}

export interface PDFOptions {
    template?: PDFTemplate;
    title: string;
    subtitle?: string;
    includeAnswerKey: boolean;
    includeExplanations: boolean;
    footerText?: string;
}

function stripHtml(html: string): string {
    if (!html) return '';
    let t = html;
    t = t.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    t = t.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    t = t.replace(/<br\s*\/?>/gi, ' ');
    t = t.replace(/<\/p>/gi, ' ');
    t = t.replace(/<\/div>/gi, ' ');
    t = t.replace(/<[^>]*>/g, '');
    t = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    t = t.replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"');
    t = t.replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…');
    t = t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
    t = t.replace(/\s+/g, ' ');
    return t.trim();
}

function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return [parseInt(hex.substring(0,2),16), parseInt(hex.substring(2,4),16), parseInt(hex.substring(4,6),16)];
}

function getAnsLabel(q: Question): string {
    const idx = parseInt(q.answer);
    if (isNaN(idx) || idx < 1 || idx > 5) return q.answer || '—';
    return String.fromCharCode(64 + idx);
}

function getOptLabel(style: 'alpha'|'roman'|'number', i: number): string {
    if (style === 'roman') return ['I','II','III','IV','V'][i] || '';
    if (style === 'number') return `${i+1}`;
    return String.fromCharCode(65 + i);
}

export async function generateQuestionSetPDF(questions: Question[], options: PDFOptions | PDFExportConfig) {
    const isFull = 'organizationName' in options;
    const cfg = isFull ? options as PDFExportConfig : null;

    const doc = new jsPDF('p', 'mm', 'a4');
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();
    const M = cfg ? Math.max(cfg.paperPadding * 0.32, 12) : 16;
    const CW = PW - M * 2;
    const FS = cfg?.fontSize || 10;
    const LH = (cfg?.lineSpacing || 1.5) * FS * 0.36;
    const ac = cfg?.accentColor || '#FF5A1F';
    const [aR, aG, aB] = hexToRgb(ac);
    const centered = (cfg?.headerAlign || 'center') === 'center';
    const lang = cfg?.language || 'English';
    const sn = cfg?.startingNumber || 1;

    let y = M;

    const needPage = (h: number) => {
        if (y + h > PH - M - 8) { doc.addPage(); y = M; return true; }
        return false;
    };

    // ── BANNER ──
    if (cfg?.headerBannerEnabled && cfg.headerBannerText) {
        doc.setFillColor(aR, aG, aB);
        doc.rect(M, y, CW, 8, 'F');
        doc.setFontSize(9); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
        doc.text(cfg.headerBannerText, PW/2, y+5.5, { align: 'center' });
        y += 12;
    }

    // ── HEADER ──
    doc.setFontSize(FS + 6); doc.setTextColor(15,23,42); doc.setFont('helvetica','bold');
    const orgName = cfg?.organizationName || (options as PDFOptions).title;
    if (centered) doc.text(orgName, PW/2, y+5, { align: 'center' }); else doc.text(orgName, M, y+5);
    y += (FS+6)*0.42 + 2;

    doc.setFontSize(FS + 2); doc.setTextColor(51,65,85); doc.setFont('helvetica','bold');
    const ttl = cfg?.title || (options as PDFOptions).title;
    if (centered) doc.text(ttl, PW/2, y+4, { align: 'center' }); else doc.text(ttl, M, y+4);
    y += (FS+2)*0.42 + 2;

    // Meta row
    if (cfg) {
        const parts: string[] = [];
        if (cfg.showSubjectLine) parts.push(`Subject: ${cfg.subjectText}`);
        if (cfg.showDate) parts.push(`Date: ${cfg.dateText}`);
        if (cfg.showDuration) parts.push(`Duration: ${cfg.durationText}`);
        if (cfg.showMarks) {
            const tm = questions.reduce((s,q) => s + (q.marks || cfg.defaultMarks), 0);
            parts.push(`Max Marks: ${tm}`);
        }
        if (parts.length) {
            doc.setFontSize(FS-1); doc.setTextColor(100,116,139); doc.setFont('helvetica','normal');
            const meta = parts.join('   |   ');
            if (centered) doc.text(meta, PW/2, y+3, { align: 'center' }); else doc.text(meta, M, y+3);
            y += 6;
        }
    }

    // Header line
    y += 2;
    const hs = cfg?.headerStyle || 'simple';
    if (hs === 'double-line') {
        doc.setDrawColor(aR,aG,aB); doc.setLineWidth(0.6); doc.line(M, y, PW-M, y);
        doc.setLineWidth(0.25); doc.line(M, y+1.5, PW-M, y+1.5); y += 5;
    } else if (hs === 'underline') {
        doc.setDrawColor(aR,aG,aB); doc.setLineWidth(0.5); doc.line(M, y, PW-M, y); y += 4;
    } else if (hs === 'boxed') {
        doc.setDrawColor(aR,aG,aB); doc.setLineWidth(0.6); doc.rect(M, M, CW, y-M+2); y += 5;
    } else {
        doc.setDrawColor(220,220,220); doc.setLineWidth(0.3); doc.line(M, y, PW-M, y); y += 4;
    }

    // ── STUDENT INFO ──
    if (cfg?.showStudentInfo && cfg.studentFields.length > 0) {
        doc.setFontSize(FS-1); doc.setTextColor(71,85,105); doc.setFont('helvetica','bold');
        const cols = Math.min(cfg.studentFields.length, 3);
        const fw = CW / cols;
        let fx = M; let row = 0;
        cfg.studentFields.forEach((f, i) => {
            if (i > 0 && i % cols === 0) { row++; fx = M; }
            const fy = y + row * 8;
            doc.text(`${f}:`, fx, fy + 4);
            const lw = doc.getTextWidth(`${f}: `);
            doc.setDrawColor(180,180,180); doc.setLineWidth(0.15);
            const dashLen = 1;
            for (let dx = fx + lw + 1; dx < fx + fw - 4; dx += dashLen * 2) {
                doc.line(dx, fy+4.5, Math.min(dx+dashLen, fx+fw-4), fy+4.5);
            }
            fx += fw;
        });
        y += (row+1)*8 + 3;
    }

    // ── INSTRUCTIONS ──
    if (cfg?.showInstructions && cfg.instructions.length > 0) {
        needPage(15 + cfg.instructions.length * 5);
        doc.setFontSize(FS-1); doc.setTextColor(51,65,85); doc.setFont('helvetica','bold');
        doc.text('General Instructions:', M+2, y+4);
        y += 6;
        doc.setFont('helvetica','normal'); doc.setFontSize(FS-2); doc.setTextColor(100,116,139);
        cfg.instructions.forEach((inst, i) => {
            const lines = doc.splitTextToSize(`${i+1}. ${inst}`, CW - 8);
            doc.text(lines, M+4, y+3);
            y += lines.length * (LH * 0.85) + 1.5;
        });
        y += 3;
    }

    // ── SECTION DIVIDER ──
    if (cfg?.showSectionDivider) {
        needPage(10);
        doc.setFontSize(FS-2); doc.setTextColor(aR,aG,aB); doc.setFont('helvetica','bold');
        const dt = 'QUESTIONS';
        const tw = doc.getTextWidth(dt);
        const cx = PW/2;
        doc.setDrawColor(aR,aG,aB); doc.setLineWidth(0.25);
        doc.line(M, y+2, cx - tw/2 - 3, y+2);
        doc.text(dt, cx, y+3, { align: 'center' });
        doc.line(cx + tw/2 + 3, y+2, PW-M, y+2);
        y += 8;
    }

    // ── QUESTIONS ──
    const twoCol = cfg?.columnLayout === 'two';
    const colW = twoCol ? (CW - 6) / 2 : CW;
    let colX = M;
    let col2Y = y;

    questions.forEach((q, idx) => {
        const num = idx + sn;
        const qText = stripHtml(lang !== 'Hindi' ? q.question_eng : q.question_hin);
        const hinText = lang === 'Bilingual' ? stripHtml(q.question_hin) : '';

        const optRaw = [
            lang !== 'Hindi' ? q.option1_eng : q.option1_hin,
            lang !== 'Hindi' ? q.option2_eng : q.option2_hin,
            lang !== 'Hindi' ? q.option3_eng : q.option3_hin,
            lang !== 'Hindi' ? q.option4_eng : q.option4_hin,
        ];
        if (q.option5_eng) optRaw.push(lang !== 'Hindi' ? q.option5_eng : (q.option5_hin || ''));
        const opts = optRaw.map(o => stripHtml(o));

        doc.setFontSize(FS); doc.setFont('helvetica','bold');
        const qLines = doc.splitTextToSize(qText, colW - 12);
        const optH = opts.length * (LH + 1.5);
        const estH = qLines.length * LH + optH + (cfg?.spacingBetweenQuestions || 1.5) * 3 + 4;

        if (twoCol) {
            if (y + estH > PH - M - 8) {
                if (colX === M) { colX = M + colW + 6; y = col2Y; }
                else { doc.addPage(); y = M; col2Y = M; colX = M; }
            }
        } else {
            needPage(estH);
        }

        const qX = colX;

        // Question border
        if (cfg?.questionBorder) {
            doc.setFillColor(250,250,250); doc.setDrawColor(229,231,235); doc.setLineWidth(0.2);
            doc.roundedRect(qX, y-1, colW, estH-1, 1, 1, 'FD');
        }

        // Q number
        doc.setFontSize(FS); doc.setFont('helvetica','bold'); doc.setTextColor(aR,aG,aB);
        const numStr = (cfg?.showQuestionNumbers !== false) ? `Q${num}. ` : '';
        const numW = doc.getTextWidth(numStr);
        if (numStr) doc.text(numStr, qX+2, y+4);

        // Q text
        doc.setTextColor(30,41,59); doc.setFont('helvetica','normal');
        const wQ = doc.splitTextToSize(qText, colW - numW - 6);
        doc.text(wQ, qX+2+numW, y+4, { maxWidth: colW - numW - 6 });
        y += wQ.length * LH + 1;

        // Marks
        if (cfg?.showMarks) {
            doc.setFontSize(FS-2); doc.setTextColor(148,163,184); doc.setFont('helvetica','normal');
            doc.text(`[${q.marks || cfg.defaultMarks}M]`, qX + colW - 12, y);
        }

        // Difficulty badge
        if (cfg?.showDifficulty && q.difficulty) {
            doc.setFontSize(FS-3); doc.setFont('helvetica','bold');
            const dC = q.difficulty === 'Easy' ? [22,163,74] : q.difficulty === 'Medium' ? [245,158,11] : [220,38,38];
            doc.setTextColor(dC[0],dC[1],dC[2]);
            doc.text(q.difficulty, qX + colW - 25, y);
        }

        // Hindi text
        if (hinText) {
            y += 1;
            doc.setFontSize(FS-1); doc.setTextColor(100,116,139); doc.setFont('helvetica','italic');
            const hLines = doc.splitTextToSize(hinText, colW - 8);
            doc.text(hLines, qX+4, y+3);
            y += hLines.length * (LH*0.9) + 1;
        }

        // Options
        y += 2;
        const oStyle = cfg?.optionStyle || 'list';
        const oLabel = cfg?.optionLabel || 'alpha';

        if (oStyle === 'grid') {
            const halfW = (colW - 10) / 2;
            opts.forEach((opt, oi) => {
                const ox = qX + 4 + (oi % 2) * (halfW + 4);
                const oy = y + Math.floor(oi / 2) * (LH + 2);
                doc.setFontSize(FS); doc.setTextColor(aR,aG,aB); doc.setFont('helvetica','bold');
                doc.text(`(${getOptLabel(oLabel, oi)})`, ox, oy + 3);
                doc.setTextColor(71,85,105); doc.setFont('helvetica','normal');
                const olW = doc.getTextWidth(`(${getOptLabel(oLabel, oi)}) `);
                const oLines = doc.splitTextToSize(opt, halfW - olW - 2);
                doc.text(oLines, ox + olW, oy + 3);
            });
            y += Math.ceil(opts.length / 2) * (LH + 2) + 1;
        } else {
            opts.forEach((opt, oi) => {
                if (!twoCol) needPage(LH + 3);
                doc.setFontSize(FS); doc.setTextColor(aR,aG,aB); doc.setFont('helvetica','bold');
                const lbl = `(${getOptLabel(oLabel, oi)}) `;
                const lblW = doc.getTextWidth(lbl);
                doc.text(lbl, qX+4, y+3);
                doc.setTextColor(71,85,105); doc.setFont('helvetica','normal');
                const oLines = doc.splitTextToSize(opt, colW - lblW - 10);
                doc.text(oLines, qX+4+lblW, y+3);
                y += oLines.length * LH + 1.5;
            });
        }

        // Solution
        if (cfg?.includeSolutions) {
            const sol = stripHtml(lang !== 'Hindi' ? q.solution_eng : q.solution_hin);
            if (sol) {
                doc.setFontSize(FS-1); doc.setTextColor(37,99,235); doc.setFont('helvetica','bold');
                doc.text('Solution: ', qX+4, y+3);
                const sw = doc.getTextWidth('Solution: ');
                doc.setFont('helvetica','normal');
                const sLines = doc.splitTextToSize(sol, colW - sw - 8);
                doc.text(sLines, qX+4+sw, y+3);
                y += sLines.length * (LH*0.9) + 2;
            }
        }

        // Q separator
        const sep = cfg?.questionSeparator || 'none';
        if (sep === 'line' && idx < questions.length - 1) {
            y += 1; doc.setDrawColor(229,231,235); doc.setLineWidth(0.2); doc.line(qX+2, y, qX+colW-2, y); y += 2;
        } else if (sep === 'dot' && idx < questions.length - 1) {
            y += 1; doc.setTextColor(200,200,200); doc.setFontSize(6);
            doc.text('• • • • • • •', qX + colW/2, y+1, { align: 'center' }); y += 3;
        }

        y += (cfg?.spacingBetweenQuestions || 1.5) * 3;
    });

    // ── ANSWER KEY ──
    if (cfg?.includeAnswerKey || (!cfg && (options as PDFOptions).includeAnswerKey)) {
        doc.addPage(); y = M;

        if (cfg?.showSectionDivider) {
            doc.setFontSize(FS-2); doc.setTextColor(aR,aG,aB); doc.setFont('helvetica','bold');
            const dt = 'ANSWER KEY';
            const tw = doc.getTextWidth(dt);
            const cx = PW/2;
            doc.setDrawColor(aR,aG,aB); doc.setLineWidth(0.25);
            doc.line(M, y+2, cx-tw/2-3, y+2);
            doc.text(dt, cx, y+3, { align: 'center' });
            doc.line(cx+tw/2+3, y+2, PW-M, y+2);
            y += 10;
        } else {
            doc.setFontSize(FS+2); doc.setTextColor(30,30,30); doc.setFont('helvetica','bold');
            doc.text('Answer Key', M, y+5); y += 12;
        }

        // Grid layout for answer key
        doc.setFontSize(FS); doc.setFont('helvetica','normal');
        const akColW = 28;
        const akCols = Math.floor(CW / akColW);
        questions.forEach((q, idx) => {
            const col = idx % akCols;
            const row = Math.floor(idx / akCols);
            const ax = M + col * akColW;
            const ay = y + row * (LH + 3);
            if (ay > PH - M - 8) { doc.addPage(); y = M; return; }
            doc.setTextColor(30,30,30); doc.setFont('helvetica','bold');
            doc.text(`${idx + sn}.`, ax, ay + 3);
            doc.setTextColor(aR,aG,aB); doc.setFont('helvetica','bold');
            doc.text(getAnsLabel(q), ax + 8, ay + 3);
        });
    }

    // ── SOLUTIONS PAGE ──
    if (cfg?.includeSolutions || (!cfg && (options as PDFOptions).includeExplanations)) {
        doc.addPage(); y = M;
        doc.setFontSize(FS+2); doc.setTextColor(30,30,30); doc.setFont('helvetica','bold');
        doc.text('Solutions & Explanations', M, y+5); y += 12;

        doc.setFontSize(FS);
        questions.forEach((q, idx) => {
            const sol = stripHtml(lang !== 'Hindi' ? q.solution_eng : q.solution_hin);
            if (!sol) return;
            needPage(20);
            doc.setTextColor(30,30,30); doc.setFont('helvetica','bold');
            doc.text(`Q${idx+sn}. (Ans: ${getAnsLabel(q)})`, M, y+4); y += LH + 2;
            doc.setFont('helvetica','normal'); doc.setTextColor(71,85,105);
            const sLines = doc.splitTextToSize(sol, CW - 4);
            doc.text(sLines, M+2, y+3); y += sLines.length * LH + 4;
        });
    }

    // ── WATERMARK on all pages ──
    if (cfg?.watermarkEnabled && cfg.watermarkText) {
        const tp = doc.getNumberOfPages();
        for (let i = 1; i <= tp; i++) {
            doc.setPage(i);
            doc.setFontSize(48); doc.setTextColor(230,230,230); doc.setFont('helvetica','bold');
            doc.text(cfg.watermarkText, PW/2, PH/2, { align: 'center', angle: 45 });
        }
    }

    // ── FOOTER on all pages ──
    const showFooter = cfg ? cfg.footerEnabled : !!(options as PDFOptions).footerText;
    const footerTxt = cfg?.footerText || (options as PDFOptions).footerText || '';
    const showPN = cfg?.showPageNumbers ?? true;
    if (showFooter || showPN) {
        const tp = doc.getNumberOfPages();
        for (let i = 1; i <= tp; i++) {
            doc.setPage(i);
            doc.setFontSize(7); doc.setTextColor(160,160,160); doc.setFont('helvetica','normal');
            if (showFooter && footerTxt) doc.text(footerTxt, M, PH - 6);
            if (showPN) doc.text(`Page ${i} of ${tp}`, PW - M, PH - 6, { align: 'right' });
        }
    }

    // ── BORDER on all pages ──
    if (cfg?.showBorder) {
        const tp = doc.getNumberOfPages();
        for (let i = 1; i <= tp; i++) {
            doc.setPage(i);
            doc.setDrawColor(200,200,200); doc.setLineWidth(0.4);
            doc.rect(M-3, M-3, CW+6, PH-2*M+6);
        }
    }

    doc.save(`${(cfg?.title || (options as PDFOptions).title).replace(/[^a-zA-Z0-9 ]/g, '_')}.pdf`);
}
