import { MentionsInput, Mention } from "react-mentions";
import type { SuggestionDataItem } from "react-mentions";
import * as React from "react";

/*   TYPES   */

interface TemplateValue {
  subject: string;
  body: string;
  channel: string;
}

interface Props {
  value: TemplateValue;
  onChange: (value: TemplateValue) => void;
  customers?: any[]; // Optional, for future use
}

interface MergeTag {
  id: string;
  display: string;
}

/*   MERGE TAGS   */

const MERGE_TAGS: MergeTag[] = [
  { id: "name", display: "Name" },
  { id: "email", display: "Email" },
  { id: "phone", display: "Phone Number" },
];

/*   HELPERS   */

const convertMentionsToTemplate = (text: string) => {
  let output = text;

  MERGE_TAGS.forEach((tag) => {
    const regex = new RegExp(
      `@\\[${tag.display}\\]\\(${tag.id}\\)`,
      "g"
    );
    output = output.replace(regex, `{{${tag.id}}}`);
  });

  return output;
};

const previewText = (text: string) => {
  return text
    .replace(/@\[Name\]\(name\)/g, "John Doe")
    .replace(
      /@\[Email\]\(email\)/g,
      "john.doe@example.com"
    )
    .replace(
      /@\[Phone Number\]\(phone\)/g,
      "+91 98765 43210"
    );
};

/*   STYLES   */

const mentionsStyle = {
  control: {
    fontSize: 14,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },

  "&multiLine": {
    control: {
      minHeight: 120,
    },
    highlighter: {
      padding: 10,
      fontSize: 14,
      lineHeight: "1.6",
    },
    input: {
      padding: 10,
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      fontSize: 14,
      lineHeight: "1.6",
    },
  },

  "&singleLine": {
    highlighter: {
      padding: 10,
      border: "1px solid transparent",
    },
    input: {
      padding: 10,
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      fontSize: 14,
    },
  },

  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      maxHeight: 160,
      overflowY: "auto" as const,
      zIndex: 100,
    },
    item: {
      padding: "8px 12px",
      cursor: "pointer",
      "&focused": {
        backgroundColor: "#f1f5f9",
      },
    },
  },
};

/*   COMPONENT   */

const CampaignTemplateEditor = ({
  value,
  onChange,
  customers,
}: Props) => {
  /*   HANDLERS   */

  const handleSubjectChange = (
    _event: any,
    newValue: string
  ) => {
    onChange({
      ...value,
      subject: newValue,
    });
  };

  const handleBodyChange = (
    _event: any,
    newValue: string
  ) => {
    onChange({
      ...value,
      body: newValue,
    });
  };

  /*   UI   */

  return (
    <div className="space-y-6">
      {/* ===== SUBJECT WITH @ TAGS ===== */}
      <div>
        <label className="text-sm font-medium">
          Subject
        </label>

        <MentionsInput
          value={value.subject}
          onChange={handleSubjectChange}
          placeholder="Type subject... use @ for tags"
          style={mentionsStyle}
          markup="@[__display__](__id__)"
          singleLine
        >
          <Mention
            trigger="@"
            data={MERGE_TAGS}
            markup="@[__display__](__id__)"
            displayTransform={(id: string | number, display: string) =>
              `@${display}`
            }
            renderSuggestion={(
              suggestion: SuggestionDataItem,
              search: string,
              highlightedDisplay: React.ReactNode,
              index: number,
              focused: boolean
            ) => (
              <div className="flex gap-2 items-center">
                <span className="font-mono text-blue-600">
                  @
                </span>
                <span>{highlightedDisplay}</span>
              </div>
            )}
          />
        </MentionsInput>

        <p className="text-xs text-slate-500 mt-1">
          Type <b>@</b> to insert merge tags
        </p>
      </div>

      {/*  BODY WITH @ TAGS  */}
      <div>
        <label className="text-sm font-medium">
          Message Body
        </label>

        <MentionsInput
          value={value.body}
          onChange={handleBodyChange}
          placeholder="Type message... use @ for tags"
          style={mentionsStyle}
          markup="@[__display__](__id__)"
        >
          <Mention
            trigger="@"
            data={MERGE_TAGS}
            markup="@[__display__](__id__)"
            displayTransform={(id: string | number, display: string) =>
              `@${display}`
            }
            renderSuggestion={(
              suggestion: SuggestionDataItem,
              search: string,
              highlightedDisplay: React.ReactNode,
              index: number,
              focused: boolean
            ) => (
              <div className="flex gap-2 items-center">
                <span className="font-mono text-blue-600">
                  @
                </span>
                <span>{highlightedDisplay}</span>
              </div>
            )}
          />
        </MentionsInput>

        <p className="text-xs text-slate-500 mt-1">
          Type <b>@</b> to insert merge tags
        </p>
      </div>

      {/*  PREVIEW  */}
      <div>
        <label className="text-sm font-medium">
          Preview
        </label>

        <div className="mt-2 p-4 bg-slate-50 border rounded-lg text-sm whitespace-pre-wrap">
          <strong>Subject:</strong>{" "}
          {previewText(value.subject) || "-"}
          <br />
          <br />
          <strong>Message:</strong>
          <br />
          {previewText(value.body) ||
            "Your message preview will appear here..."}
        </div>
      </div>

      {/* ===== FINAL TEMPLATE (DEBUG) ===== */}
      {/* <div className="text-xs text-slate-500">
        <strong>Final payload sent to backend:</strong>
        <pre className="mt-1 bg-slate-100 p-2 rounded overflow-x-auto">
{JSON.stringify(
  {
    subject: convertMentionsToTemplate(
      value.subject
    ),
    body: convertMentionsToTemplate(value.body),
  },
  null,
  2
)}
        </pre>
      </div> */}
    </div>
  );
};

export default CampaignTemplateEditor;