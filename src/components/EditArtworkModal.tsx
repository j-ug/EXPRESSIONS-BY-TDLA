import React, { useState } from 'react';
import { BotanicalArtwork } from '../types';
import { updateArtwork } from '../lib/artworks';

interface EditArtworkModalProps {
  artwork: BotanicalArtwork;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditArtworkModal: React.FC<EditArtworkModalProps> = ({ artwork, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<BotanicalArtwork>(artwork);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateArtwork(formData.id, formData);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Artwork</h2>
        <input name="title" value={formData.title} onChange={handleChange} className="w-full mb-2 p-2 border" placeholder="Title" />
        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full mb-2 p-2 border" placeholder="Description" />
        <input name="price" value={formData.price || ''} onChange={handleChange} className="w-full mb-2 p-2 border" placeholder="Price" />
        <input name="inspiration" value={formData.inspiration} onChange={handleChange} className="w-full mb-2 p-2 border" placeholder="Inspiration" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  );
};
