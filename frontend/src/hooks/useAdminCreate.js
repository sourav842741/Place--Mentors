import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createManualPotd,
  createManualCpotd,
  clearError,
  clearSuccess,
} from '../redux/adminCreateSlice';

export const useAdminCreate = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.adminCreate);

  const createPotd = (data) => dispatch(createManualPotd(data));
  const createCpotd = (data) => dispatch(createManualCpotd(data));

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  return { loading, error, success, createPotd, createCpotd };
};
