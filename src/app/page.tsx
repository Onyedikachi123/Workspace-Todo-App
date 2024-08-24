"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { pusherClient } from "./utils/pusherClient";
import Modal from "../components/modal";
import jwt from 'jsonwebtoken';
import {TodoTypes }  from "../types/todoTypes";

// interface TodoTypes {
//   text: string;
//   status: boolean;
//   id: number;
//   creator: string;
//   markedBy?: string;
// }

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [todos, setTodos] = useState<TodoTypes[]>([
    { id: 1, text: "Buy groceries", status: false, creator: "DefaultUser" },
    { id: 2, text: "Complete project", status: false, creator: "DefaultUser" },
    { id: 3, text: "Read a book", status: false, creator: "DefaultUser" },
    { id: 4, text: "Exercise", status: false, creator: "DefaultUser" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<TodoTypes | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const channel = pusherClient.subscribe("todo-channel");

      channel.bind("create-todo", (data: TodoTypes) => {
        setTodos((prevTodos) => [...prevTodos, data]);
      });

      channel.bind("update-todo", (data: TodoTypes) => {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === data.id
              ? { ...todo, text: data.text, status: data.status, markedBy: data.markedBy }
              : todo
          )
        );
      });

      channel.bind("delete-todo", (data: { id: number }) => {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== data.id));
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [isAuthenticated]);

  const handleCreateOrUpdateTodo = async (text: string, creator: string, id?: number) => {
    if (id) {
      const updatedTodo = { text, status: false, id, creator };
      await fetch("/api/pusher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PUSHER_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          channel: "todo-channel",
          event: "update-todo",
          data: updatedTodo,
        }),
      });
    } else {
      const newTodo: TodoTypes = {
        text,
        status: false,
        id: todos.length + 1,
        creator,
      };

      await fetch("/api/pusher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PUSHER_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          channel: "todo-channel",
          event: "create-todo",
          data: newTodo,
        }),
      });
    }
  };

  const openUpdateModal = (todo: TodoTypes) => {
    setCurrentTodo(todo);
    setShowModal(true);
  };

  const handleMarkAsDone = async (id: number) => {
    const token = process.env.NEXT_PUBLIC_PUSHER_AUTH_TOKEN;
    const updatedTodo = todos.find((todo) => todo.id === id);

    if (updatedTodo && token) {
      updatedTodo.status = !updatedTodo.status;

      try {
        const decodedToken: any = jwt.decode(token);
        const markedBy = decodedToken?.username || "Anonymous";

        updatedTodo.markedBy = markedBy;

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
        console.error("Error marking todo as done:", error);
      }
    }
  };

  const deleteTodo = async (id: number) => {
    await fetch("/api/pusher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PUSHER_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        channel: "todo-channel",
        event: "delete-todo",
        data: { id },
      }),
    });
  };

  if (!isAuthenticated) {
    return null; // Optionally, you could return a loading spinner here.
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
                <p className="text-sm text-gray-600">Created by: {todo.creator}</p>
                {todo.status && (
                  <p className="text-sm text-gray-600">Marked as done by: {todo.markedBy}</p>
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
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
      >
        Add Todo
      </button>
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          todo={currentTodo}
          onSubmit={handleCreateOrUpdateTodo}
        />
      )}
    </main>
  );
}
