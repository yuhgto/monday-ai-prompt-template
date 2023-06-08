/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useContext, useMemo } from "react";

import { AppContext } from "@/components/context-provider/app-context-provider";
import TextInputWithTagsAndSend from "@/components/text-input-with-tags/text-input-with-tags";
import AiAppFooter from "@/components/ai-footer/ai-footer";
import SelectColumn from "@/components/select-column";
import { useAiApi, PromptsApiPayloadType } from "@/hooks/useAiApi";
import useBoardColumns, { mapBoardColumnsToDropdownOptions, mapBoardColumnsToTagsOptions } from "@/hooks/useBoardColumns";
import { useSuccessMessage } from "@/hooks/useSuccessMessage";
import classes from "@/examples/livestream-example/styles.module.scss";
import {
  executeMondayApiCall
} from "@/helpers/monday-api-helpers";
import { Modes } from "@/types/layout-modes";

import { showErrorMessage } from "@/helpers/monday-actions";
import { replaceTagsWithColumnValues } from "@/helpers/tags-helpers";
import useBoardGroups, {mapBoardGroupsToDropdownOptions} from "@/hooks/useBoardGroups";
import SelectGroup from "@/components/select-group";
import { exec } from "child_process";

type Props = {
  initialInput?: string;
};


type DropdownSelection = {
  id: string;
  value: string;
};

// @ts-ignore
async function getItemsAndColumnValues(selectedGroup, context, columnIds) {
  return await executeMondayApiCall(
  `query ($boardId:[Int], $columnIds:[String], $groupId: [String]) { boards (ids:$boardId) { groups(ids:$groupId) { items { id column_values (ids:$columnIds) { text id } } } } }`,
  {
    variables: {
      columnIds,
      boardId: context?.iframeContext?.boardId ?? [],
      groupId: selectedGroup,
    },
  }
);}

function getColumnIdsFromInputTags(input: string) {
  const findTaggedColumnsRegex = new RegExp("\\[\\[.*?\\]\\]", "g");
    const taggedColumns = [...input.matchAll(findTaggedColumnsRegex)].map(
      (match) => {
        const data = JSON.parse(match[0])[0][0];
        const index = match.index;
        const { length } = match[0];
        const columnId = data.id;
        const columnTitle = data.value;
        return { columnId, columnTitle, length, index };
      }
    );
    var itemColumnValuesFromMonday;

    // get values of that column
    return taggedColumns.map((col) => col.columnId);
}

const LivestreamExample = ({ initialInput = "" }: Props): JSX.Element => {
  const context = useContext(AppContext);
  const [mode, setMode] = useState<Modes>(Modes.request);
  const sessionToken = context?.sessionToken ?? "";

  const aiApiStatus = useAiApi("/openai/prompts", sessionToken);
  
  const [outputColumn, setOutputColumn] = useState<any>();
  const [selectedGroup, setSelectedGroup] = useState<string>();
  
  const boardColumns = useBoardColumns(context);
  const boardColumnsForTagsComponent = mapBoardColumnsToTagsOptions(boardColumns);
  const boardColumnsForDropdownComponent = mapBoardColumnsToDropdownOptions(boardColumns);
  const boardGroups = useBoardGroups(context);
  const boardGroupsForDropdownComponent = mapBoardGroupsToDropdownOptions(boardGroups) ?? [];
  const canRenderInput = !!boardColumnsForTagsComponent;
  
  const [success, setSuccess] = useState<boolean>(false);
  const loading = aiApiStatus.loading || mode == Modes.response;
  const error = aiApiStatus.error;
  useSuccessMessage(success);

  function handleColumnSelect(e: DropdownSelection) {
      setOutputColumn(e?.value);
    }

  function handleGroupSelect(e: DropdownSelection) {
    setSelectedGroup(e?.value);
  }

  const handleSend = useCallback(
    async (input: string) => {
      setMode(Modes.response);
      console.log(`Event: Send button clicked. Input string:\n`, input);

      // TODO: finish handleSend function

      setSuccess(!!success)
      setMode(Modes.request);
    },
    [aiApiStatus, selectedGroup, context, outputColumn, error]
  );

  return (
    <div className={classes.main}>
      <div className={classes.dropdownContainer}>
        {/* TODO: Add dropdowns here */}
      </div>
      {canRenderInput && (
        <TextInputWithTagsAndSend
          onSend={handleSend}
          validTags={boardColumnsForTagsComponent ?? []}
          initialInput={initialInput}
          mode={mode}
          setMode={setMode}
          loading={loading}
          success={success}
          error={error}
        />
      )}
      <div className={classes.footer}>
        <AiAppFooter />
      </div>
    </div>
  );
};

export default LivestreamExample;
