import { useContext } from 'react';
import { AreaContext } from '../context/AreaContext';

export const useArea = () => useContext(AreaContext);
