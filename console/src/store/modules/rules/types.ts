import { Map } from "immutable";

export interface ITime {
  hours: number;
  minutes: number;
}

export interface IScheduleItem {
  timeFrom: ITime;
  timeTo: ITime;

  /** tz time zone name e.g. Europe/Berlin */
  timezone: string;

  /** 0 = Sunday, 1 = Monday,.. */
  activeDays: boolean[];
  index?: number;
}

export interface ICondition {
  and_or: boolean;
  target: number;
  variable: string;
  condition: string;
}

export interface IWebhookAction {
  type: "webhook";
  params: {
    headers: {
      "content-type": string;
    };
    method: string;
    body: string;
    url: string;
  };
}

export interface IEmailAction {
  type: "email";
  params: {
    recipients: string[];
    subject: string;
    body: string;
  };
}

export interface IAlertAction {
  type: "alert";
  params: {
    type: number;
    body: string;
  };
}

export type IAction = IWebhookAction | IEmailAction | IAlertAction;

export interface IRule {
  actions: IAction[];
  schedule: IScheduleItem[];
  active: boolean;
  conditions: ICondition[];
  and_or: boolean;
  condition: string;
  target: number;
  variable: string;
  created_at: string;
  id: string;
  name: string;
  timeout: number;
  created_manually: boolean;
}

export interface ModifyRulePayload {
  project_id: string;
  rule: IRule;
}

export type ModifyRuleAction = (payload: ModifyRulePayload) => Promise<void>;

export interface DeleteRulePayload {
  project_id: string;
  rule_id: string;
}

export interface AddRulesPayload {
  project_id: string;
  rulesList: IRule[];
}

export interface IRulesState {
  rules: Map<string, IRule>;
  rulesFilter: string;
}
