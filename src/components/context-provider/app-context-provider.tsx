import React from "react";
import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import mondaySdk from "monday-sdk-js";
import { AppContextType } from "@/types/context-type";
import { DecodedSessionTokenType } from "@/types/session-token-types"; 
import { executeMondayApiCall, MondayApiResponse } from "@/helpers/monday-api-helpers";

const monday = mondaySdk();

interface GraphQLMeQueryType {
  data: {
    me: {
      id: number;
      name: string;
      photo_thumb_small: string;
      photo_original: string;
    }
  }
}

async function getAppContext(): Promise<AppContextType | undefined> { 
  const sessionToken = await monday.get("sessionToken");

  const decodedToken: DecodedSessionTokenType = jwt_decode(sessionToken.data);

  const currentContext = await monday.get('context');

  const userProfileFromApi = await executeMondayApiCall('query { me { photo_original photo_thumb_small}}', {});

  if (sessionToken && currentContext && userProfileFromApi?.is_success) {
    const {photo_original, photo_thumb_small} = userProfileFromApi?.data.me;
    return { 
      userId: currentContext.data.user.id,
      accountId: currentContext.data.account.id,
      appId: currentContext.accountId,
      instanceId: currentContext.instanceId,
      slug: decodedToken.dat.slug,
      sessionToken: sessionToken.data,
      iframeContext: currentContext.data,
      userProfilePhoto: {photo_original, photo_thumb_small}
    };
  } else {
    return ;
  }
};

export const AppContext = createContext<AppContextType | undefined>({});

export const AppContextProvider = ({ children }: { children: JSX.Element }) => {
  const [appContext, setAppContext] = useState<AppContextType>();
  
  useEffect(() => {
    if (!appContext?.sessionToken) {
      getAppContext()
        .then((context: AppContextType | undefined) => {
          setAppContext(context);
        })
        .catch((err: any) => {
          console.log("error:", err);
        });
    }
  }, [appContext]);

  return (
    <AppContext.Provider value={appContext}>
      {children}
    </AppContext.Provider>
  );
};
