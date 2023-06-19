"use client"
import {useCallback, useState, useMemo} from "react";
import Image from 'next/image'
import styles from './page.module.css'
import { AppContextProvider } from '@/components/context-provider/app-context-provider';
import BasePromptLayout from '@/examples/basic-prompt-layout/prompt-layout';
import PromptWithColumnMapping from '@/examples/prompt-with-column-mapping/prompt-with-column-mapping';
import LivestreamExampleFinal from '@/examples/livestream-example/final-code';
import LivestreamExample from '@/examples/livestream-example/boilerplate';
import AiAppFooter from '@/components/ai-footer/ai-footer';
import ContextExplorerExample from '@/examples/context-explorer/context-explorer-example'
import { Button } from "monday-ui-react-core";

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


