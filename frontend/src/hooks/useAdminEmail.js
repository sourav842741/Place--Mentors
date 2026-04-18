import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmailStats,
  fetchEmailLogs,
  sendSingleEmail as sendSingleThunk,
  sendBulkEmail as sendBulkThunk,
  testTemplate as testTemplateThunk
} from '../redux/slices/emailAdminSlice';
import { clearError, clearSendResult } from '../redux/slices/emailAdminSlice';

export const useAdminEmail = () => {
  const dispatch = useDispatch();
  const {
    stats,
    logs,
    loading,
    error,
    sending,
    sendResult
  } = useSelector((state) => state.emailAdmin);

  const fetchStats = () => dispatch(fetchEmailStats());
  const fetchLogs = (params) => dispatch(fetchEmailLogs(params));
  const sendSingle = (data) => dispatch(sendSingleThunk(data));
  const sendBulk = (data) => dispatch(sendBulkThunk(data));
  const testTemplateEmail = (data) => dispatch(testTemplateThunk(data));

  const clearErrors = () => dispatch(clearError());
  const clearSendResults = () => dispatch(clearSendResult());

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    logs,
    loading,
    error,
    sending,
    sendResult,
    fetchStats,
    fetchLogs,
    sendSingle,
    sendBulk,
    testTemplateEmail,
    clearErrors,
    clearSendResults
  };
};

