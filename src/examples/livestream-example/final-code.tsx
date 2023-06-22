import { useState, useCallback, useContext, useMemo } from "react";
import dynamic from "next/dynamic";
import { Dropdown } from "monday-ui-react-core"

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
      boardId: context?.iframeContext?.boardId ?? context?.iframeContext?.boardIds ?? [],
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

const LivestreamExampleFinal = ({ initialInput = "" }: Props): JSX.Element => {
  const [isDropdownLoaded, setIsDropdownLoaded] = useState<boolean>(false);

  const context = useContext(AppContext);
  const [mode, setMode] = useState<Modes>(Modes.request);
  const sessionToken = context?.sessionToken ?? "";

  const aiApiStatus = useAiApi("/openai/prompts", sessionToken);
  
  const [outputColumn, setOutputColumn] = useState<any>();
  const [selectedGroup, setSelectedGroup] = useState<string>();
  
  const boardColumns = useBoardColumns(context);
  const boardColumnsForTagsComponent = mapBoardColumnsToTagsOptions(boardColumns);
  const boardColumnsForDropdownComponent = mapBoardColumnsToDropdownOptions(boardColumns);
  const canRenderInput = !!boardColumnsForTagsComponent;

  const boardGroups = useBoardGroups(context);
  const boardGroupsForDropdownComponent = mapBoardGroupsToDropdownOptions(boardGroups) ?? [];
  
  const [success, setSuccess] = useState<boolean>(false);
  const loading = aiApiStatus.loading || mode == Modes.response;
  const error = aiApiStatus.error;
  useSuccessMessage(success);

  console.log(context);
  function handleColumnSelect(e: DropdownSelection) {
      setOutputColumn(e?.value);
    }

  function handleGroupSelect(e: DropdownSelection) {
    setSelectedGroup(e?.value);
  }

  const handleSend = useCallback(
    async (input: string) => {
      console.log(`Sending input:\n`, input);
      setMode(Modes.response);

      const columnIds = getColumnIdsFromInputTags(input);

      var itemColumnValuesFromMonday = await getItemsAndColumnValues(selectedGroup, context, columnIds);
      
      if (itemColumnValuesFromMonday.is_success) {
        const { items } = itemColumnValuesFromMonday.data.boards[0].groups[0]
        var prompts: string[] = items.map((item: any) => {
            return replaceTagsWithColumnValues(input, item.column_values);
            // return input
          });
        var itemIdsList: {id:string}[] = itemColumnValuesFromMonday?.data.boards[0].groups[0].items.map((x: any) => x.id)
      } else {
        showErrorMessage("Failed getting column values from monday", 3000);
        setMode(Modes.request);
        return null;
      }

      const aiApiResponse = await aiApiStatus.fetchData({
        prompts: prompts, // or promptsWithColumnValues,
        items: itemIdsList,
        n: 1, // or itemsFromMonday.length 
      });

      if (aiApiResponse.length === 0 || error) {
        showErrorMessage("Something went wrong", 3000);
        setMode(Modes.request);
      } else {
        // update items on board
        let itemUpdates = aiApiResponse.map(
          async (result: {item:string, result:string}) => {
            return await executeMondayApiCall(
              `mutation ($column:String!,$boardId:Int!, $itemId:Int!, $value:String!) {change_simple_column_value (column_id:$column, board_id:$boardId, item_id:$itemId, value:$value) {id }}`,
              {
                variables: {
                  column: outputColumn,
                  boardId: context?.iframeContext?.boardId ?? context?.iframeContext?.boardIds ?? [],
                  itemId: parseInt(result.item),
                  value: result.result,
                },
              }
            );
          }
        );
        let success = await Promise.all(itemUpdates);
        setSuccess(!!success);
        setMode(Modes.request);
      }
    },
    [aiApiStatus, selectedGroup, context, outputColumn, error]
  );

  return (
    <div className={classes.main}>
        <div className={classes.dropdownContainer}>
        <Dropdown
          options={boardGroupsForDropdownComponent}
          onChange={handleGroupSelect}
          placeholder="Select a group"
          size="small"
        />
        <Dropdown
          options={boardColumnsForDropdownComponent}
          onChange={handleColumnSelect}
          placeholder={"Select an output column"}
          size="small"
          />
        </div>
      {canRenderInput && (
        <TextInputWithTagsAndSend
          className={classes.inputContainer}
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

export default LivestreamExampleFinal;
