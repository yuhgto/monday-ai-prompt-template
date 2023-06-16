import React from "react";
import { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import "./context-explorer-example.css";
//Explore more Monday React Components here: https://style.monday.com/
import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();

function addControllerButtons(context) {
  let controllersDiv = [];
  function addControl(dom) {
    controllersDiv.push(dom);
    controllersDiv.push(<br />);
  }
  function addApiButton() {
    return addControl(
      <button key="api-call"
        onClick={() => {
          monday
            .api(`query { me { name } }`)
            .then((res) => {
              console.log("api:", res);
              debugger;
              monday.execute("notice", {
                message: res?.data?.me?.name,
                type: "success", // or "error" (red), or "info" (blue)
                timeout: 10000,
              });
            })
            .catch((err) => {
              monday.execute("notice", {
                message:
                  "Add OAuth scopes me:Read to your app at the developer center",
                type: "error", // or "error" (red), or "info" (blue)
                timeout: 10000,
              });
            });
        }}
      >
        API call
      </button>
    );
  }

  function addTitle() {
    return addControl(<label key="title">Available actions:</label>);
  }

  addTitle();
  addApiButton();
  addControl(
    <button key="closeDialog"
      onClick={() => {
        monday.execute("closeDialog", {});
      }}
    >
      Close dialog
    </button>
  );
  if (context) {
    const { type: appFeatureType, name: appFeatureName } = context?.appFeature;
    const textBlockObject = text => ({
      type: "normal text",
      content: {
        deltaFormat: [
          {
            insert: `${appFeatureType} ${text} ${Date.now().toString()}`,
          },
        ],
      },
    });
    const textBlockContent = textBlockObject("content to insert").content;

  switch (appFeatureType) {
    case "AppFeatureAiBoardMainMenuHeader":
      break;
    case "AppFeatureAiItemUpdateActions":
      addControl(
        <button key="updatePostContentAction"
          onClick={() => {
            monday.execute("updatePostContentAction", {
              suggestedRephrase: "<u>Time</u> " + Date.now().toString(),
            });
          }}
        >
          updatePostContentAction
        </button>
      );
      break;
    case "AppFeatureAiDocTopBar":
      {
        addControl(
          <button key="addMultiBlocks"
            onClick={() => {
              monday
                .execute("addMultiBlocks", {
                  blocks: [
                    textBlockObject("Text to insert after last focused block"),
                  ],
                })
                .then((res) => {});
            }}
          >
            addMultiBlocks
          </button>
        );
      }
      break;
    case "AppFeatureAiDocQuickStart":
      {
        addControl(
          <button key="AppFeatureAiDocQuickStart"
            onClick={() => {
              monday
                .execute("addMultiBlocks", {
                  blocks: [
                    textBlockObject("This will be added to a new empty doc"),
                  ],
                })
                .then((res) => {});
            }}
          >
            addMultiBlocks
          </button>
        );

        const html = `${appFeatureType} <h1>Marketing Brief</h1>\n<h2>Campaign purpose</h2>\n<span>List a purpose</span></html> ${Date.now().toString()}`;

        addControl(
          <button key="addMultiBlocksFromHtml"
            onClick={() => {
              monday
                .execute("addMultiBlocksFromHtml", { html: html })
                .then((res) => {});
            }}
          >
            addMultiBlocksFromHtml
          </button>
        );
      }
      break;
    case "AppFeatureAiDocContextualMenu":
      {
        // example for getting the first focused block id
        const firstFocusedBlockId = context.focusedBlocks[0].id;

        addControl(
          <button key="addMultiBlocks"
            onClick={() => {
              monday
                .execute("addMultiBlocks", {
                  blocks: [
                    textBlockObject("Text to insert after specific block"),
                  ],
                  afterBlockId: firstFocusedBlockId,
                })
                .then((res) => {});
            }}
          >
            addMultiBlocks
          </button>
        );

        addControl(
          <button key="updateDocBlock"
            onClick={() => {
              monday
                .execute("updateDocBlock", {
                  blockId: firstFocusedBlockId,
                  content: textBlockContent,
                })
                .then((res) => {});
            }}
          >
            updateDocBlock
          </button>
        );

        addControl(
          <button key="openAppOnFirstTextualSelectedBlock"
            onClick={() => {
              monday
                .execute("openAppOnFirstTextualSelectedBlock")
                .then((res) => {});
            }}
          >
            openAppOnFirstTextualSelectedBlock
          </button>
        );
      }
      break;
    case "AppFeatureAiDocSlashCommand":
      {
        addControl(
          <button key="addMultiBlocks"
            onClick={() => {
              monday
                .execute("addMultiBlocks", {
                  blocks: [
                    textBlockObject("Text to insert after specific block"),
                  ],
                  afterBlockId: firstFocusedBlockId,
                })
                .then((res) => {});
            }}
          >
            addMultiBlocks
          </button>
        );

        addControl(
          <button key="moveToNextSelectedTextualBlock"
            onClick={() => {
              monday
                .execute("moveToNextSelectedTextualBlock")
                .then((res) => {});
            }}
          >
            moveToNextSelectedTextualBlock
          </button>
        );

        addControl(
          <button key="moveToPrevSelectedTextualBlock"
            onClick={() => {
              monday
                .execute("moveToPrevSelectedTextualBlock")
                .then((res) => {});
            }}
          >
            moveToPrevSelectedTextualBlock
          </button>
        );
      }
      break;
  }
}

  return controllersDiv;
}

const ContextExplorerExample = () => {
  const [context, setContext] = useState();

  useEffect(() => {
    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen("context", (res) => {
      console.log({ event: "listen", target: "context", res });
      setContext(res.data);
    });
  }, []);

  const textareaContent = context
    ? JSON.stringify(context, 2, 2)
    : "still loading";

  const controllersDiv = addControllerButtons(context);

  return (
    <div className="App">
      <textarea value={textareaContent} readOnly={true}/>
      <div className="ControlPanel">{controllersDiv}</div>
    </div>
  );
};

export default ContextExplorerExample;
