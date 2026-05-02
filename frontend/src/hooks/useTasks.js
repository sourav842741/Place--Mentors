import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasks,
  fetchTaskStats,
  selectAllTasks,
  selectTasksStats,
  selectTasksStatus,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  shareTask,
} from "../redux/tasksSlice";

const useTasks = () => {
  const dispatch = useDispatch();

  const tasks = useSelector(selectAllTasks);
  const stats = useSelector(selectTasksStats);
  const status = useSelector(selectTasksStatus);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTaskStats());
  }, [dispatch]);

  const createNewTask = (taskData) => dispatch(createTask(taskData));
  const updateExistingTask = (id, taskData) => dispatch(updateTask({ id, ...taskData }));
  const removeTask = (id) => dispatch(deleteTask(id));
  const toggleTaskStatus = (id) => dispatch(toggleTask(id));
  const shareExistingTask = (id) => dispatch(shareTask(id));

  const refetchTasks = () => dispatch(fetchTasks());
  const refetchStats = () => dispatch(fetchTaskStats());

  return {
    tasks,
    stats,
    status,
    createTask: createNewTask,
    updateTask: updateExistingTask,
    deleteTask: removeTask,
    toggleTask: toggleTaskStatus,
    shareTask: shareExistingTask,
    refetchTasks,
    refetchStats,
    isLoading: status === "loading",
  };
};

export default useTasks;
