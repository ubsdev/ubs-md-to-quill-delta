import Op from 'quill-delta/dist/Op';
export interface MarkdownToQuillOptions {
    debug?: boolean;
}
export declare class MarkdownToQuill {
    options: MarkdownToQuillOptions;
    blocks: string[];
    constructor(options?: Partial<MarkdownToQuillOptions>);
    convert(text: string): Op[];
    private convertChildren;
    private isBlock;
    private convertInline;
    private inlineFormat;
    private embedFormat;
    private convertListItem;
}
