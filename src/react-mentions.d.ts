declare module "react-mentions" {
  import * as React from "react";

  export interface MentionItem {
    id: string | number;
    display: string;
    [key: string]: any;
  }

  export interface SuggestionDataItem {
    id: string | number;
    display: string;
    [key: string]: any;
  }

  export interface MentionsInputProps {
    value: string;
    onChange: (
      event: { target: { value: string } },
      newValue: string,
      newPlainTextValue: string,
      mentions: MentionItem[]
    ) => void;
    placeholder?: string;
    markup?: string;
    singleLine?: boolean;
    allowSuggestionsAboveCursor?: boolean;
    children?: React.ReactNode;
    style?: any;
    className?: string;
    suggestionsPortalHost?: Element;
    inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
    allowSpaceInQuery?: boolean;
    [key: string]: any;
  }

  export interface MentionProps {
    trigger: string | RegExp;
    data:
      | MentionItem[]
      | ((search: string, callback: (data: MentionItem[]) => void) => void);
    markup?: string;
    regex?: RegExp;
    displayTransform?: (id: string | number, display: string) => string;
    renderSuggestion?: (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focused: boolean
    ) => React.ReactNode;
    onAdd?: (id: string | number, display: string) => void;
    appendSpaceOnAdd?: boolean;
    isLoading?: boolean;
    [key: string]: any;
  }

  export class MentionsInput extends React.Component<MentionsInputProps> {}
  export class Mention extends React.Component<MentionProps> {}
}