import dynamic from "next/dynamic";
import React, { useContext, useMemo } from "react";
// import { ChatMessage, ChatRole } from "@mondaydotcomorg/react-hooks";
import { useCallback, useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";

import { showErrorMessage } from "@/helpers/monday-actions";

import { useAiApi } from "@/hooks/useAiApi";
import useBoardGroups, {mapBoardGroupsToDropdownOptions} from "@/hooks/useBoardGroups";
import classes from "./prompt-layout.module.scss";
import TextInputWithSend from "../../components/text-input-with-send/text-input-with-send";
import SelectGroup from "@/components/select-group";
import { useSuccessMessage } from "@/hooks/useSuccessMessage";

import { Modes } from "@/types/layout-modes";
import {
  MondayApiResponse,
  MondayApiResponseSuccess,
  MondayApiResponseFailure,
  executeMondayApiCall,
} from "@/helpers/monday-api-helpers";
import { AppContext } from "@/components/context-provider/app-context-provider";
import SelectColumn from "../../components/select-column";
import useBoardColumns, {mapBoardColumnsToDropdownOptions} from "@/hooks/useBoardColumns";
import { PromptsApiPayloadType } from "@/hooks/useAiApi";

const monday = mondaySdk();

type Props = {
  initialInput?: string;
};

type Dropdown = {
  options: any;
  placeholder: string;
};

type DropdownSelection = {
  id: string;
  value: string;
};

type LayoutState = {
  inputs: Record<string, any>;
  setInputs: (inputs: Record<string, any>) => void;
  mode?: string;
  success?: boolean;
  action: (sessionToken: string) => {
    error: any;
    loading: boolean;
    data: Record<string, any>[];
    fetchData: (body: Record<string, any>) => Record<string, any>[];
  };
};

// TODO: rename this component
const BasePromptLayout = ({ initialInput = "" }: Props): JSX.Element => {
  // TODO: use reducer for this state
  const context = useContext(AppContext);
  const boardColumns = useBoardColumns(context);

  const columnsForDropdown = useMemo(() => {
    return mapBoardColumnsToDropdownOptions(boardColumns) ?? [];
  }, [boardColumns]);

  const boardGroups = useBoardGroups(context);
  const boardGroupsForDropdown = useMemo(() => {
    return mapBoardGroupsToDropdownOptions(boardGroups) ?? [];
  }, [boardGroups]);

  const [mode, setMode] = useState<Modes>(Modes.request);

  const [success, setSuccess] = useState<boolean>(false);
  useSuccessMessage(success);

  const [selectedGroup, setSelectedGroup] = useState<string>();
  const [selectedColumn, setSelectedColumn] = useState<string>();

  const sessionToken = context?.sessionToken ?? "";
  const apiRoute = "/openai/prompts";

  const { loading, data, error, fetchData } = useAiApi(apiRoute, sessionToken);

  function handleColumnSelect(e: DropdownSelection) {
    setSelectedColumn(e?.value);
  }

  function handleGroupSelect(e: DropdownSelection) {
    setSelectedGroup(e?.value);
  }

  function getItemsFromGroup(
    groupId: string | string[],
    boardId: number | number[]
  ) {
    return executeMondayApiCall(
      `query($boardId:[Int!], $groupId:[String!]) {boards(ids:$boardId){groups (ids:$groupId) { items { id } } } }`,
      {
        variables: { groupId, boardId },
      }
    );
  }

  const handleSend = useCallback(
    async (input: string) => {
      if (!selectedGroup) {
        showErrorMessage("Select a group first", 3000);
        return { error: true };
      }
      if (!selectedColumn) {
        showErrorMessage("Select a column first", 3000);
        return { error: true };
      }

      setMode(Modes.response);
      const board = context?.iframeContext?.boardId ?? [];

      // get board items, then send items to backend, then update board with response

      const groupItems: MondayApiResponse = await getItemsFromGroup(
        selectedGroup,
        board
      );

      if (!groupItems.is_success) {
        showErrorMessage("Could not retrieve items from board.", 3000);
        return { error: true };
      }

      const aiApiPayload: PromptsApiPayloadType = {
        items: groupItems.data.boards[0].groups[0].items,
        prompts: input,
        n: groupItems.data.boards[0].groups[0].items.length,
      };

      const aiApiResponse = await fetchData(aiApiPayload);

      if (aiApiResponse.length === 0 || !aiApiResponse.length) {
        showErrorMessage("Selected group has no items.", 3000);
        return [];
      } else {
        let itemUpdates = aiApiResponse.map(
          async (result: Record<string, any>) => {
            return await executeMondayApiCall(
              `mutation ($column:String!,$boardId:Int!, $itemId:Int!, $value:String!) {change_simple_column_value (column_id:$column, board_id:$boardId, item_id:$itemId, value:$value) {id }}`,
              {
                variables: {
                  column: selectedColumn,
                  boardId: board,
                  itemId: parseInt(result.item.id),
                  value: result.result,
                },
              }
            );
          }
        );
        let success = await Promise.all(itemUpdates);
        if (success) {
          console.log("promises:", success);
          setMode(Modes.request);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 5000);
        }
      }
    },
    [fetchData, context, selectedColumn, selectedGroup]
  );

  return (
    <div className={classes.main}>
      <div className={classes.dropdownContainer}>
        <SelectColumn
          className={classes.columnsDropdown}
          columns={columnsForDropdown}
          onChange={handleColumnSelect}
        />
        <SelectGroup
          className={classes.groupsDropdown}
          groups={boardGroupsForDropdown}
          onChange={handleGroupSelect}
        />
      </div>
      <TextInputWithSend
        mode={mode}
        setMode={setMode}
        error={error}
        initialInputValue={initialInput}
        loading={loading || mode == Modes.response}
        success={success}
        onSend={handleSend}
      />
    </div>
  );
};

export default BasePromptLayout;
