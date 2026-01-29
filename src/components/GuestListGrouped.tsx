import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export interface GuestItem {
  name: string;
  invitedBy: string;
  isOrganiser: boolean;
  isEditable: boolean;
  bookingId: string;
  index: number;
}

interface GuestListGroupedProps {
  guests: GuestItem[];
  editingGuests: { [key: string]: string };
  organiserName?: string;
  onGuestNameChange: (bookingId: string, index: number, value: string) => void;
}

type SortField = 'name' | 'invitedBy' | 'none';
type SortDirection = 'asc' | 'desc';

interface GroupedGuests {
  organiser: GuestItem[];
  organiserGuests: GuestItem[];
  purchasers: GuestItem[];
}

export default function GuestListGrouped({
  guests,
  editingGuests,
  organiserName = 'Organiser',
  onGuestNameChange,
}: GuestListGroupedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedSections, setExpandedSections] = useState({
    organiser: true,
    organiserGuests: true,
    purchasers: true,
  });

  // Categorize and filter guests
  const { organiser, organiserGuests, purchasers } = useMemo(() => {
    const grouped: GroupedGuests = {
      organiser: [],
      organiserGuests: [],
      purchasers: [],
    };

    guests.forEach((guest) => {
      // Filter by search query
      const guestName = editingGuests[`${guest.bookingId}-${guest.index}`] || guest.name || '';
      if (searchQuery && !guestName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      // Categorize
      if (guest.isOrganiser) {
        grouped.organiser.push(guest);
      } else if (
        guest.invitedBy === organiserName ||
        guest.invitedBy.toLowerCase().includes('staff') ||
        guest.invitedBy.toLowerCase().includes('walk-in')
      ) {
        grouped.organiserGuests.push(guest);
      } else {
        grouped.purchasers.push(guest);
      }
    });

    // Sort within each group
    const sortGuests = (guestList: GuestItem[]) => {
      if (sortField === 'none') return guestList;

      return [...guestList].sort((a, b) => {
        let aValue = '';
        let bValue = '';

        if (sortField === 'name') {
          aValue = (editingGuests[`${a.bookingId}-${a.index}`] || a.name || '').toLowerCase();
          bValue = (editingGuests[`${b.bookingId}-${b.index}`] || b.name || '').toLowerCase();
        } else if (sortField === 'invitedBy') {
          aValue = a.invitedBy.toLowerCase();
          bValue = b.invitedBy.toLowerCase();
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    };

    return {
      organiser: sortGuests(grouped.organiser),
      organiserGuests: sortGuests(grouped.organiserGuests),
      purchasers: sortGuests(grouped.purchasers),
    };
  }, [guests, editingGuests, searchQuery, sortField, sortDirection, organiserName]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderGuestRow = (guest: GuestItem, idx: number, globalIdx: number) => {
    const key = `${guest.bookingId}-${guest.index}`;
    const currentValue = editingGuests[key] || '';

    return (
      <tr key={key} className="border-b border-gray-700 last:border-b-0">
        <td className="py-3 px-2 text-sm text-white">{globalIdx + 1}</td>
        <td className="py-2 px-2">
          {guest.isEditable ? (
            <input
              type="text"
              value={currentValue}
              onChange={(e) => onGuestNameChange(guest.bookingId, guest.index, e.target.value)}
              placeholder={`Guest ${globalIdx + 1} full name`}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-sm text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              style={{ borderColor: '#4A4A4A' }}
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <input
                    type="text"
                    value={currentValue}
                    disabled
                    placeholder={`Guest ${globalIdx + 1} full name`}
                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-sm text-gray-500 placeholder:text-gray-600 cursor-not-allowed"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Guest added via share link - contact them to update</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </td>
        <td className="py-3 px-2 text-sm text-gray-400">{guest.invitedBy}</td>
        <td className="py-3 px-2">
          {guest.isOrganiser && (
            <Badge variant="secondary" className="bg-amber-900 text-amber-200 hover:bg-amber-900">
              Organiser
            </Badge>
          )}
        </td>
      </tr>
    );
  };

  const renderGuestSection = (
    title: string,
    guestList: GuestItem[],
    sectionKey: keyof typeof expandedSections,
    startIdx: number
  ) => {
    if (guestList.length === 0 && !searchQuery) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionKey)} className="mb-4">
        <CollapsibleTrigger className="w-full">
          <div 
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors"
            style={{ backgroundColor: '#3A2A1F' }}
          >
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-white">{title}</h4>
              <Badge variant="secondary" style={{ backgroundColor: '#CD3E28', color: '#FFFFFF' }}>
                {guestList.length}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {guestList.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">No guests match your search</div>
          ) : (
            <div className="overflow-x-auto border border-gray-700 rounded-lg mt-2" style={{ backgroundColor: '#1F1F1F' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700" style={{ backgroundColor: '#2A2A2A' }}>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400">#</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400">Guest Name</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400">Invited By</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400">Tags</th>
                  </tr>
                </thead>
                <tbody>{guestList.map((guest, idx) => renderGuestRow(guest, idx, startIdx + idx))}</tbody>
              </table>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const totalGuests = guests.length;
  const filteredCount = organiser.length + organiserGuests.length + purchasers.length;

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search guests by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No sorting</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="invitedBy">Invited By</SelectItem>
            </SelectContent>
          </Select>
          {sortField !== 'none' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-3 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-sm text-gray-400">
          Showing {filteredCount} of {totalGuests} guests
        </div>
      )}

      {/* Guest Sections */}
      {renderGuestSection('ORGANISER', organiser, 'organiser', 0)}
      {renderGuestSection('ORGANISER GUESTS', organiserGuests, 'organiserGuests', organiser.length)}
      {renderGuestSection(
        'GUEST LIST PURCHASERS',
        purchasers,
        'purchasers',
        organiser.length + organiserGuests.length
      )}

      {/* Empty State */}
      {filteredCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'No guests match your search' : 'No guests yet'}
        </div>
      )}
    </div>
  );
}
