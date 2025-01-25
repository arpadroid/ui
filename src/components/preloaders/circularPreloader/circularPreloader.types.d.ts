import { ArpaElementConfigType } from "../../arpaElement/arpaElement.types";

export type CircularPreloaderConfigType  = ArpaElementConfigType & {
    hasMask?: boolean;
    text?: string;
    variant?: string;
    template?: string;
}
