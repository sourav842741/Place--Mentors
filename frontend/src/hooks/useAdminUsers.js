import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers } from '../redux/adminUserSlice';

export const useAdminUsers = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.adminUsers);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  return { data, loading, error, refetch: () => dispatch(fetchAdminUsers()) };
};
