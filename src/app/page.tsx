"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { pusherClient } from "./utils/pusherClient";
import Modal from "../components/modal";
import jwt from "jsonwebtoken";
import { TodoTypes } from "../types/todoTypes";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token || ""); // Provide a fallback value
  const router = useRouter();
  const [todos, setTodos] = useState<TodoTypes[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<TodoTypes | null>(null);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout(); // Clear authentication state
    router.push("/login"); // Redirect to login page after logging out
  };

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch("/api/todos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTodos(data.todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Failed to fetch todos. Please try again later.");
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      const decodedToken: any = jwt.decode(token);
      setUsername(decodedToken?.username);

      // Fetch initial todos for the authenticated user
      fetchTodos();
    }
  }, [isAuthenticated, router, token]);

  useEffect(() => {
    if (isAuthenticated) {
      const channel = pusherClient.subscribe("todo-channel");

      const handlePusherError = (error: Error) => {
        console.error("Pusher error:", error);
        setError("Real-time updates failed. Please refresh the page.");
      };

      channel.bind("create-todo", (data: TodoTypes) => {
        if (data.creator === username) {
          setTodos((prevTodos) => [...prevTodos, data]);
        }
      });

      channel.bind("update-todo", (data: TodoTypes) => {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === data.id
              ? {
                  ...todo,
                  text: data.text,
                  status: data.status,
                  markedBy: data.markedBy,
                }
              : todo
          )
        );
      });

      channel.bind("delete-todo", (data: { id: number }) => {
        setTodos((prevTodos) =>
          prevTodos.filter((todo) => todo.id !== data.id)
        );
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [isAuthenticated, username]);

  const handleCreateOrUpdateTodo = async (text: string, id?: number) => {
    const todoData = {
      text,
      status: false,
      id: id || todos.length + 1,
      creator: username,
    };

    const event = id ? "update-todo" : "create-todo";

    try {
      await fetch("/api/pusher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: "todo-channel",
          event,
          data: todoData,
        }),
      });
    } catch (error) {
      console.error("Error sending todo update:", error);
      setError("Failed to update todo. Please try again later.");
    }
  };

  const openUpdateModal = (todo: TodoTypes) => {
    setCurrentTodo(todo);
    setShowModal(true);
  };

  const handleMarkAsDone = async (id: number) => {
    const updatedTodo = todos.find((todo) => todo.id === id);

    if (updatedTodo) {
      updatedTodo.status = !updatedTodo.status;
      updatedTodo.markedBy = username;

      try {
        await fetch("/api/pusher", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            channel: "todo-channel",
            event: "update-todo",
            data: updatedTodo,
          }),
        });
      } catch (error) {
        console.error("Error updating todo status:", error);
        setError("Failed to update todo status. Please try again later.");
      }
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch("/api/pusher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: "todo-channel",
          event: "delete-todo",
          data: { id },
        }),
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Failed to delete todo. Please try again later.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      
    
      
      <h1 className="text-3xl font-bold text-center text-gray-800">Todo App</h1>
      <div className="mt-6 w-full max-w-4xl mx-auto">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white p-4 mb-4 rounded-lg shadow-sm flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl text-gray-800">{todo.text}</h2>
                <p className="text-sm text-gray-600">
                  Created by: {todo.creator}
                </p>
                {todo.status && (
                  <p className="text-sm text-gray-600">
                    Marked as done by: {todo.markedBy}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={todo.status}
                  onChange={() => handleMarkAsDone(todo.id)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <svg
                  onClick={() => deleteTodo(todo.id)}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.06.68-.114 1.022-.165m-.654.261L5.84 19.673A2.25 2.25 0 0 0 8.084 21.75h7.832a2.25 2.25 0 0 0 2.244-2.077L19.228 5.79M9.348 4.232l.26-1.665a1.125 1.125 0 0 1 1.11-.942h2.564a1.125 1.125 0 0 1 1.11.942l.26 1.665M9.348 4.232a48.474 48.474 0 0 1 5.304 0"
                  />
                </svg>
                <svg
                  onClick={() => openUpdateModal(todo)}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.121 2.121 0 1 1 3 3L7.5 18.75l-4.5 1.5 1.5-4.5 12.362-12.363Z"
                  />
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No todos found. Add some!</p>
          </div>
        )}
      </div>
      <button
          onClick={handleLogout}
          className=" py-2 px-5 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 fixed bottom-6 right-24"
        >
          Log Out
        </button>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
      >
        +
      </button>
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleCreateOrUpdateTodo}
          todo={currentTodo}
        />
      )}
    </main>
  );
}
