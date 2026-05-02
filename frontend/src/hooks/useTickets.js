import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyTickets,
  fetchTicketDetail,
  createNewTicket,
  replyTicket,
  reopenUserTicket,
  fetchAllTickets,
  fetchTicketStats,
  updateAdminTicketStatus,
  deleteAdminTicket,
  clearTicketDetail,
  updateTicketFromSocket,
  removeTicketFromSocket,
} from "../redux/ticketSlice";
import { socket } from "../socket";

export const useTickets = () => {
  const dispatch = useDispatch();
  const {
    tickets,
    ticketDetail,
    replies,
    internalNotes,
    stats,
    loading,
    detailLoading,
    actionLoading,
    error,
    pagination,
  } = useSelector((state) => state.tickets);

  const loadMyTickets = useCallback((params = {}) => dispatch(fetchMyTickets(params)), [dispatch]);
  const loadTicketDetail = useCallback((id) => dispatch(fetchTicketDetail(id)), [dispatch]);
  const createTicket = useCallback((formData) => dispatch(createNewTicket(formData)), [dispatch]);
  const addReply = useCallback(
    (id, message, isInternal = false) => dispatch(replyTicket({ id, message, isInternal })),
    [dispatch]
  );
  const reopenTicket = useCallback((id) => dispatch(reopenUserTicket(id)), [dispatch]);
  const resetTicketDetail = useCallback(() => dispatch(clearTicketDetail()), [dispatch]);

  // Socket listener for real-time ticket updates
  useEffect(() => {
    const handleTicketUpdate = (data) => {
      dispatch(updateTicketFromSocket(data));
    };

    const handleTicketDelete = (data) => {
      dispatch(removeTicketFromSocket(data));
    };

    socket.on("ticket:updated", handleTicketUpdate);
    socket.on("ticket:deleted", handleTicketDelete);

    return () => {
      socket.off("ticket:updated", handleTicketUpdate);
      socket.off("ticket:deleted", handleTicketDelete);
    };
  }, [dispatch]);

  return {
    tickets,
    ticketDetail,
    replies,
    internalNotes,
    stats,
    loading,
    detailLoading,
    actionLoading,
    error,
    pagination,
    loadMyTickets,
    loadTicketDetail,
    createTicket,
    addReply,
    reopenTicket,
    resetTicketDetail,
  };
};

export const useAdminTickets = () => {
  const dispatch = useDispatch();
  const {
    tickets,
    ticketDetail,
    replies,
    internalNotes,
    stats,
    loading,
    detailLoading,
    actionLoading,
    error,
    pagination,
  } = useSelector((state) => state.tickets);

  const loadAllTickets = useCallback(
    (params = {}) => dispatch(fetchAllTickets(params)),
    [dispatch]
  );

  const loadTicketStats = useCallback(() => dispatch(fetchTicketStats()), [dispatch]);

  const loadTicketDetail = useCallback((id) => dispatch(fetchTicketDetail(id)), [dispatch]);

  const changeStatus = useCallback(
    (id, status) => dispatch(updateAdminTicketStatus({ id, status })),
    [dispatch]
  );

  const removeTicket = useCallback((id) => dispatch(deleteAdminTicket(id)), [dispatch]);

  const addReply = useCallback(
    (id, message, isInternal = false) => dispatch(replyTicket({ id, message, isInternal })),
    [dispatch]
  );

  const resetTicketDetail = useCallback(() => dispatch(clearTicketDetail()), [dispatch]);

  // Socket listener for real-time ticket updates
  useEffect(() => {
    const handleTicketUpdate = (data) => {
      dispatch(updateTicketFromSocket(data));
    };

    const handleTicketDelete = (data) => {
      dispatch(removeTicketFromSocket(data));
    };

    socket.on("ticket:updated", handleTicketUpdate);
    socket.on("ticket:deleted", handleTicketDelete);

    return () => {
      socket.off("ticket:updated", handleTicketUpdate);
      socket.off("ticket:deleted", handleTicketDelete);
    };
  }, [dispatch]);

  return {
    tickets,
    ticketDetail,
    replies,
    internalNotes,
    stats,
    loading,
    detailLoading,
    actionLoading,
    error,
    pagination,
    loadAllTickets,
    loadTicketStats,
    loadTicketDetail,
    changeStatus,
    removeTicket,
    addReply,
    resetTicketDetail,
  };
};

export default useTickets;
