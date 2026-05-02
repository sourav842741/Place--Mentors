import { useDispatch, useSelector } from "react-redux";
import {
  fetchJobs,
  matchJobs,
  bookmarkJob,
  unbookmarkJob,
  applyJob,
  setFilters,
  fetchSingleJob,
  setSelectedJobId,
  clearSelectedJob,
} from "../redux/jobSlice";

import { selectAllJobs, selectSelectedJobId, selectSingleJob } from "../redux/jobSlice";

import { useCallback } from "react";

const useJobs = () => {
  const dispatch = useDispatch();

  const jobs = useSelector(selectAllJobs);
  const pagination = useSelector((state) => state.jobs.pagination);
  const matchedJobs = useSelector((state) => state.jobs.matchedJobs);
  const loading = useSelector((state) => state.jobs.loading);
  const filters = useSelector((state) => state.jobs.filters);

  const selectedJobId = useSelector(selectSelectedJobId);
  const singleJob = useSelector(selectSingleJob);

  const selectedJob = singleJob || jobs.find((job) => job._id === selectedJobId);

  const loadJobs = (page = 1, customFilters = {}) => {
    dispatch(fetchJobs({ page, filters: customFilters }));
  };

  const handleSearch = (searchTerm, location) => {
    dispatch(
      fetchJobs({
        page: 1,
        search: searchTerm,
        location,
        filters,
      })
    );
  };

  const getMatchedJobs = () => {
    dispatch(matchJobs());
  };

  const toggleBookmark = (jobId, isBookmarked) => {
    if (isBookmarked) {
      dispatch(unbookmarkJob(jobId));
    } else {
      dispatch(bookmarkJob(jobId));
    }
  };

  const applyToJob = (jobId, resumeUrl, coverLetter) => {
    dispatch(applyJob({ jobId, resumeUrl, coverLetter }));
  };

  const updateFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(fetchJobs({ page: 1, filters: newFilters }));
  };

  const setSelectedJob = (jobId) => {
    dispatch(setSelectedJobId(jobId));

    const existingJob = jobs.find((j) => j._id === jobId);

    if (!existingJob) {
      dispatch(fetchSingleJob(jobId));
    }
  };

  const clearJobSelection = () => {
    dispatch(clearSelectedJob());
  };

  return {
    jobs,
    pagination,
    matchedJobs,
    loading,
    filters,
    selectedJobId,
    selectedJob,
    loadJobs,
    getMatchedJobs,
    toggleBookmark,
    applyToJob,
    updateFilters,
    handleSearch,
    setSelectedJob,
    clearJobSelection,
  };
};

export default useJobs;
