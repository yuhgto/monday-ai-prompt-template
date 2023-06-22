import dynamic from "next/dynamic";
import React, { useContext } from "react";
// import { ChatMessage, ChatRole } from "@mondaydotcomorg/react-hooks";
import { useCallback, useEffect, useState } from "react";
import mondaySdk from "monday-sdk-js";

import { showErrorMessage, showSuccessMessage } from "@/helpers/monday-actions";
import { Dropdown } from "monday-ui-react-core"

import { useAiApi } from "@/hooks/useAiApi";
import classes from "./prompt-layout.module.scss";
import TextInputWithSend from "../text-input-with-send/text-input-with-send";
import SelectGroup from "@/components/select-group";
// import { ChatMessagesContainer } from "../chat-messages/chat-messages-container";

// import ChatAppConfigService from "../../services/chat-config-service";

// import { AppChatConfigService } from 'types';
import { Modes } from "@/types/layout-modes";
import {MondayApiResponse, MondayApiResponseSuccess, MondayApiResponseFailure, executeMondayApiCall} from "@/helpers/monday-api-helpers";
import { AppContext } from "@/components/context-provider/app-context-provider";
import { StringLiteral } from "typescript";
import SelectColumn from "../select-column";

const monday = mondaySdk();

type Props = {
  inputPlaceholder: () => string;
  assistantAction: () => void;
  closeDialog?(): void;
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

function getBoardColumns(board: number | number[]) {
  return executeMondayApiCall(
    `query($board:[Int!]) {boards(ids:$board){columns{id type title}}}`,
    { variables: { board } }
  );
}

function mapBoardColumnsToDropdownOptions(columns: Record<string, any>) {
  return columns.data.boards[0].columns.reduce(
    function reduceToTextColumns(
      filtered: Record<string, any>[],
      column: Record<string, any>
    ) {
      if (column.type === "text") {
        filtered.push({
          label: column.title,
          value: column.id,
        });
      }
      return filtered;
    }, []);
}

function getBoardGroups(boardId: number | number[]): Record<string, any> {
  return executeMondayApiCall(
    `query($boardId:[Int!]) { boards(ids:$boardId) { groups { id title} } }`,
    {
      variables: { boardId },
    }
  ).then((res) => {
    if (res?.is_success) {
      return res;
    } else {
      console.error(res);
      showErrorMessage('Could not load groups', 3000);
    }
  });
}

function mapBoardGroupsToDropdownOptions(boardGroups: MondayApiResponse) {
  if (!boardGroups.is_success) {
    return null;
  }
  return boardGroups?.data.boards[0].groups.map(
    (group: Record<string, any>) => {
      return { label: group.title, value: group.id };
    }
  );
}

const BasePromptLayout = ({ initialInput = "" }: Props): JSX.Element => {
  // TODO: use reducer for this state
  const context = useContext(AppContext);
  const [mode, setMode] = useState<Modes>(Modes.request);
  const [success, setSuccess] = useState<boolean>(false);
  const [boardColumns, setBoardColumns] = useState<any>();
  const [boardGroups, setBoardGroups] = useState<any>();
  const [selectedGroup, setSelectedGroup] = useState<string>();
  const [selectedColumn, setSelectedColumn] = useState<string>();

  const sessionToken = context?.sessionToken ?? "";

  const { loading, data, error, fetchData } = useAiApi('/', sessionToken);

  function handleColumnSelect(e: DropdownSelection) {
    setSelectedColumn(e?.value);
  }

  function handleGroupSelect(e: DropdownSelection) {
    setSelectedGroup(e?.value);
  }

  // fill second dropdown with groups from board
  useEffect(() => {
    if (!boardGroups && context) {
      const board = context?.iframeContext?.boardId ?? [];
      getBoardGroups(board)
        .then((res: MondayApiResponse) => {
          const groupsForDropdown = mapBoardGroupsToDropdownOptions(res);
          setBoardGroups(groupsForDropdown);
        })
        .catch((err: any) => console.error(err));
    }
  }, [context, boardGroups]);

  // fill first dropdown with groups from board
  useEffect(() => {
    if (!boardColumns && context) {
      const board = context?.iframeContext?.boardId ?? [];
      getBoardColumns(board)
        .then((res: MondayApiResponse | undefined) => {
          if (res?.is_success) {
            const columnsForDropdown = mapBoardColumnsToDropdownOptions(res);
            setBoardColumns(columnsForDropdown);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [boardColumns, context]);

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

      const groupItems: MondayApiResponse = await getItemsFromGroup(selectedGroup, board);

      if (!groupItems.is_success) {
        showErrorMessage("Could not retrieve items from board.", 3000);
        return { error: true };
      }

      const aiApiResponse = await fetchData({
        boardId: board,
        groupId: selectedGroup,
        columnId: selectedColumn,
        items: groupItems.data.boards[0].groups[0].items,
        prompt: input,
      })

      if (aiApiResponse.length === 0 || !aiApiResponse.length) {
        showErrorMessage("Selected group has no items.", 3000);
        return [];
      } else {
        let itemUpdates = aiApiResponse.map(async (result: Record<string, any>) => {
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
        });
        let success = await Promise.all(itemUpdates);
        if (success) {
          console.log('promises:', success)
          setMode(Modes.request);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 5000);
        }
      }
    },
    [fetchData, context, selectedColumn, selectedGroup]
  );

  useEffect(() => {
    if (success) {
      showSuccessMessage('Items were updated!', 3000)
    }
  })

  return (
    <div className={classes.main}>
      <div className={classes.dropdownContainer}>
        <SelectColumn
          className={classes.columnsDropdown}
          columns={boardColumns}
          onChange={handleColumnSelect}
        />
        <SelectGroup
          className={classes.groupsDropdown}
          groups={boardGroups}
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
      {/* <div className={classes.footer}>
        <p>AI responses could be wrong, please review them.</p>
      </div> */}
    </div>
  );
};

export default BasePromptLayout;
