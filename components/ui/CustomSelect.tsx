'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

interface CustomSelectProps {
  options: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  icon,
  className = '',
  menuClassName = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative w-full ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full bg-surface-container-low/90 hover:bg-surface-container hover:border-primary/50 text-on-surface border rounded-xl py-2.5 px-3.5 flex items-center justify-between gap-2.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer select-none min-h-[44px] ${
          isOpen ? 'border-primary ring-2 ring-primary/20 bg-surface shadow-sm' : 'border-outline-variant/50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && (
            <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
              {icon}
            </span>
          )}
          {selectedOption?.icon && !icon && (
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
              {selectedOption.icon}
            </span>
          )}
          <span className="text-sm font-medium text-on-surface whitespace-normal leading-snug break-words">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span
          className={`material-symbols-outlined text-outline text-[20px] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Animated Dropdown Menu (Always in Front, z-[999]) */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 top-full mt-1.5 z-[999] bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto custom-scrollbar backdrop-blur-xl animate-scaleIn w-full sm:min-w-[340px] md:min-w-[400px] max-w-[95vw] ${menuClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-sm text-left transition-all duration-150 cursor-pointer my-0.5 ${
                  isSelected
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {opt.icon && (
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${
                        isSelected ? 'text-on-primary' : 'text-primary'
                      }`}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="whitespace-normal leading-snug break-words font-medium">
                      {opt.label}
                    </span>
                    {opt.sublabel && (
                      <span
                        className={`text-xs font-normal whitespace-normal leading-snug mt-0.5 ${
                          isSelected ? 'text-on-primary/80' : 'text-on-surface-variant'
                        }`}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <span className="material-symbols-outlined text-[20px] text-on-primary shrink-0 ml-2">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};