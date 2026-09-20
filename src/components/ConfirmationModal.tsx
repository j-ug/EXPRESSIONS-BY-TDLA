import React, { useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-4 text-sm text-gray-600">Type <span className="font-bold">DELETE</span> to confirm.</p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="DELETE"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            onClick={() => {
              console.log('Delete button clicked, text:', text);
              if (text === 'DELETE') {
                onConfirm();
                onClose();
              } else {
                console.log('Confirmation failed: text is not "DELETE"');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
