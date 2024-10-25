import { AbstractComponentInterface } from '../../../../components/abstract-component/abstractComponentInterface.js';
import DialogContext from '../../contexts/dialogContext.js';

export interface DialogsInterface extends AbstractComponentInterface {
    dialogContext?: DialogContext;
}
