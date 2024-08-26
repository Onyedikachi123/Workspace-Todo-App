"use client";
import { useState, useEffect } from "react";
import { TodoTypes } from "../types/todoTypes";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: TodoTypes | null;
  onSave: (text: string, id?: number) => void; 
}


export default function Modal({ isOpen, onClose, todo, onSave }: ModalProps) {
  const [text, setText] = useState(todo?.text || "");

  useEffect(() => {
    if (todo) {
      setText(todo.text);
    } else {
      setText("");
    }
  }, [todo]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (text.trim() !== "") {
      onSave(text, todo?.id); // Pass only text and id
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-xl text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4"> {todo ? "Update Todo" : "Add Todo"}</h2>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-4"
          placeholder="Todo text"
        />
        <button
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          onClick={handleSubmit}
        >
          {todo ? "Update" : "Add"}
        </button>
        <button
          className="w-full py-2 mt-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-300"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

