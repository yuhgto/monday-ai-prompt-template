import React from "react";
import { useState, useEffect } from "react";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import "./context-explorer-example.css";
import { Button, Flex } from "monday-ui-react-core";
//Explore more Monday React Components here: https://style.monday.com/

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();
const docsAppsFeatures = ["AppFeatureAiDocTopBar", "AppFeatureAiDocQuickStart", "AppFeatureAiDocContextualMenu", "AppFeatureAiDocSlashCommand"]
const buildUniqueKey = (name) => {
    return `${name}${Math.random()}`;
}
function addControllerButtons(context) {
    let controllersDiv = [];
    function addControl(dom) {
        controllersDiv.push(dom);
        controllersDiv.push(<br key={buildUniqueKey("br")} />);
    }
    function addApiButton() {
        return addControl(
            <Button size={Button.sizes.XS} key={buildUniqueKey("api-call")}
                    onClick={() => {
                        monday
                            .api(`query { me { name } }`)
                            .then((res) => {
                                console.log("api:", res);
                                monday.execute("notice", {
                                    message: res?.data?.me?.name,
                                    type: "success", // or "error" (red), or "info" (blue)
                                    timeout: 10000,
                                });
                            })
                            .catch((err) => {
                                monday.execute("notice", {
                                    message:err?.data?.errors?.map(e => e.message).join(', '),
                                    type: "error", // or "error" (red), or "info" (blue)
                                    timeout: 10000,
                                });
                            });
                    }}
            >
                API call
            </Button>
        );
    }

    function addTitle() {
        return addControl(<label key={buildUniqueKey("title")}>Available actions:</label>);
    }

    addTitle();
    addApiButton();
    addControl(
        <Button size={Button.sizes.XS} key={buildUniqueKey("closeDialog")}
                onClick={() => {
                    monday.execute("closeDialog");
                }}
        >
            Close dialog
        </Button>
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
        const firstFocusedBlockId = context?.focusedBlocks?.[0].id;

        if (docsAppsFeatures.includes(appFeatureType)) {
            const workspaceId = context?.workspaceId;
            addControl(
                <Button size={Button.sizes.XS} key={buildUniqueKey("api-call")}
                        onClick={() => {
                            monday
                                .api(`{
  docs(workspace_ids: [${workspaceId}]) {
    id
    name
    blocks {
      created_at
      content
    }
  }
}`)
                                .then((res) => {
                                    console.log("get all workspace docs via API:", res);
                                    monday.execute("notice", {
                                        message: 'check the browser console',
                                        type: "success", // or "error" (red), or "info" (blue)
                                        timeout: 10000,
                                    });
                                })
                                .catch((err) => {
                                    monday.execute("notice", {
                                        message: err?.data?.errors?.map(e => e.message).join(', '),
                                        type: "error", // or "error" (red), or "info" (blue)
                                        timeout: 10000,
                                    });
                                });
                        }}
                >
                    API get all workspace docs
                </Button>
            );

            const docId = context?.docId;
            addControl(
                <Button size={Button.sizes.XS} key={buildUniqueKey("api-call")}
                        onClick={() => {
                            const textBlockContent = textBlockObject("content to insert").content;
                            monday
                                .api(`mutation {
  create_doc_block(doc_id: ${docId}, type: normal_text, content: "${JSON.stringify(textBlockContent).replaceAll('"', '\\"')}") {
    id,
    content
  }
}`)
                                .then((res) => {
                                    console.log("Inserted block via API:", res);
                                    monday.execute("notice", {
                                        message: 'check the browser console',
                                        type: "success", // or "error" (red), or "info" (blue)
                                        timeout: 10000,
                                    });
                                })
                                .catch((err) => {
                                    monday.execute("notice", {
                                        message: err?.data?.errors?.map(e => e.message).join(', '),
                                        type: "error", // or "error" (red), or "info" (blue)
                                        timeout: 10000,
                                    });
                                });
                        }}
                >
                    API add block to doc
                </Button>
            );
        }
        const checkIfDocMethodSupported = (methodName) => {
            if (context?.additionalSdkMethodsList?.includes(methodName)) return true
            return false
        }
        const appFeatureAiDocTopBarButtons = () => {
            if (checkIfDocMethodSupported("addMultiBlocks")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("addMultiBlocks")}
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
                    </Button>
                );

            }
        }
        const appFeatureAiDocQuickStartButtons = () => {
            if (checkIfDocMethodSupported("AppFeatureAiDocQuickStart")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("AppFeatureAiDocQuickStart")}
                            onClick={() => {
                                monday
                                    .execute("addMultiBlocks", {
                                        blocks: [
                                            textBlockObject("This will be added to a new empty doc"),
                                        ],
                                    })
                                    .then((res) => {
                                    });
                            }}
                    >
                        addMultiBlocks
                    </Button>
                );
            }

            if (checkIfDocMethodSupported("addMultiBlocks")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("addMultiBlocksUndo")}
                            onClick={() => {
                                monday
                                    .execute("addMultiBlocks", {
                                        blocks: [
                                            textBlockObject("Text to insert after specific block"),
                                        ],
                                        successNoticeMsg: 'Text added ',
                                    })
                                    .then((res) => {
                                    });
                            }}
                    >
                        addMultiBlocks(With undo)
                    </Button>
                );
            }

            const html = `${appFeatureType} <h1>Marketing Brief</h1>\n<h2>Campaign purpose</h2>\n<span>List a purpose</span></html> ${Date.now().toString()}`;

            if (checkIfDocMethodSupported("addMultiBlocksFromHtml")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("addMultiBlocksFromHtml")}
                            onClick={() => {
                                monday
                                    .execute("addMultiBlocksFromHtml", {html: html})
                                    .then((res) => {
                                    });
                            }}
                    >
                        addMultiBlocksFromHtml
                    </Button>
                );
            }
        }
        const appFeatureAiDocContextualMenuButtons = () =>  {
            // example for getting the first focused block id


            if (checkIfDocMethodSupported("addMultiBlocks")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("addMultiBlocks")}
                            onClick={() => {
                                monday
                                    .execute("addMultiBlocks", {
                                        blocks: [
                                            textBlockObject("Text to insert after specific block"),
                                        ],
                                        afterBlockId: firstFocusedBlockId,
                                    })
                                    .then((res) => {
                                    });
                            }}
                    >
                        addMultiBlocks
                    </Button>
                );
            }
            if (checkIfDocMethodSupported("updateDocBlock")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("updateDocBlock")}
                            onClick={() => {
                                const textBlockContent = textBlockObject("content to insert").content;
                                monday
                                    .execute("updateDocBlock", {
                                        id: firstFocusedBlockId,
                                        content: textBlockContent,
                                    })
                                    .then((res) => {
                                    });
                            }}
                    >
                        updateDocBlock
                    </Button>
                );
            }
            if (checkIfDocMethodSupported("openAppOnFirstTextualSelectedBlock")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("openAppOnFirstTextualSelectedBlock")}
                            onClick={() => {
                                monday
                                    .execute("openAppOnFirstTextualSelectedBlock")
                                    .then((res) => {
                                    });
                            }}
                    >
                        openAppOnFirstTextualSelectedBlock
                    </Button>
                );
            }
            if (checkIfDocMethodSupported("moveToNextSelectedTextualBlock")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("moveToNextSelectedTextualBlock")}
                            onClick={() => {
                                monday
                                    .execute("moveToNextSelectedTextualBlock")
                                    .then((res) => {
                                    });
                            }}
                    >
                        moveToNextSelectedTextualBlock
                    </Button>
                );
            }
            if (checkIfDocMethodSupported("moveToPrevSelectedTextualBlock")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("moveToPrevSelectedTextualBlock")}
                            onClick={() => {
                                monday
                                    .execute("moveToPrevSelectedTextualBlock")
                                    .then((res) => {
                                    });
                            }}
                    >
                        moveToPrevSelectedTextualBlock
                    </Button>
                );
            }
            if (checkIfDocMethodSupported("replaceHighlightText")) {
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("replaceHighlightText")}
                            onClick={() => {
                                monday
                                    .execute("replaceHighlightText", {
                                        text: "Replace Highlight Text",
                                    })
                                    .then((res) => {
                                    });
                            }}
                    >
                        replaceHighlightText
                    </Button>
                );
            }
        }
        const appFeatureAiDocSlashCommandButtons = () => {
            {
                if (checkIfDocMethodSupported("addMultiBlocks")) {
                    addControl(
                        <Button size={Button.sizes.XS} key={buildUniqueKey("addMultiBlocks")}
                                onClick={() => {
                                    monday
                                        .execute("addMultiBlocks", {
                                            blocks: [
                                                textBlockObject("Text to insert after specific block"),
                                            ],
                                            afterBlockId: firstFocusedBlockId,
                                        })
                                        .then((res) => {
                                        });
                                }}
                        >
                            addMultiBlocks
                        </Button>
                    );
                }
                if (checkIfDocMethodSupported("moveToNextSelectedTextualBlock")) {
                    addControl(
                        <Button size={Button.sizes.XS} key={buildUniqueKey("moveToNextSelectedTextualBlock")}
                                onClick={() => {
                                    monday
                                        .execute("moveToNextSelectedTextualBlock")
                                        .then((res) => {
                                        });
                                }}
                        >
                            moveToNextSelectedTextualBlock
                        </Button>
                    );
                }
                if (checkIfDocMethodSupported("moveToPrevSelectedTextualBlock")) {
                    addControl(
                        <Button size={Button.sizes.XS} key={buildUniqueKey("moveToPrevSelectedTextualBlock")}
                                onClick={() => {
                                    monday
                                        .execute("moveToPrevSelectedTextualBlock")
                                        .then((res) => {
                                        });
                                }}
                        >
                            moveToPrevSelectedTextualBlock
                        </Button>
                    );
                }
            }
        }
        switch (appFeatureType) {
            case "AppFeatureAiBoardMainMenuHeader":
                break;
            case "AppFeatureAiItemUpdateActions":
                addControl(
                    <Button size={Button.sizes.XS} key={buildUniqueKey("updatePostContentAction")}
                            onClick={() => {
                                monday.execute("updatePostContentAction", {
                                    suggestedRephrase: "<u>Time</u> " + Date.now().toString(),
                                });
                            }}
                    >
                        updatePostContentAction
                    </Button>
                );
                break;
            case "AppFeatureAiDocTopBar":
                appFeatureAiDocTopBarButtons()
                break;
            case "AppFeatureAiDocQuickStart":
                appFeatureAiDocQuickStartButtons();
                break;
            case "AppFeatureAiDocContextualMenu":
                appFeatureAiDocContextualMenuButtons();
                break;
            case "AppFeatureAiDocSlashCommand":
                appFeatureAiDocSlashCommandButtons();
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
            <Flex direction={Flex.directions.COLUMN} className="ControlPanel">{controllersDiv}</Flex>
        </div>
    );
};

export default ContextExplorerExample;

