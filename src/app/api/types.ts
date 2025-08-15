export type IssueAction = {
  id: string;
  label: string;
  args?: Record<string, any>;
};

export type Issue = {
  id: number | string;
  summary?: string;
  message?: string;
  logContext?: string[];
  actions?: IssueAction[];
  severity?: "info" | "warn" | "error";
  createdAt?: string;
};
