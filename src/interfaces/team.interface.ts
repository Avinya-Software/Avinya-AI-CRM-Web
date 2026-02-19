import { SelectOption } from "../components/team/Teammultiselect";
import { ComboboxOption } from "../components/ui/combobox";

// src/interfaces/team.interface.ts
export interface AddTeamModalProps {
  open: boolean;
  onClose: () => void;
  onTeamCreated: (team: ComboboxOption) => void;
  users: ComboboxOption[];
  isLoading?: boolean;
  onSave: (data: { name: string; userIds: string[] }) => void;
}

export interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onManageMembers: (team: Team) => void;
}

export interface TeamDeleteModalProps {
  open: boolean;
  team: Team | null;
  onClose: () => void;
}

export interface TeamMembersDrawerProps {
  open: boolean;
  onClose: () => void;
  team: Team | null;
  userOptions: SelectOption[];
}

export interface TeamDropdown {
  id: string;
  name: string;
}

export interface CreateTeamDto {
  name: string;
  userIds: string[];
}

export interface Team {
  id: number;
  name: string;
  isActive: boolean;
  managerId: string;
  managerName: string;
  totalMembers: number;
  createdAt: string;
}

export interface TeamMember {
  memberId: string;
  userId: string;
  userName: string;
  email?: string;
  role?: string;
  joinedAt?: string;
}

export interface CreateTeamPayload {
  name: string;
  userIds: string[];
}

export interface UpdateTeamPayload {
  name: string;
  isActive: boolean;
}

export interface AddMemberPayload {
  userId: string;
}

export interface TeamsResponse {
  statusCode: number;
  statusMessage: string;
  data: Team[];
}

export interface TeamMembersResponse {
  statusCode: number;
  statusMessage: string;
  data: TeamMember[];
}

export interface TeamMultiSelectProps {
  options: SelectOption[];
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  excludeIds?: string[];
  disabled?: boolean;
}

export interface TeamUpsertModalProps {
  open: boolean;
  onClose: () => void;
  team: Team | null; 
  userOptions: SelectOption[];
}