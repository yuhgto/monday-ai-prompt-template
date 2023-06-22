"use client"
import {useCallback, useState, useMemo} from "react";
import styles from './page.module.css'
import { AppContextProvider } from '@/components/context-provider/app-context-provider';
import dynamic from "next/dynamic";
/// Using dynamic here provides a quick & dirty solution for some 3rd party libraries that are using the browser API's which are not exist on the backend
const Button = dynamic(
    () => import("monday-ui-react-core").then((mod) => mod.Button),
    {
        loading: () => <p>Loading...</p>,
        ssr: false,
    }
);

const BasePromptLayout = dynamic(
    () => import('@/examples/basic-prompt-layout/prompt-layout'),
    {
        loading: () => <p>Loading...</p>,

        ssr: false,
    }
);
const LivestreamExampleFinal = dynamic(
    () => import('@/examples/livestream-example/final-code'),
    {
        loading: () => <p>Loading...</p>,

        ssr: false,
    }
);
const LivestreamExample = dynamic(
    () => import('@/examples/livestream-example/boilerplate'),
    {
        loading: () => <p>Loading...</p>,

        ssr: false,
    }
);
const ContextExplorerExample = dynamic(
    () => import('@/examples/context-explorer/context-explorer-example'),
    {
        loading: () => <p>Loading...</p>,

        ssr: false,
    }
);


export default function Home() {
  const  [displayedApp, setAppToDisplay] = useState('');

  const renderApp = useMemo(() => {
    switch(displayedApp){
      case 'ContextExplorerExample':
        return (<ContextExplorerExample />);
      case 'LivestreamExample':
        return (<LivestreamExampleFinal />);
      case 'BasePromptLayout':
        return (<BasePromptLayout />);
      default:
        return (
            <div>
              <table>
                <thead>
                <tr>
                  <th colSpan={3}>
                    Please click on one of the examples below.<br/>
                    note that you would have to reopen the app to return to this choice screen.
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td><Button onClick={() => renderExampleApp('ContextExplorerExample')}>Context Explorer Example</Button></td>
                </tr>
                <tr>
                  <td><Button onClick={() => renderExampleApp('LivestreamExample')}>Livestream Example</Button></td>
                </tr>
                <tr>
                  <td><Button onClick={() => renderExampleApp('BasePromptLayout')}>Base Prompt Layout</Button></td>
                </tr>
                </tbody>
              </table>
            </div>
        );
    }
  }, [displayedApp]);
  const renderExampleApp = (type= 'ContextExplorerExample') =>{
    setAppToDisplay(type);
  }
  return (
      <div className={styles.App}>
        <AppContextProvider>
          <>
            {renderApp}
          </>
        </AppContextProvider>
      </div>
  )
}


