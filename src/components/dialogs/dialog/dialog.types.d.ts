import { ArpaElementConfigType } from "../../arpaElement/arpaElement";

export type DialogConfigType = ArpaElementConfigType & {
    canClose?: boolean;
    content?: string;
    dialogsId?: string;
    footer?: string;
    icon?: string;
    id?: string;
    open?: boolean;
    persist?: boolean;
    promise?: Promise<unknown>;
    title?: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'minimal' | 'delete' | 'default';
};
