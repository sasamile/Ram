import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";

function ListTasks({ tasks, setTasks }) {
  const [todos, setTodos] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [closed, setClosed] = useState([]);

  useEffect(() => {
    const fTodos = tasks.filter((task) => task.status === "todo");
    const fInProgress = tasks.filter((task) => task.status === "inProgress");
    const fClosed = tasks.filter((task) => task.status === "closed");

    setTodos(fTodos);
    setInProgress(fInProgress);
    setClosed(fClosed);
  }, [tasks]);

  const statuses = ["todo", "inProgress"];

  return (
    <>
      <div className="flex gap-16">
        {statuses.map((status, index) => (
          <Section
            key={index}
            status={status}
            tasks={tasks}
            setTasks={setTasks}
            todos={todos}
            inProgress={inProgress}
            closed={closed}
            setTodos={setTodos}
            setInProgress={setInProgress}
            setClosed={setClosed}
          />
        ))}
      </div>
    </>
  );
}

export default ListTasks;

const Section = ({
  status,
  tasks,
  setTasks,
  todos,
  inProgress,
  closed,
  setTodos,
  setInProgress,
  setClosed,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => addItemToSection(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  let text = "Todo";
  let bg = "bg-slate-500";
  let tasksToMap = todos;

  if (status === "inProgress") {
    text = "Ram";
    bg = "bg-purple-500";
    tasksToMap = inProgress;
  }

  const totalWeight = tasksToMap.reduce(
    (acc, task) => acc + parseInt(task.peso),
    0
  );
  const remainingMemory = 8192 - totalWeight;

  const addItemToSection = (id) => {
    setTasks((prevTasks) => {
      const mTasks = prevTasks.map((t) => {
        if (t.id === id) {
          return { ...t, status };
        }
        return t;
      });

      const fTodos = mTasks.filter((task) => task.status === "todo");
      const fInProgress = mTasks.filter((task) => task.status === "inProgress");
      const fClosed = mTasks.filter((task) => task.status === "closed");

      if (status === "inProgress" && fInProgress.length >= 5) {
        toast.error("No hay suficiente memoria RAM disponible para agregar esta tarea.");
        return prevTasks;
      }

      const totalWeight = fInProgress.reduce(
        (acc, task) => acc + parseInt(task.peso),
        0
      );
      const remainingMemory = 8192 - totalWeight;

      if (
        status === "todo" &&
        remainingMemory < parseInt(mTasks.find((task) => task.id === id).peso)
      ) {
        toast.error(
          "No hay suficiente memoria RAM disponible para agregar esta tarea."
        );
        return prevTasks;
      }

      setTodos(fTodos);
      setInProgress(fInProgress);
      setClosed(fClosed);

      localStorage.setItem("tasks", JSON.stringify(mTasks));
      toast("Se Ingreso a la Ram", { icon: "👨‍💻" });

      return mTasks;
    });
  };

  return (
    <>
      <div
        ref={drop}
        className={`w-64 rounded-md p-2 ${isOver ? "bg-slate-200" : ""}`}
      >
        {status === "inProgress" && (
          <div>
            <div>Total Weight: {totalWeight}</div>
            <div>Remaining Memory: {Math.max(0, remainingMemory)}</div>
          </div>
        )}
        <Header text={text} bg={bg} count={tasksToMap.length} />

        {tasksToMap.length > 0 &&
          tasksToMap.map((task) => (
            <React.Fragment key={task.id}>
              <Task
                key={task.id}
                task={task}
                tasks={tasks}
                setTasks={setTasks}
              />
            </React.Fragment>
          ))}
      </div>
    </>
  );
};

const Header = ({ text, bg, count }) => {
  return (
    <div
      className={`${bg} flex items-center h-12 pl-4 rounded-md uppercase text-sm text-white`}
    >
      {text}
      <div className="ml-2 bg-white w-5 h-5 text-black rounded-full flex items-center justify-center">
        {count}
      </div>
    </div>
  );
};

const Task = ({ task, tasks, setTasks }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleRemove = (id) => {
    const fTasks = tasks.filter((t) => t.id !== id);

    localStorage.setItem("tasks", JSON.stringify(fTasks));
    setTasks(fTasks);

    toast("Task removed", { icon: "🤔" });
  };

  return (
    <div
      ref={drag}
      className={`relative p-4 mt-8 shadow-md rounded-md ${
        isDragging ? "opacity-25" : "opacity-100"
      } cursor-grab`}
    >
      <p>{task.name}</p>
      <div>Peso: {task.peso} MB</div>
      <button
        className="absolute bottom-1 right-1 text-red-500"
        onClick={() => handleRemove(task.id)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1"
          />
        </svg>
      </button>
    </div>
  );
};
