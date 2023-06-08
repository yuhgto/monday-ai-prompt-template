import { useState, useEffect } from "react";
import {
  executeMondayApiCall,
  MondayApiResponse,
} from "@/helpers/monday-api-helpers";
import { AppContextType } from "@/types/context-type";

export default function useBoardColumns(context: AppContextType | undefined) {
  const [boardColumns, setBoardColumns] =
    useState<{ id: string; type: string; title: string }[]>();

  useEffect(() => {
    // debugger;
    if (!boardColumns && context) {
      const board = context?.iframeContext?.boardId ?? context?.iframeContext?.boardIds ?? [];
      getBoardColumns(board)
        .then((res: MondayApiResponse | undefined) => {
          if (res?.is_success) {
            console.log("res:", res);
            const result = res.data.boards[0].columns;
            setBoardColumns(result);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [boardColumns, context]);

  return boardColumns;
}

/**
 * Converts the array emitted by the useBoardColumns hook into
 * a format compatible with the input-with-tags component
 * @param columns An array of board columns
 * @returns 
 */
export function mapBoardColumnsToTagsOptions(
  columns: { id: string; type: string; title: string }[] | undefined
): { id: string; value: string }[] | undefined {
  const result = columns?.reduce(
    (filtered: { id: string; value: string }[], column) => {
      filtered?.push({
        id: column.id,
        value: column.title,
      });
      return filtered;
    },
    []
  );
  return result;
}

/**
 * Converts the array emitted by the useBoardColumns hook into
 * a format compatible with the dropdown component. 
 * @param columns An array of board columns
 * @returns An array of text columns compatible with the dropdown component
 */
export function mapBoardColumnsToDropdownOptions(
  columns: { id: string; type: string; title: string }[] | undefined
) {
  const result = columns?.reduce(function reduceToTextColumns(
    filtered: Record<string, any>[],
    column: Record<string, any>
  ) {
    if (column.type === "text" || column.type === "long-text") {
      filtered.push({
        label: column.title,
        value: column.id,
      });
    }
    return filtered;
  },
  []);
  return result ?? [];
}

function getBoardColumns(board: number | number[]) {
  return executeMondayApiCall(
    `query($board:[Int!]) {boards(ids:$board){columns{id type title}}}`,
    { variables: { board } }
  );
}
