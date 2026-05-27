import { ArpaNodeConfigType } from '../arpaNode/arpaNode';

export type ArpaFragmentConfigType = Omit<ArpaNodeConfigType, 'attr' | 'className' | 'id'> & {};
