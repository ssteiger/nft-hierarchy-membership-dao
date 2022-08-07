import React from 'react';

export default function Input({ name, placeholder, value, onChange, onSubmit, addonBefore, addonAfter }) {
  return (
    <input
      class="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      addonBefore={addonBefore}
      addonAfter={addonAfter}
    />
  );
}
