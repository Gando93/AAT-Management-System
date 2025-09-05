import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface Guide {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
}

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guide: Guide) => void;
  guide?: Guide;
  mode: 'create' | 'edit';
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onSave,
  guide,
  mode
}) => {
  const [formData, setFormData] = useState({
    name: guide?.name || '',
    email: guide?.email || '',
    phone: guide?.phone || '',
    specialties: guide?.specialties || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (guide && mode === 'edit') {
      setFormData({
        name: guide.name,
        email: guide.email,
        phone: guide.phone || '',
        specialties: guide.specialties || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialties: []
      });
    }
  }, [guide, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const guideData: Guide = {
      id: guide?.id || 'guide_' + Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      specialties: formData.specialties
    };

    onSave(guideData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, '']
    }));
  };

  const updateSpecialty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.map((s, i) => i === index ? value : s)
    }));
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Guide' : 'Edit Guide'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter guide name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialties
          </label>
          <div className="space-y-2">
            {formData.specialties.map((specialty, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => updateSpecialty(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter specialty"
                />
                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecialty}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              + Add Specialty
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {mode === 'create' ? 'Create Guide' : 'Update Guide'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
