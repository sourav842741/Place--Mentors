import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAnalytics } from '../redux/adminSlice';

export const useAdminAnalytics = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminAnalytics());
  }, [dispatch]);

  return { data, loading, error, refetch: () => dispatch(fetchAdminAnalytics()) };
};

