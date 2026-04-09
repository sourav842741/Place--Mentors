
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompany, clearCompany, fetchCompanies } from '../redux/companySlice';
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
      return null;
    }

    if (!user?._id) {
      toast.error('Please login first');
      await getCurrentUser();
      return null;
    }

    dispatch(clearCompany());

    try {
      const res = await dispatch(
        fetchCompany({ name: name.trim(), userId: user._id })
      );

      // 🔥 ERROR HANDLE
    if (res?.error) {
  let message = "Something went wrong";

  if (typeof res.payload === "string") {
    message = res.payload;
  } else if (res.payload?.message) {
    message = res.payload.message;
  } else if (res.payload?.error) {
    message = res.payload.error;
  } else if (res.error?.message) {
    message = res.error.message;
  }

  toast.error(message);
  return null;
}

      // 🔥 SUCCESS RETURN
      const data = res.payload;

      dispatch(fetchCompanies());

      return data;

    } catch (err) {
      toast.error(err?.message || "Failed to fetch company");
      return null;
    }
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

