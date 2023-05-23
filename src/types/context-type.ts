export interface AppContextType {
  userId?: number;
  accountId?: number;
  appId?: number;
  instanceId?: number;
  sessionToken?: string;
  iframeContext?: MondayContext;
  slug?: string;
  userProfilePhoto?: {
    photo_original: string;
    photo_thumb_small: string;
  };
}

interface MondayContext {
  theme: string;
  account: Account;
  user: User;
  region: string;
  app: App;
  appVersion: AppVersion;
  boardIds?: number[] | null;
  boardId?: number;
  widgetId: number;
  viewMode: string;
  editMode: boolean;
  instanceId: number;
  instanceType: string;
}

interface Account {
  id: string;
}

interface User {
  id: string;
  isAdmin: boolean;
  isGuest: boolean;
  isViewOnly: boolean;
  countryCode: string;
  currentLanguage: string;
  timeFormat: string;
  timeZoneOffset: number;
}

interface App {
  id: number;
  clientId: string;
}

interface AppVersion {
  id: number;
  name: string;
  status: string;
  type: string;
  versionData: VersionData;
}

interface VersionData {
  major: number;
  minor: number;
  patch: number;
  type: string;
}
