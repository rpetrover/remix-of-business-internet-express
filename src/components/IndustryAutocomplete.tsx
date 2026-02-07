import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const INDUSTRIES = [
  'Accounting & Tax Services',
  'Advertising & Marketing',
  'Agriculture & Farming',
  'Architecture & Design',
  'Automotive Sales & Repair',
  'Banking & Financial Services',
  'Bar / Nightclub',
  'Beauty Salon / Spa',
  'Biotech & Pharmaceuticals',
  'Construction & Contracting',
  'Consulting Services',
  'Dental Practice',
  'E-Commerce & Online Retail',
  'Education & Training',
  'Engineering Services',
  'Entertainment & Events',
  'Fitness & Gym',
  'Food & Beverage Manufacturing',
  'Government & Public Sector',
  'Healthcare & Medical Practice',
  'Hospitality & Hotels',
  'Insurance Services',
  'IT & Software Development',
  'Law Practice & Legal Services',
  'Logistics & Shipping',
  'Manufacturing & Industrial',
  'Media & Publishing',
  'Nonprofit & Charity',
  'Oil & Gas / Energy',
  'Pet Services & Veterinary',
  'Photography & Videography',
  'Property Management',
  'Real Estate',
  'Restaurant / Café',
  'Retail Store',
  'Security Services',
  'Staffing & Recruitment',
  'Telecommunications',
  'Transportation & Trucking',
  'Travel & Tourism',
  'Veterinary Services',
  'Warehouse & Distribution',
  'Wholesale & Distribution',
];

interface IndustryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

const IndustryAutocomplete = ({ value, onChange, className, id }: IndustryAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredIndustries, setFilteredIndustries] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length > 0) {
      const query = value.toLowerCase();
      const matches = INDUSTRIES.filter(ind => ind.toLowerCase().includes(query));
      setFilteredIndustries(matches.slice(0, 8));
      setIsOpen(matches.length > 0);
    } else {
      setFilteredIndustries([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (industry: string) => {
    onChange(industry);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (value.trim().length > 0 && filteredIndustries.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder="Start typing (e.g. Restaurant, Retail, Law...)"
        className={className}
        autoComplete="off"
        maxLength={100}
      />
      {isOpen && filteredIndustries.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredIndustries.map((industry) => (
            <button
              key={industry}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => handleSelect(industry)}
            >
              {industry}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndustryAutocomplete;
