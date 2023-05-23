import { useState, useCallback, useContext, useMemo } from "react";

import { AppContext } from "@/components/context-provider/app-context-provider";
import TextInputWithTagsAndSend from "@/components/text-input-with-tags/text-input-with-tags";
import AiAppFooter from "@/components/ai-footer/ai-footer";
import SelectColumn from "@/components/select-column";
import { useAiApi, PromptsApiPayloadType } from "@/hooks/useAiApi";
import useBoardColumns, { mapBoardColumnsToDropdownOptions, mapBoardColumnsToTagsOptions } from "@/hooks/useBoardColumns";
import { useSuccessMessage } from "@/hooks/useSuccessMessage";
import classes from "@/examples/prompt-with-column-mapping/prompt-with-column-mapping.module.scss";
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

const PromptWithColumnMapping = ({ initialInput = "" }: Props): JSX.Element => {
  const context = useContext(AppContext);
  const [mode, setMode] = useState<Modes>(Modes.request);

  const [outputColumn, setOutputColumn] = useState<any>();
  const [selectedGroup, setSelectedGroup] = useState<string>();
  const [success, setSuccess] = useState<boolean>(false);

  useSuccessMessage(success);

  const boardColumns = useBoardColumns(context);
  const boardColumnsForTagsComponent = useMemo(() => {
    return mapBoardColumnsToTagsOptions(boardColumns);
  }, [boardColumns]);
  const boardColumnsForDropdownComponent = useMemo(() => {
    return mapBoardColumnsToDropdownOptions(boardColumns);
  }, [boardColumns]);

  const canRenderInput = useMemo(() => {
    return !!boardColumnsForTagsComponent;
  }, [boardColumnsForTagsComponent]);

  const boardGroups = useBoardGroups(context);
  const boardGroupsForDropdownComponent = mapBoardGroupsToDropdownOptions(boardGroups) ?? [];

  const sessionToken = context?.sessionToken ?? "";

  const aiApiStatus = useAiApi("/openai/prompts", sessionToken);

  const loading = useMemo(() => {
    return aiApiStatus.loading || mode == Modes.response;
  }, [aiApiStatus, mode]);
  const error = aiApiStatus.error;

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
      // check if a column is mapped
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

      const columnIds = taggedColumns.map((col) => col.columnId);
      // TODO: rename to execute or runMondayApiCall
      itemColumnValuesFromMonday = await executeMondayApiCall(
        `query ($boardId:[Int], $columnIds:[String], $groupId: [String]) { boards (ids:$boardId) { groups(ids:$groupId) { items { id column_values (ids:$columnIds) { text id } } } } }`,
        {
          variables: {
            columnIds,
            boardId: context?.iframeContext?.boardId ?? [],
            groupId: selectedGroup,
          },
        }
      );
      // replace tag with column value
      if (itemColumnValuesFromMonday.is_success) {
        var mappedColumnValues =
          itemColumnValuesFromMonday.data.boards[0].groups[0].items.map((item: any) => {
            return replaceTagsWithColumnValues(input, item.column_values);
          });
        console.log(mappedColumnValues);
      } else {
        showErrorMessage("Failed getting column values from monday", 3000);
      }

      var itemsFromMonday = itemColumnValuesFromMonday?.is_success
        ? itemColumnValuesFromMonday?.data.boards[0].groups[0].items.map((x: any) => x.id)
        : [];

      const aiApiPayload: PromptsApiPayloadType = {
        prompts: mappedColumnValues,
        items: itemsFromMonday,
        n: 1,
      };

      // send info to backend
      const aiApiResponse = await aiApiStatus.fetchData(aiApiPayload);

      // catch errors
      if (aiApiResponse.length === 0) {
        showErrorMessage("Something went wrong", 3000);
        setMode(Modes.request);
      } else if (error) {
        showErrorMessage("Something went wrong", 3000);
        setMode(Modes.request);
      } else {
        let itemUpdates = aiApiResponse.map(
          async (result: Record<string, any>) => {
            console.log("pushing data to:", result);
            return await executeMondayApiCall(
              `mutation ($column:String!,$boardId:Int!, $itemId:Int!, $value:String!) {change_simple_column_value (column_id:$column, board_id:$boardId, item_id:$itemId, value:$value) {id }}`,
              {
                variables: {
                  column: outputColumn,
                  boardId: context?.iframeContext?.boardId ?? [],
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
        <SelectGroup 
          groups={boardGroupsForDropdownComponent}
          onChange={handleGroupSelect}
        />
        <SelectColumn
          // className={classes.columnsDropdown}
          columns={boardColumnsForDropdownComponent}
          onChange={handleColumnSelect}
          placeholder="Select a output column"
        />
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

export default PromptWithColumnMapping;
