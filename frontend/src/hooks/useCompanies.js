import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanies } from '../redux/companySlice';
import { useEffect } from 'react';

const useCompanies = () => {
  const dispatch = useDispatch();
  const companies = useSelector((state) => state.company.companies || []);
  const loading = useSelector((state) => state.company.companiesLoading || false);
  const error = useSelector((state) => state.company.companiesError);

  const getCompanies = () => {
    dispatch(fetchCompanies());
  };

  useEffect(() => {
    if (companies.length === 0 && !loading) {
      getCompanies();
    }
  }, [companies.length, loading]);

  return {
    companies,
    loading,
    error,
    getCompanies,
    refetch: getCompanies
  };
};

export default useCompanies;

