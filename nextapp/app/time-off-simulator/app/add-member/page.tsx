'use client';

import AddMemberForm from 'components/time-off/AddMemberForm';
import React from 'react';

const AddMember = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Team Member</h1>

      <AddMemberForm />
    </div>
  );
};

export default AddMember;
