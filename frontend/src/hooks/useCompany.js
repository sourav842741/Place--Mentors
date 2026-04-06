import { useSelector, useDispatch } from 'react-redux';
import { fetchCompany,clearCompany,fetchCompanies } from '../redux/companySlice';

import useAuth from './useAuth';
import { toast } from 'sonner';

const useCompany = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const companyState = useSelector((state) => state.company);
  const { getCurrentUser } = useAuth();

 const getCompany = async (name) => {
  if (!name?.trim()) {
    toast.error('Enter a company name');
    return;
  }

  if (!user?._id) {
    toast.error('Please login first');
    getCurrentUser();
    return;
  }

  dispatch(clearCompany()); // 🔥 FIX

  await dispatch(fetchCompany({ name: name.trim(), userId: user._id }));
  dispatch(fetchCompanies());
};

  

  return {
    company: companyState.company,
    loading: companyState.loading,
    error: companyState.error,
    credits: companyState.credits,
    getCompany,
    userId: user?._id,
  };
};

export default useCompany;

