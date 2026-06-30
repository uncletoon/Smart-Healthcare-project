import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

const Switch = ({ checked, onChange }: SwitchProps) => {
  return (
    <div className="relative w-16 h-8">
      <label className="absolute w-full h-full rounded-full cursor-pointer bg-[#203229] border-2 border-[#28292c] overflow-hidden">
        <input 
          type="checkbox" 
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
        />
        <span className="absolute inset-0 rounded-full transition-colors duration-300 peer-checked:bg-[#d8dbe0]" />
        <span className="absolute top-1 left-1 w-[20px] h-[20px] rounded-full transition-all duration-300 
            bg-[#28292c] shadow-[inset_8px_-2px_0px_0px_#d8dbe0]
            peer-checked:translate-x-8 peer-checked:bg-[#28292c] peer-checked:shadow-none" 
        />
      </label>
    </div>
  );
}

export default Switch;
