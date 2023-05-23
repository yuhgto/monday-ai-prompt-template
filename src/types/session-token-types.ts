export interface GetSessionTokenType {
  method: string;
  type: string;
  data: string;
  requestId: string;
}

export interface DecodedSessionTokenType {
    dat: {
      account_id: number;
      app_id: number;
      app_version_id: number;
      client_id: string;
      install_id: number;
      is_admin: boolean;
      is_guest: boolean;
      is_view_only: boolean;
      slug: string;
      user_id: number;
      user_kind: string;
    };
    exp: number;
  };

