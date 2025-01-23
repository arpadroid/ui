import { ArpaElementConfigType } from "../../arpaElement/arpaElement";

export type DialogConfigType = ArpaElementConfigType | {
    open?: boolean;
    persist?: boolean;
    canClose?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'minimal' | 'delete' | 'default';
    title?: string;
    icon?: string;
    content?: string;
    dialogsId?: string;
};
