import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface Guide {
  id: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  skills: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    status: 'valid' | 'expired' | 'expiring-soon';
  }>;
  maxDailyHours: number;
  status: 'active' | 'inactive' | 'on-leave';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: string;
  dateOfBirth: string;
  hireDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
    languages: guide?.languages || [],
    skills: guide?.skills || [],
    maxDailyHours: guide?.maxDailyHours || 8,
    status: guide?.status || 'active',
    emergencyContact: guide?.emergencyContact || { name: '', phone: '', relationship: '' },
    address: guide?.address || '',
    dateOfBirth: guide?.dateOfBirth || '',
    hireDate: guide?.hireDate || '',
    notes: guide?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (guide && mode === 'edit') {
      setFormData({
        name: guide.name,
        email: guide.email,
        phone: guide.phone,
        languages: guide.languages,
        skills: guide.skills,
        maxDailyHours: guide.maxDailyHours,
        status: guide.status,
        emergencyContact: guide.emergencyContact,
        address: guide.address,
        dateOfBirth: guide.dateOfBirth,
        hireDate: guide.hireDate,
        notes: guide.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        languages: [],
        skills: [],
        maxDailyHours: 8,
        status: 'active',
        emergencyContact: { name: '', phone: '', relationship: '' },
        address: '',
        dateOfBirth: '',
        hireDate: '',
        notes: ''
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
      phone: formData.phone.trim(),
      languages: formData.languages,
      skills: formData.skills,
      certifications: [],
      maxDailyHours: formData.maxDailyHours,
      status: formData.status,
      emergencyContact: formData.emergencyContact,
      address: formData.address.trim(),
      dateOfBirth: formData.dateOfBirth,
      hireDate: formData.hireDate,
      notes: formData.notes.trim() || undefined,
      createdAt: guide?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const updateLanguage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((l, i) => i === index ? value : l)
    }));
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => i === index ? value : s)
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
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
            Languages
          </label>
          <div className="space-y-2">
            {formData.languages.map((language, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={language}
                  onChange={(e) => updateLanguage(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter language"
                />
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLanguage}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              + Add Language
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          <div className="space-y-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter skill"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              + Add Skill
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
