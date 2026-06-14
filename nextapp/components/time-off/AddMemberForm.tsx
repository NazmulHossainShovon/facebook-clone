'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../app/lib/api-client';
import TeamSelector from './TeamSelector';
import EmployeeIdField from './EmployeeIdField';
import NameField from './NameField';
import RoleField from './RoleField';
import SubmitButton from './SubmitButton';
import MessageDisplay from './MessageDisplay';
import InformationNote from './InformationNote';

interface AddMemberFormProps {
  onSuccess?: () => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    teamId: '',
    employeeId: '',
    name: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const router = useRouter();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teamId || !formData.employeeId || !formData.name || !formData.role) {
      setMessage('All fields are required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Call backend API to add a new member to the team
      const response = await apiClient.post(`/api/time-off/teams/${formData.teamId}/members`, {
        employeeId: formData.employeeId,
        name: formData.name,
        role: formData.role,
        leaveDates: [] // Start with empty leave dates array
      });
      
      if (response.status === 200 || response.status === 201) {
        setMessage('Team member added successfully!');
        setMessageType('success');
        
        // Reset the form
        setFormData({
          teamId: '',
          employeeId: '',
          name: '',
          role: ''
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          // Optionally redirect or stay on the page
          // setTimeout(() => {
          //   router.push('/time-off-simulator'); // Redirect to time-off simulator page
          // }, 1500);
        }
      } else {
        setMessage(response.data.msg || 'Failed to add team member');
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.msg || 'An error occurred while adding the team member');
      setMessageType('error');
      console.error('Error adding team member:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TeamSelector 
        teamId={formData.teamId} 
        onChange={(value) => handleChange('teamId', value)} 
      />
      
      <EmployeeIdField 
        employeeId={formData.employeeId} 
        onChange={(value) => handleChange('employeeId', value)} 
      />
      
      <NameField 
        name={formData.name} 
        onChange={(value) => handleChange('name', value)} 
      />
      
      <RoleField 
        role={formData.role} 
        onChange={(value) => handleChange('role', value)} 
      />
      
      <SubmitButton loading={loading} />
      
      <MessageDisplay message={message} type={messageType} />
      <InformationNote />
    </form>
  );
};

export default AddMemberForm;